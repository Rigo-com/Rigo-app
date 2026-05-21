// =====================================
// RIGO AI
// API SERVICE
// PRODUCTION FINAL
// =====================================



// =====================================
// API CONFIG
// =====================================

const API_CONFIG =
deepFreeze({

  BASE_URL:"",

  DEFAULT_HEADERS:
  deepFreeze({

    "Content-Type":
    "application/json",

    "Accept":
    "application/json"

  }),

  REQUEST_TIMEOUT:
  30000,

  MAX_RETRIES:
  2,

  RETRY_DELAY:
  1200

});



// =====================================
// ACTIVE REQUESTS
// =====================================

const activeAPIRequests =
new Map();



// =====================================
// CREATE REQUEST ID
// =====================================

function createRequestId(){

  if(
    typeof crypto !==
    "undefined" &&

    typeof crypto
    .randomUUID ===
    "function"
  ){

    return crypto.randomUUID();

  }

  return (

    "req_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .substring(2,9)

  );

}



// =====================================
// CREATE TIMEOUT CONTROLLER
// =====================================

function createTimeoutController(
  timeout
){

  const safeTimeout =

  Number.isFinite(timeout)

  ? Math.max(
      1000,
      timeout
    )

  : API_CONFIG
    .REQUEST_TIMEOUT;

  const controller =
  new AbortController();

  const timeoutId =
  setTimeout(() => {

    controller.abort();

  },

  safeTimeout);

  return {

    controller,

    timeoutId

  };

}



// =====================================
// BUILD URL
// =====================================

function buildAPIUrl(
  endpoint
){

  const baseUrl =
  String(
    API_CONFIG
    .BASE_URL || ""
  ).trim();

  const cleanEndpoint =
  String(
    endpoint || ""
  ).trim();

  if(!cleanEndpoint){

    throw createAPIError({

      message:
      "Invalid API endpoint",

      code:
      "INVALID_ENDPOINT"

    });

  }

  const isAbsoluteURL =

    cleanEndpoint.startsWith(
      "http://"
    ) ||

    cleanEndpoint.startsWith(
      "https://"
    );

  if(isAbsoluteURL){

    return cleanEndpoint;

  }

  return (

    baseUrl.replace(
      /\/+$/,
      ""
    ) +

    "/" +

    cleanEndpoint.replace(
      /^\/+/,
      ""
    )

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

    ? customHeaders

    : {};

  return {

    ...API_CONFIG
    .DEFAULT_HEADERS,

    ...safeHeaders

  };

}



// =====================================
// SAFE JSON STRINGIFY
// =====================================

function safeJSONStringify(
  value
){

  if(
    typeof value ===
    "undefined"
  ){

    return undefined;

  }

  let result =
  null;

  try{

    result =
    JSON.stringify(
      value
    );

  }

  catch(error){

    throw createAPIError({

      message:
      "Invalid request body",

      code:
      "INVALID_REQUEST_BODY"

    });

  }

  if(
    typeof result !==
    "string"
  ){

    throw createAPIError({

      message:
      "Request body serialization failed",

      code:
      "INVALID_REQUEST_BODY"

    });

  }

  return result;

}



// =====================================
// SAFE JSON PARSE
// =====================================

async function safeParseJSON(
  response
){

  if(
    !(response instanceof Response)
  ){

    return null;

  }

  const contentType =

  response.headers.get(
    "content-type"
  ) || "";

  if(
    !contentType
    .toLowerCase()
    .includes("json")
  ){

    return null;

  }

  try{

    return await response.json();

  }

  catch(error){

    return null;

  }

}



// =====================================
// CREATE API ERROR
// =====================================

function createAPIError({

  message = "API Error",

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
    !(response instanceof Response)
  ){

    throw createAPIError({

      message:
      "Invalid response object",

      code:
      "INVALID_RESPONSE"

    });

  }

  return true;

}



// =====================================
// SHOULD RETRY REQUEST
// =====================================

function shouldRetryRequest(
  error
){

  if(!error){

    return false;

  }

  if(
    error?.name ===
    "AbortError"
  ){

    return false;

  }

  if(
    error?.code ===
    "ABORT_ERROR"
  ){

    return false;

  }

  const retryableStatus = [

    408,
    429,
    500,
    502,
    503,
    504

  ];

  if(
    retryableStatus.includes(
      error?.status
    )
  ){

    return true;

  }

  const retryableCodes = [

    "NETWORK_ERROR",

    "FETCH_ERROR",

    "TIMEOUT_ERROR",

    "RETRYABLE_HTTP_ERROR"

  ];

  if(
    retryableCodes.includes(
      error?.code
    )
  ){

    return true;

  }

  return (
    error instanceof
    TypeError
  );

}



// =====================================
// RETRY DELAY
// =====================================

function getAPIRetryDelay(
  attempt
){

  const baseDelay =

  API_CONFIG
  .RETRY_DELAY;

  const exponentialDelay =

  baseDelay *

  Math.pow(
    2,
    attempt
  );

  const jitter =

  Math.floor(
    Math.random() * 300
  );

  return (
    exponentialDelay +
    jitter
  );

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

      upperMethod !== "DELETE";

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

        ? safeJSONStringify(
            body
          )

        : undefined,

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

        ? "RETRYABLE_HTTP_ERROR"

        : "HTTP_ERROR",

        details:
        data

      });

    }

    return {

      ok:true,

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

      return await executeFetch(
        options
      );

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
      AI_CONFIG
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
// GET REQUEST
// =====================================

async function apiGet(
  endpoint,
  options = {}
){

  return apiRequest({

    ...options,

    endpoint,

    method:"GET"

  });

}



// =====================================
// POST REQUEST
// =====================================

async function apiPost(
  endpoint,
  body = {},
  options = {}
){

  return apiRequest({

    ...options,

    endpoint,

    body,

    method:"POST"

  });

}



// =====================================
// PUT REQUEST
// =====================================

async function apiPut(
  endpoint,
  body = {},
  options = {}
){

  return apiRequest({

    ...options,

    endpoint,

    body,

    method:"PUT"

  });

}



// =====================================
// DELETE REQUEST
// =====================================

async function apiDelete(
  endpoint,
  options = {}
){

  return apiRequest({

    ...options,

    endpoint,

    method:"DELETE"

  });

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

      logError(error);

    }

  });

  activeAPIRequests.clear();

  return true;

}
