// =====================================
// RIGO AI
// API SERVICE
// ENTERPRISE NETWORK ENGINE
// FINAL STABLE EDITION
// =====================================



// =====================================
// API CONFIG
// =====================================

const API_CONFIG =
Object.freeze({

  BASE_URL:"",

  REQUEST_TIMEOUT:
  30000,

  MAX_RETRIES:2,

  RETRY_DELAY:
  1000,

  MAX_ACTIVE_REQUESTS:
  100,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_LOGGING:true,

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
// API STATE
// =====================================

const apiServiceState =
Object.seal({

  initialized:false,

  totalRequests:0,

  successfulRequests:0,

  failedRequests:0,

  cancelledRequests:0,

  lastRequestAt:null,

  lastError:null

});



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
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"
    ){

      return crypto
      .randomUUID();

    }

  }

  catch(error){}

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
// API LOGGER
// =====================================

function logAPIEvent(
  message,
  metadata = null
){

  if(

    API_CONFIG
    .ENABLE_LOGGING !== true

  ){

    return false;

  }

  try{

    if(
      typeof logDiagnosticInfo ===
      "function"
    ){

      logDiagnosticInfo(

        "[API]",

        {

          message,

          ...(metadata || {})

        }

      );

    }

    else{

      console.log(

        "[API]",

        message,

        metadata || ""

      );

    }

  }

  catch(error){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE ACTIVE REQUEST LIMIT
// =====================================

function validateRequestLimit(){

  return (

    activeAPIRequests
    .size <

    API_CONFIG
    .MAX_ACTIVE_REQUESTS

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
    "object"

    &&

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

    cleanHeaders[
      String(key)
    ] =
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

    return await response
    .json();

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

  if(!response){

    throw createAPIError({

      message:
      "EMPTY_RESPONSE"

    });

  }

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

  if(
    !validateRequestLimit()
  ){

    throw createAPIError({

      message:
      "MAX_ACTIVE_REQUESTS_EXCEEDED",

      code:
      "REQUEST_LIMIT"

    });

  }

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

  activeAPIRequests
  .set(
    requestId,
    controller
  );

  apiServiceState
  .totalRequests++;

  apiServiceState
  .lastRequestAt =
  Date.now();

  logAPIEvent(

    API_EVENTS
    .REQUEST_STARTED,

    {

      requestId,

      endpoint,

      method

    }

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
    String(method)
    .toUpperCase();

    const hasBody =

      upperMethod !== "GET"

      &&

      upperMethod !== "DELETE"

      &&

      upperMethod !== "HEAD";

    const response =
    await fetch(

      buildAPIUrl(
        endpoint
      ),

      {

        method:
        upperMethod,

        headers:
        buildHeaders(
          headers
        ),

        body:

          hasBody

          &&

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

      const retryable =

        retryableStatus
        .includes(
          response.status
        );

      throw createAPIError({

        message:

          data?.message ||

          response.statusText ||

          "REQUEST_FAILED",

        status:
        response.status,

        code:

          retryable

          ?

          "RETRYABLE_HTTP_ERROR"

          :

          "HTTP_ERROR",

        details:
        data

      });

    }

    apiServiceState
    .successfulRequests++;

    logAPIEvent(

      API_EVENTS
      .REQUEST_COMPLETED,

      {

        requestId,

        status:
        response.status

      }

    );

    return Object.freeze({

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

    });

  }

  catch(error){

    apiServiceState
    .failedRequests++;

    apiServiceState
    .lastError =
    error;

    if(
      error?.name ===
      "AbortError"
    ){

      apiServiceState
      .cancelledRequests++;

      logAPIEvent(

        API_EVENTS
        .REQUEST_ABORTED,

        {

          requestId

        }

      );

      throw createAPIError({

        message:
        "REQUEST_ABORTED",

        code:
        "ABORT_ERROR"

      });

    }

    if(

      (

        error instanceof
        TypeError

        ||

        error instanceof
        DOMException

      )

      &&

      error.name !==
      "APIError"

    ){

      throw createAPIError({

        message:
        "NETWORK_ERROR",

        code:
        "NETWORK_ERROR"

      });

    }

    logAPIEvent(

      API_EVENTS
      .REQUEST_FAILED,

      {

        requestId,

        error:
        String(error)

      }

    );

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

    activeAPIRequests
    .delete(
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

  return [

    "NETWORK_ERROR",

    "RETRYABLE_HTTP_ERROR"

  ]
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
// API REQUEST
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

      return Object.freeze({

        ...response,

        attempt

      });

    }

    catch(error){

      lastError =
      error;

      const retryAllowed =
      shouldRetryRequest(
        error
      );

      const finalAttempt =

        attempt ===
        API_CONFIG
        .MAX_RETRIES;

      if(
        !retryAllowed ||
        finalAttempt
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

    catch(error){}

  });

  activeAPIRequests
  .clear();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAPIDiagnostics(){

  return Object.freeze({

    initialized:
    apiServiceState
    .initialized,

    totalRequests:
    apiServiceState
    .totalRequests,

    successfulRequests:
    apiServiceState
    .successfulRequests,

    failedRequests:
    apiServiceState
    .failedRequests,

    cancelledRequests:
    apiServiceState
    .cancelledRequests,

    activeRequests:

      activeAPIRequests
      .size,

    lastRequestAt:
    apiServiceState
    .lastRequestAt,

    lastError:

      apiServiceState
      .lastError

      ?

      String(
        apiServiceState
        .lastError
      )

      :

      null

  });

}



// =====================================
// INITIALIZE
// =====================================

function initializeAPIService(){

  if(
    apiServiceState
    .initialized
  ){

    return true;

  }

  registerService(
    "api",
    APIService
  );

  activateService(
    "api"
  );

  apiServiceState
  .initialized =
  true;

  logAPIEvent(
    "API_SERVICE_READY"
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
