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

  ENABLE_AUTO_CLEANUP:true,

  ENABLE_RESPONSE_NORMALIZATION:true,

  DEFAULT_RESPONSE_TYPE:
  "json",

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

  healthy:true,

  totalRequests:0,

  successfulRequests:0,

  failedRequests:0,

  cancelledRequests:0,

  retriedRequests:0,

  activeRequests:0,

  lastRequestAt:null,

  lastSuccessAt:null,

  lastFailureAt:null,

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
// VALIDATE REQUEST LIMIT
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
// VALIDATE REQUEST OPTIONS
// =====================================

function validateRequestOptions(
  options = {}
){

  if(
    !options ||
    typeof options !==
    "object"
  ){

    return false;

  }

  return true;

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
// BUILD QUERY STRING
// =====================================

function buildQueryString(
  query = {}
){

  if(
    !query ||
    typeof query !==
    "object"
  ){

    return "";
  }

  const params =
  new URLSearchParams();

  Object.entries(query)
  .forEach(([key,value]) => {

    if(
      value == null
    ){

      return;
    }

    params.append(
      key,
      String(value)
    );

  });

  const result =
  params.toString();

  return result
  ? `?${result}`
  : "";

}



// =====================================
// BUILD URL
// =====================================

function buildAPIUrl(
  endpoint = "",
  query = {}
){

  const normalizedEndpoint =
  String(endpoint)
  .trim();

  return (

    API_CONFIG
    .BASE_URL +

    normalizedEndpoint +

    buildQueryString(
      query
    )

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
// PARSE RESPONSE
// =====================================

async function parseAPIResponse(
  response,
  responseType =
  API_CONFIG
  .DEFAULT_RESPONSE_TYPE
){

  try{

    switch(responseType){

      case "text":
        return await response.text();

      case "blob":
        return await response.blob();

      case "arrayBuffer":
        return await response.arrayBuffer();

      case "raw":
        return response;

      case "json":
      default:

        return await response
        .json();

    }

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

  query = {},

  headers = {},

  timeout =
  API_CONFIG
  .REQUEST_TIMEOUT,

  responseType =
  API_CONFIG
  .DEFAULT_RESPONSE_TYPE,

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
  .activeRequests =
  activeAPIRequests.size;

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

      !["GET","DELETE","HEAD"]
      .includes(
        upperMethod
      );

    const response =
    await fetch(

      buildAPIUrl(
        endpoint,
        query
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
    await parseAPIResponse(

      response,

      responseType

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

      throw createAPIError({

        message:

          data?.message ||

          response.statusText ||

          "REQUEST_FAILED",

        status:
        response.status,

        code:

          retryableStatus
          .includes(
            response.status
          )

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

    apiServiceState
    .lastSuccessAt =
    Date.now();

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
    .lastFailureAt =
    Date.now();

    apiServiceState
    .lastError =
    error;

    apiServiceState
    .healthy = false;

    if(
      error?.name ===
      "AbortError"
    ){

      apiServiceState
      .cancelledRequests++;

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

    apiServiceState
    .activeRequests =
    activeAPIRequests.size;

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

  if(
    !validateRequestOptions(
      options
    )
  ){

    throw createAPIError({

      message:
      "INVALID_REQUEST_OPTIONS"

    });

  }

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

      apiServiceState
      .retriedRequests++;

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

  apiServiceState
  .activeRequests = 0;

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

    healthy:
    apiServiceState
    .healthy,

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

    retriedRequests:
    apiServiceState
    .retriedRequests,

    activeRequests:
    apiServiceState
    .activeRequests,

    lastRequestAt:
    apiServiceState
    .lastRequestAt,

    lastSuccessAt:
    apiServiceState
    .lastSuccessAt,

    lastFailureAt:
    apiServiceState
    .lastFailureAt,

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
    APIService,
    {
      type:"network",
      version:"1.0.0"
    }
  );

  activateService(
    "api"
  );

  apiServiceState
  .initialized =
  true;

  apiServiceState
  .healthy =
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
