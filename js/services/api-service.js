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
// SERVICE ACCESS
// =====================================

function getAPIService(
  serviceName
){

  try{

    if(
      typeof ServiceRegistry ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof ServiceRegistry.get !==
      "function"
    ){

      return null;

    }

    return ServiceRegistry.get(
      serviceName
    );

  }

  catch(error){

    return null;

  }

}



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

    console.log(

      "[API]",

      message,

      metadata || ""

    );

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
// NORMALIZE ENDPOINT
// =====================================

function normalizeEndpoint(
  endpoint = ""
){

  const normalized =
  String(endpoint)
  .trim()
  .replace(/\/{2,}/g,"/");

  if(!normalized){

    return "";
  }

  return normalized.startsWith("/")

    ?

    normalized

    :

    `/${normalized}`;

}



// =====================================
// BUILD HEADERS
// =====================================

function buildHeaders(
  customHeaders = {},
  body = null
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

  const mergedHeaders = {

    ...API_CONFIG
    .DEFAULT_HEADERS,

    ...cleanHeaders

  };

  if(
    body instanceof FormData
  ){

    delete mergedHeaders[
      "Content-Type"
    ];

  }

  return mergedHeaders;

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

  return (

    API_CONFIG
    .BASE_URL +

    normalizeEndpoint(
      endpoint
    ) +

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
// NORMALIZE RESPONSE
// =====================================

function normalizeAPIResponse(
  data
){

  if(

    API_CONFIG
    .ENABLE_RESPONSE_NORMALIZATION
    !== true

  ){

    return data;

  }

  if(
    data == null
  ){

    return null;

  }

  if(
    typeof data ===
    "string"
  ){

    return data
    .normalize("NFKC")
    .trim();

  }

  return data;

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

    if(
      response.status === 204
    ){

      return null;

    }

    let parsedData =
    null;

    switch(responseType){

      case "text":

        parsedData =
        await response.text();

        break;

      case "blob":

        parsedData =
        await response.blob();

        break;

      case "arrayBuffer":

        parsedData =
        await response.arrayBuffer();

        break;

      case "raw":

        parsedData =
        response;

        break;

      case "json":
      default:

        parsedData =
        await response.json();

    }

    return normalizeAPIResponse(
      parsedData
    );

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

    const normalizedBody =

      body instanceof FormData

      ||

      body instanceof Blob

      ||

      body instanceof ArrayBuffer

      ||

      body instanceof URLSearchParams

      ?

      body

      :

      safeJSONStringify(
        body
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
          headers,
          body
        ),

        body:

          hasBody

          &&

          body !== null

          ?

          normalizedBody

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
    .healthy = true;

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

    if(
      error?.name ===
      "AbortError"
    ){

      apiServiceState
      .cancelledRequests++;

      logAPIEvent(
        API_EVENTS
        .REQUEST_ABORTED
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

      apiServiceState
      .healthy = false;

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
// SHUTDOWN
// =====================================

async function shutdownAPIService(){

  cancelAllAPIRequests();

  apiServiceState
  .initialized = false;

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

  if(
    typeof ServiceRegistry ===
    "undefined"
  ){

    return false;

  }

  if(

    typeof ServiceRegistry.has ===
    "function"

    &&

    ServiceRegistry.has(
      "api"
    )

  ){

    apiServiceState
    .initialized =
    true;

    return true;

  }

  ServiceRegistry.register(

    "api",

    APIService,

    {

      immutable:true,

      type:"network",

      version:"1.0.0"

    }

  );

  ServiceRegistry.activate(
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

  shutdown:
  shutdownAPIService,

  diagnostics:
  getAPIDiagnostics,

  snapshot:
  getAPIDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "APIService",

    {

      value:
      APIService,

      writable:false,

      configurable:false

    }

  );

}
