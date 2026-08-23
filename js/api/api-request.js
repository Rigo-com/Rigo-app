import { API_CONFIG } from "./api-config.js";
import { apiState } from "./api-state.js";
import { APIRequestError, APINetworkError, APITimeoutError, APIAbortError } from "./api-errors.js";
import { parseResponse, validateEndpoint } from "./api-helpers.js";
import Communication from "../communication/index.js";
import { API_EVENTS, emitAPIEvent } from "./api-events.js";

function cloneValue(value){
  try{
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }
  catch{
    return value;
  }
}

function fetchWithTimeout(request, timeout, masterSignal){
  const controller = new AbortController();
  const abortAttempt = () => controller.abort();
  if(masterSignal?.aborted) controller.abort();
  else masterSignal?.addEventListener("abort", abortAttempt, { once:true });

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new APITimeoutError());
      controller.abort();
    }, timeout);
  });

  return Promise.race([
    fetch(request.endpoint, { ...request.options, signal:controller.signal }),
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timer);
    masterSignal?.removeEventListener("abort", abortAttempt);
  });
}

function normalizeRequestError(error, masterSignal){
  if(error instanceof APITimeoutError || error instanceof APIRequestError ||
     error instanceof APINetworkError || error instanceof APIAbortError) return error;
  if(masterSignal?.aborted || error?.name === "AbortError") return new APIAbortError("Request aborted", { cause:error });
  if(error instanceof TypeError) return new APINetworkError("Network request failed", { cause:error });
  return new APIRequestError(error?.message || "Request failed", "REQUEST_ERROR", { cause:error });
}

function shouldRetry(error){
  if(error instanceof APITimeoutError || error instanceof APINetworkError) return true;
  return error instanceof APIRequestError && Number(error.details?.status) >= 500;
}

function createCacheKey(endpoint, fetchOptions){
  return Communication.helpers.createMessageHash(
    JSON.stringify({
      endpoint,
      method:String(fetchOptions.method || "GET").toUpperCase(),
      body:fetchOptions.body ?? null
    })
  );
}

async function parseCommunicationResponse(response, requestId, options, masterSignal){
  if(options.stream === true || typeof options.onChunk === "function"){
    const chunks = [];
    const streamed = await Communication.stream.processStream(response,{
      requestId,
      timeout:Number(options.streamTimeout) > 0
        ? Number(options.streamTimeout)
        : Communication.config.timers.STREAM_TIMEOUT,
      signal:masterSignal,
      onChunk:chunk => {
        chunks.push(chunk);
        if(typeof options.onChunk === "function") options.onChunk(chunk);
      }
    });

    if(!streamed){
      if(masterSignal?.aborted) throw new APIAbortError("Request aborted");
      throw new APIRequestError("Response stream failed", "STREAM_ERROR");
    }

    return chunks.join("");
  }

  return parseResponse(response);
}

async function executeRequest(endpoint, options = {}){
  validateEndpoint(endpoint);
  Communication.initialize();

  const maxConcurrent = Math.min(
    API_CONFIG.MAX_CONCURRENT_REQUESTS,
    Communication.config.limits.MAX_ACTIVE_REQUESTS
  );

  if(apiState.pendingRequests >= maxConcurrent){
    throw new APIRequestError("Maximum concurrent requests reached", "CONCURRENCY_LIMIT");
  }

  const requestId = options.requestId || Communication.helpers.createCommunicationId("api");
  const masterController = Communication.abort.createAbortController(requestId);
  if(!masterController){
    throw new APIRequestError("Unable to allocate request controller", "ABORT_CONTROLLER_LIMIT");
  }

  const externalSignal = options.signal;
  const abortFromExternal = () => masterController.abort();
  if(externalSignal?.aborted) masterController.abort();
  else externalSignal?.addEventListener("abort", abortFromExternal, { once:true });

  const attempts = Math.max(
    1,
    Math.min(
      Number(options.retries) || API_CONFIG.MAX_RETRIES,
      API_CONFIG.MAX_RETRIES,
      Communication.config.limits.MAX_RETRIES
    )
  );

  const timeout = Number(options.timeout) > 0
    ? Number(options.timeout)
    : Math.min(API_CONFIG.DEFAULT_TIMEOUT,Communication.config.timers.REQUEST_TIMEOUT);

  const retryDelay = Number(options.retryDelay) >= 0
    ? Number(options.retryDelay)
    : Communication.config.timers.RETRY_DELAY;

  const fetchOptions = { ...options };
  for(const key of ["requestId","retries","retryDelay","timeout","signal","stream","streamTimeout","onChunk","cache"]){
    delete fetchOptions[key];
  }

  const method = String(fetchOptions.method || "GET").toUpperCase();
  const cacheEnabled = options.cache === true && method === "GET" && Communication.config.features.ENABLE_CACHE;
  const cacheKey = createCacheKey(endpoint,fetchOptions);

  if(cacheEnabled){
    const cached = Communication.storage.getCache(cacheKey);
    if(cached !== null) return cloneValue(cached);
  }

  apiState.pendingRequests += 1;
  apiState.lastRequestAt = Date.now();
  apiState.activeRequests.set(requestId, masterController);
  apiState.abortControllers.set(requestId, masterController);

  if(!Communication.core.startRequest(requestId,{ endpoint, method })){
    apiState.pendingRequests = Math.max(0,apiState.pendingRequests - 1);
    apiState.activeRequests.delete(requestId);
    apiState.abortControllers.delete(requestId);
    Communication.abort.cleanupAbortController(requestId);
    throw new APIRequestError("Communication request registration failed", "COMMUNICATION_LIMIT");
  }

  emitAPIEvent(API_EVENTS.REQUEST_STARTED,{ requestId, endpoint, method });

  let finalError = null;
  try{
    for(let attempt = 1; attempt <= attempts; attempt += 1){
      try{
        const response = await fetchWithTimeout({ endpoint, options:fetchOptions },timeout,masterController.signal);
        const data = await parseCommunicationResponse(response,requestId,options,masterController.signal);

        if(!response.ok){
          throw new APIRequestError(`Request failed with status ${response.status}`,"HTTP_ERROR",{
            status:response.status,
            data
          });
        }

        apiState.diagnostics.requests += 1;
        apiState.diagnostics.successful += 1;
        apiState.lastError = null;
        Communication.core.completeRequest(requestId);
        Communication.storage.registerHash(cacheKey);
        if(cacheEnabled) Communication.storage.setCache(cacheKey,cloneValue(data));

        emitAPIEvent(API_EVENTS.REQUEST_SUCCESS,{
          requestId, endpoint, method, status:response.status, attempt
        });

        return data;
      }
      catch(error){
        finalError = normalizeRequestError(error,masterController.signal);
        if(attempt >= attempts || !shouldRetry(finalError)) break;
        apiState.diagnostics.retries += 1;
        Communication.state.incrementRetries();
        await Communication.helpers.waitCommunication(retryDelay);
      }
    }

    apiState.diagnostics.requests += 1;
    if(finalError instanceof APIAbortError){
      apiState.diagnostics.aborted += 1;
      Communication.abort.abortRequest(requestId);
    }
    else{
      apiState.diagnostics.failed += 1;
      Communication.core.failRequest(requestId,finalError);
    }

    apiState.lastError = finalError;
    emitAPIEvent(
      finalError instanceof APIAbortError ? API_EVENTS.REQUEST_ABORTED : API_EVENTS.REQUEST_FAILED,
      { requestId, endpoint, method, code:finalError?.code, message:finalError?.message }
    );
    throw finalError;
  }
  finally{
    externalSignal?.removeEventListener("abort",abortFromExternal);
    apiState.pendingRequests = Math.max(0,apiState.pendingRequests - 1);
    apiState.activeRequests.delete(requestId);
    apiState.abortControllers.delete(requestId);
    Communication.abort.cleanupAbortController(requestId);
  }
}

const get = (endpoint, options = {}) => executeRequest(endpoint,{ ...options, method:"GET" });
const post = (endpoint, body, options = {}) => executeRequest(endpoint,{ ...options, method:"POST", body:JSON.stringify(body), headers:{ "content-type":"application/json", ...(options.headers || {}) } });
const put = (endpoint, body, options = {}) => executeRequest(endpoint,{ ...options, method:"PUT", body:JSON.stringify(body), headers:{ "content-type":"application/json", ...(options.headers || {}) } });
const patch = (endpoint, body, options = {}) => executeRequest(endpoint,{ ...options, method:"PATCH", body:JSON.stringify(body), headers:{ "content-type":"application/json", ...(options.headers || {}) } });
const remove = (endpoint, options = {}) => executeRequest(endpoint,{ ...options, method:"DELETE" });

function abortRequest(requestId){
  const aborted = Communication.abort.abortRequest(requestId);
  const controller = apiState.activeRequests.get(requestId);
  if(controller && !controller.signal.aborted) controller.abort();
  return aborted || Boolean(controller);
}

function abortAllRequests(){
  Communication.abort.abortAllRequests();
  for(const controller of apiState.activeRequests.values()){
    if(!controller.signal.aborted) controller.abort();
  }
  return true;
}

export { executeRequest, get, post, put, patch, remove, abortRequest, abortAllRequests };
