import { API_CONFIG } from "./api-config.js";
import { apiState } from "./api-state.js";
import { APIRequestError, APINetworkError, APITimeoutError, APIAbortError } from "./api-errors.js";
import { createRequestId, wait, parseResponse, validateEndpoint } from "./api-helpers.js";
import CommunicationCore from "../communication/communication-core.js";

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

async function executeRequest(endpoint, options = {}){
  validateEndpoint(endpoint);
  if(apiState.pendingRequests >= API_CONFIG.MAX_CONCURRENT_REQUESTS){
    throw new APIRequestError("Maximum concurrent requests reached", "CONCURRENCY_LIMIT");
  }

  const requestId = options.requestId || createRequestId();
  const masterController = new AbortController();
  const externalSignal = options.signal;
  const abortFromExternal = () => masterController.abort();
  if(externalSignal?.aborted) masterController.abort();
  else externalSignal?.addEventListener("abort", abortFromExternal, { once:true });

  const attempts = Math.max(1, Math.min(Number(options.retries) || API_CONFIG.MAX_RETRIES, API_CONFIG.MAX_RETRIES));
  const timeout = Number(options.timeout) > 0 ? Number(options.timeout) : API_CONFIG.DEFAULT_TIMEOUT;
  const retryDelay = Number(options.retryDelay) >= 0 ? Number(options.retryDelay) : API_CONFIG.RETRY_DELAY;
  const fetchOptions = { ...options };
  delete fetchOptions.requestId;
  delete fetchOptions.retries;
  delete fetchOptions.retryDelay;
  delete fetchOptions.timeout;
  delete fetchOptions.signal;

  apiState.pendingRequests += 1;
  apiState.lastRequestAt = Date.now();
  apiState.activeRequests.set(requestId, masterController);
  apiState.abortControllers.set(requestId, masterController);
  CommunicationCore.startRequest(requestId, { endpoint, method:fetchOptions.method || "GET" });

  let finalError = null;
  try{
    for(let attempt = 1; attempt <= attempts; attempt += 1){
      try{
        const response = await fetchWithTimeout({ endpoint, options:fetchOptions }, timeout, masterController.signal);
        const data = await parseResponse(response);
        if(!response.ok){
          throw new APIRequestError(`Request failed with status ${response.status}`, "HTTP_ERROR", { status:response.status, data });
        }
        apiState.diagnostics.requests += 1;
        apiState.diagnostics.successful += 1;
        apiState.lastError = null;
        CommunicationCore.completeRequest(requestId);
        return data;
      } catch(error){
        finalError = normalizeRequestError(error, masterController.signal);
        if(attempt >= attempts || !shouldRetry(finalError)) break;
        apiState.diagnostics.retries += 1;
        await wait(retryDelay);
      }
    }

    apiState.diagnostics.requests += 1;
    if(finalError instanceof APIAbortError) apiState.diagnostics.aborted += 1;
    else apiState.diagnostics.failed += 1;
    apiState.lastError = finalError;
    CommunicationCore.failRequest(requestId, finalError);
    throw finalError;
  } finally {
    externalSignal?.removeEventListener("abort", abortFromExternal);
    apiState.pendingRequests = Math.max(0, apiState.pendingRequests - 1);
    apiState.activeRequests.delete(requestId);
    apiState.abortControllers.delete(requestId);
  }
}

const get = (endpoint, options = {}) => executeRequest(endpoint, { ...options, method:"GET" });
const post = (endpoint, body, options = {}) => executeRequest(endpoint, { ...options, method:"POST", body:JSON.stringify(body), headers:{ "content-type":"application/json", ...(options.headers || {}) } });
const put = (endpoint, body, options = {}) => executeRequest(endpoint, { ...options, method:"PUT", body:JSON.stringify(body), headers:{ "content-type":"application/json", ...(options.headers || {}) } });
const patch = (endpoint, body, options = {}) => executeRequest(endpoint, { ...options, method:"PATCH", body:JSON.stringify(body), headers:{ "content-type":"application/json", ...(options.headers || {}) } });
const remove = (endpoint, options = {}) => executeRequest(endpoint, { ...options, method:"DELETE" });

function abortRequest(requestId){
  const controller = apiState.activeRequests.get(requestId);
  if(!controller) return false;
  controller.abort();
  return true;
}

function abortAllRequests(){
  for(const controller of apiState.activeRequests.values()) controller.abort();
  return true;
}

export { executeRequest, get, post, put, patch, remove, abortRequest, abortAllRequests };

