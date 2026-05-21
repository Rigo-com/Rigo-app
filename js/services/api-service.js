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
    generateSecureRandomId()
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

  let timedOut =
  false;

  const timeoutHandler =
  setTimeout(() => {

    timedOut = true;

    controller.abort();

  },

  Math.max(
    1000,
    timeout
  ));

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

        timedOut

        ?

        "Request timeout"

        :

        "Request aborted",

        code:

        timedOut

        ?

        "TIMEOUT_ERROR"

        :

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

    clearTimeout(
      timeoutHandler
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
