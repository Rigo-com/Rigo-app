// =====================================
// RIGO AI
// API REQUEST
// NETWORK REQUEST ENGINE
// =====================================

import {
  API_CONFIG
}
from "./api-config.js";

import {
  apiState
}
from "./api-state.js";

import {
  APIRequestError,
  APINetworkError,
  APITimeoutError
}
from "./api-errors.js";

import {
  createRequestId,
  wait,
  parseResponse,
  validateEndpoint,
  throwIfAborted
}
from "./api-helpers.js";

import CommunicationCore
from "../communication/communication-core.js";


// =====================================
// TIMEOUT
// =====================================

async function fetchWithTimeout(
  callback,
  timeout,
  controller
){

  let timeoutId = null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        controller?.abort();

        reject(
          new APITimeoutError()
        );

      },timeout);

    });

    return await Promise.race([
      callback(),
      timeoutPromise
    ]);

  }
  finally{

    if(timeoutId){
      clearTimeout(timeoutId);
    }

  }

}


// =====================================
// EXECUTE
// =====================================

async function executeRequest(
  options = {}
){

  validateEndpoint(
    options.endpoint
  );

  const requestId =
  createRequestId();

  const timeout =
  Number.isFinite(options.timeout)
    ? options.timeout
    : API_CONFIG.DEFAULT_TIMEOUT;

  const retries =
  Number.isFinite(options.retries)
    ? Math.max(1,options.retries)
    : Math.max(1,API_CONFIG.MAX_RETRIES);

  const controller =
  new AbortController();

  const requestMeta = {
    endpoint:options.endpoint,
    method:options.method || "GET",
    startedAt:Date.now()
  };

  apiState.pendingRequests++;
  apiState.activeRequests.set(
    requestId,
    controller
  );
  apiState.lastRequestAt =
  Date.now();

  try{
    CommunicationCore
    .startRequest(
      requestId,
      requestMeta
    );
  }
  catch{}

  const startedAt =
  Date.now();

  try{

    for(
      let attempt = 1;
      attempt <= retries;
      attempt++
    ){

      try{

        const response =
        await fetchWithTimeout(

          () => fetch(
            options.endpoint,
            {
              method:
              options.method || "GET",

              headers:
              options.headers || {},

              body:
              options.body ?? undefined,

              credentials:
              options.credentials || "same-origin",

              cache:
              options.cache,

              signal:
              controller.signal
            }
          ),

          timeout,
          controller
        );

        const data =
        await parseResponse(
          response
        );

        if(!response.ok){

          const message =
          data?.error ||
          data?.message ||
          "HTTP Error";

          throw new APIRequestError(
            String(message),
            String(response.status)
          );

        }

        apiState.diagnostics.requests++;
        apiState.diagnostics.successful++;
        apiState.lastError = null;

        try{
          CommunicationCore
          .completeRequest(
            requestId
          );
        }
        catch{}

        return Object.freeze({
          ok:true,
          requestId,
          status:response.status,
          data,
          duration:
          Date.now() - startedAt,
          attempt
        });

      }
      catch(error){

        throwIfAborted(error);

        if(attempt < retries){

          apiState.diagnostics.retries++;

          await wait(
            API_CONFIG.RETRY_DELAY
          );

          continue;
        }

        apiState.diagnostics.requests++;
        apiState.diagnostics.failed++;
        apiState.lastError =
        error?.message || String(error);

        try{
          CommunicationCore
          .failRequest(
            requestId,
            apiState.lastError
          );
        }
        catch{}

        throw error;

      }

    }

  }
  catch(error){

    if(error instanceof TypeError){
      throw new APINetworkError();
    }

    throw error;

  }
  finally{

    apiState.pendingRequests =
    Math.max(
      0,
      apiState.pendingRequests - 1
    );

    apiState.activeRequests.delete(
      requestId
    );

  }

}


// =====================================
// METHODS
// =====================================

function get(
  endpoint,
  options = {}
){

  return executeRequest({
    ...options,
    endpoint,
    method:"GET"
  });

}

function post(
  endpoint,
  body = null,
  options = {}
){

  return executeRequest({
    ...options,
    endpoint,
    method:"POST",
    body
  });

}

function put(
  endpoint,
  body = null,
  options = {}
){

  return executeRequest({
    ...options,
    endpoint,
    method:"PUT",
    body
  });

}

function patch(
  endpoint,
  body = null,
  options = {}
){

  return executeRequest({
    ...options,
    endpoint,
    method:"PATCH",
    body
  });

}

function remove(
  endpoint,
  options = {}
){

  return executeRequest({
    ...options,
    endpoint,
    method:"DELETE"
  });

}


// =====================================
// ABORT
// =====================================

function abortRequest(
  requestId
){

  const controller =
  apiState.activeRequests.get(
    requestId
  );

  if(!controller){
    return false;
  }

  controller.abort();

  apiState.diagnostics.aborted++;

  try{
    CommunicationCore
    .failRequest(
      requestId,
      "REQUEST_ABORTED"
    );
  }
  catch{}

  return true;

}

function abortAllRequests(){

  apiState.activeRequests
  .forEach((controller,requestId) => {

    try{
      controller.abort();
      apiState.diagnostics.aborted++;
      CommunicationCore.failRequest(
        requestId,
        "REQUEST_ABORTED"
      );
    }
    catch{}

  });

  return true;

}


// =====================================
// EXPORTS
// =====================================

export {
  executeRequest,
  get,
  post,
  put,
  patch,
  remove,
  abortRequest,
  abortAllRequests
};