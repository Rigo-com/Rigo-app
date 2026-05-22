// =====================================
// RIGO AI
// API SERVICE
// ENTERPRISE NETWORK ENGINE
// =====================================



// =====================================
// API CONFIG
// =====================================

const API_CONFIG =
Object.freeze({

  BASE_URL:
  "",

  REQUEST_TIMEOUT:
  30000,

  MAX_RETRIES:
  2,

  RETRY_DELAY:
  1000,

  ENABLE_DIAGNOSTICS:true,

  DEFAULT_HEADERS:{

    "Content-Type":
    "application/json"

  }

});



// =====================================
// ACTIVE REQUESTS
// =====================================

const activeAPIRequests =
new Map();



// =====================================
// API EVENTS
// =====================================

const API_EVENTS =
Object.freeze({

  REQUEST_STARTED:
  "api.request.started",

  REQUEST_COMPLETED:
  "api.request.completed",

  REQUEST_FAILED:
  "api.request.failed",

  REQUEST_ABORTED:
  "api.request.aborted"

});



// =====================================
// CREATE REQUEST ID
// =====================================

function createRequestId(){

  try{

    if(
      typeof crypto !==
      "undefined" &&

      typeof crypto
      .randomUUID ===
      "function"
    ){

      return crypto.randomUUID();

    }

  }

  catch(error){

    // FALLBACK
  }

  return (

    "req_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// BUILD HEADERS
// =====================================

function buildHeaders(
  customHeaders = {}
){

  const safeHeaders =

    customHeaders &&

    typeof customHeaders ===
    "object" &&

    !Array.isArray(
      customHeaders
    )

    ?

    customHeaders

    :

    {};

  const blockedKeys = [

    "__proto__",

    "prototype",

    "constructor"

  ];

  const cleanHeaders =
  Object.create(null);

  Object.entries(
    safeHeaders
  )
  .forEach(([key,value]) => {

    if(
      blockedKeys.includes(
        key
      )
    ){

      return;

    }

    cleanHeaders[key] =
    String(value);

  });

  return {

    ...API_CONFIG
    .DEFAULT_HEADERS,

    ...cleanHeaders

  };

}



// =====================================
// BUILD URL
// =====================================

function buildAPIUrl(
  endpoint = ""
){

  const normalizedEndpoint =
  String(endpoint)
  .trim();

  return (

    API_CONFIG
    .BASE_URL +

    normalizedEndpoint

  );

}



// =====================================
// SAFE JSON
// =====================================

function safeJSONStringify(
  value
){

  try{

    return JSON.stringify(
      value
    );

  }

  catch(error){

    return "{}";

  }

}



// =====================================
// SAFE PARSE JSON
// =====================================

async function safeParseJSON(
  response
){

  try{

    return await response.json();

  }

  catch(error){

    return null;

  }

}



// =====================================
// API ERROR
// =====================================

function createAPIError({

  message = "API ERROR",

  status = 0,

  code = "API_ERROR",

  details = null

}){

  const error =
  new Error(message);

  error.name =
  "APIError";

  error.status =
  status;

  error.code =
  code;

  error.details =
  details;

  return error;

}



// =====================================
// VALIDATE RESPONSE
// =====================================

function validateAPIResponse(
  response
){

  if(
    !response
  ){

    throw createAPIError({

      message:
      "EMPTY RESPONSE"

    });

  }

  return true;

}



// =====================================
// EXECUTE FETCH
// =====================================

async function executeFetch({

  endpoint = "",

  method = "GET",

  body = null,

  headers = {},

  timeout =
  API_CONFIG
  .REQUEST_TIMEOUT,

  signal = null

}){

  const requestId =
  createRequestId();

  const startedAt =
  Date.now();

  const {

    controller,

    timeoutId

  } = createTimeoutController(
    timeout
  );

  activeAPIRequests.set(
    requestId,
    controller
  );

  const finalSignal =
  controller.signal;

  let abortHandler =
  null;

  if(signal){

    abortHandler = () => {

      controller.abort();

    };

    signal.addEventListener(

      "abort",

      abortHandler,

      { once:true }

    );

  }

  try{

    const upperMethod =

    String(
      method
    ).toUpperCase();

    const hasBody =

      upperMethod !== "GET" &&

      upperMethod !== "DELETE" &&

      upperMethod !== "HEAD";

    const url =
    buildAPIUrl(
      endpoint
    );

    const response =
    await fetch(

      url,

      {

        method:
        upperMethod,

        headers:
        buildHeaders(
          headers
        ),

        body:

        hasBody &&

        body !== null

        ?

        safeJSONStringify(
          body
        )

        :

        undefined,

        signal:
        finalSignal

      }

    );

    validateAPIResponse(
      response
    );

    const data =
    await safeParseJSON(
      response
    );

    if(
      !response.ok
    ){

      const retryableStatus = [

        408,
        429,
        500,
        502,
        503,
        504

      ];

      const isRetryableStatus =

      retryableStatus.includes(
        response.status
      );

      throw createAPIError({

        message:

        data?.message ||

        response.statusText ||

        "Request failed",

        status:
        response.status,

        code:

        isRetryableStatus

        ?

        "RETRYABLE_HTTP_ERROR"

        :

        "HTTP_ERROR",

        details:
        data

      });

    }

    return {

      ok:true,

      requestId,

      duration:

        Date.now() -
        startedAt,

      status:
      response.status,

      data,

      headers:
      response.headers

    };

  }

  catch(error){

    if(
      error?.name ===
      "AbortError"
    ){

      throw createAPIError({

        message:
        "Request aborted",

        code:
        "ABORT_ERROR"

      });

    }

    if(

      (

        error instanceof
        TypeError ||

        error instanceof
        DOMException

      ) &&

      error.name !==
      "APIError"

    ){

      throw createAPIError({

        message:
        "Network request failed",

        code:
        "NETWORK_ERROR"

      });

    }

    throw error;

  }

  finally{

    clearTimeout(
      timeoutId
    );

    if(
      signal &&
      abortHandler
    ){

      signal.removeEventListener(

        "abort",

        abortHandler

      );

    }

    activeAPIRequests.delete(
      requestId
    );

  }

}



// =====================================
// RETRY CHECK
// =====================================

function shouldRetryRequest(
  error
){

  if(!error){

    return false;

  }

  const retryableCodes = [

    "NETWORK_ERROR",

    "RETRYABLE_HTTP_ERROR"

  ];

  return retryableCodes
  .includes(
    error.code
  );

}



// =====================================
// RETRY DELAY
// =====================================

function getAPIRetryDelay(
  attempt
){

  return (

    API_CONFIG
    .RETRY_DELAY *

    (attempt + 1)

  );

}



// =====================================
// WAIT
// =====================================

function wait(
  duration
){

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        duration
      );

    }
  );

}



// =====================================
// API REQUEST WITH RETRY
// =====================================

async function apiRequest(
  options = {}
){

  let lastError =
  null;

  for(

    let attempt = 0;

    attempt <=
    API_CONFIG
    .MAX_RETRIES;

    attempt++

  ){

    try{

      const response =
      await executeFetch(
        options
      );

      return {

        ...response,

        attempt

      };

    }

    catch(error){

      lastError =
      error;

      const retryAllowed =
      shouldRetryRequest(
        error
      );

      const isLastAttempt =

      attempt ===
      API_CONFIG
      .MAX_RETRIES;

      if(
        !retryAllowed ||
        isLastAttempt
      ){

        break;

      }

      await wait(

        getAPIRetryDelay(
          attempt
        )

      );

    }

  }

  throw lastError;

}



// =====================================
// CANCEL ALL REQUESTS
// =====================================

function cancelAllAPIRequests(){

  activeAPIRequests
  .forEach((controller) => {

    try{

      controller.abort();

    }

    catch(error){

      if(
        typeof console !==
        "undefined"
      ){

        console.error(
          error
        );

      }

    }

  });

  activeAPIRequests.clear();

  return true;

}



// =====================================
// TIMEOUT CONTROLLER
// =====================================

function createTimeoutController(
  timeout
){

  const controller =
  new AbortController();

  const timeoutId =
  setTimeout(() => {

    controller.abort();

  },

  timeout);

  return {

    controller,

    timeoutId

  };

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAPIDiagnostics(){

  return Object.freeze({

    activeRequests:

      activeAPIRequests
      .size,

    requestIds:[

      ...activeAPIRequests
      .keys()

    ]

  });

}



// =====================================
// INITIALIZE
// =====================================

function initializeAPIService(){

  registerService(
    "api",
    APIService
  );

  activateService(
    "api"
  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const APIService =
Object.freeze({

  initialize:
  initializeAPIService,

  request:
  apiRequest,

  cancelAll:
  cancelAllAPIRequests,

  diagnostics:
  getAPIDiagnostics

});
