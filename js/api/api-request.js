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

      },

      timeout);

    });

    return await Promise.race([

      callback(),

      timeoutPromise

    ]);

  }

  finally{

    if(
      timeoutId
    ){

      clearTimeout(
        timeoutId
      );

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

    Number.isFinite(
      options.timeout
    )

    ?

    options.timeout

    :

    API_CONFIG
    .DEFAULT_TIMEOUT;

  const retries =

    Number.isFinite(
      options.retries
    )

    ?

    options.retries

    :

    API_CONFIG
    .MAX_RETRIES;

  const controller =
  new AbortController();

  apiState
  .pendingRequests++;

  apiState
  .activeRequests
  .set(

    requestId,

    controller

  );

  apiState
  .lastRequestAt =
  Date.now();

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

                options.method ||

                "GET",

              headers:

                options.headers ||

                {},

              body:

                options.body ??

                undefined,

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

        if(
          !response.ok
        ){

          throw new APIRequestError(

            "HTTP Error",

            String(
              response.status
            )

          );

        }

        apiState
        .diagnostics
        .requests++;

        apiState
        .diagnostics
        .successful++;

        apiState
        .lastError =
        null;

        return Object.freeze({

          ok:true,

          requestId,

          status:
          response.status,

          data,

          duration:

            Date.now() -
            startedAt,

          attempt

        });

      }

      catch(error){

        throwIfAborted(
          error
        );

        if(
          attempt < retries
        ){

          apiState
          .diagnostics
          .retries++;

          await wait(

            API_CONFIG
            .RETRY_DELAY
          );

          continue;

        }

        apiState
        .diagnostics
        .requests++;

        apiState
        .diagnostics
        .failed++;

        apiState
        .lastError =
        String(error);

        throw error;

      }

    }

  }

  catch(error){

    if(

      error instanceof
      TypeError

    ){

      throw new APINetworkError();

    }

    throw error;

  }

  finally{

    apiState
    .pendingRequests =
    Math.max(

      0,

      apiState
      .pendingRequests - 1

    );

    apiState
    .activeRequests
    .delete(
      requestId
    );

  }

}



// =====================================
// GET
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



// =====================================
// POST
// =====================================

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



// =====================================
// PUT
// =====================================

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



// =====================================
// PATCH
// =====================================

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



// =====================================
// DELETE
// =====================================

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

    apiState
    .activeRequests
    .get(
      requestId
    );

  if(!controller){

    return false;

  }

  controller.abort();

  return true;

}



// =====================================
// ABORT ALL
// =====================================

function abortAllRequests(){

  apiState
  .activeRequests
  .forEach((controller) => {

    try{

      controller.abort();

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
