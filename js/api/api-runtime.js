// =====================================
// RIGO AI
// API RUNTIME SYSTEM
// ENTERPRISE API ENGINE FINAL
// =====================================



// =====================================
// API CONFIG
// =====================================

const API_RUNTIME_CONFIG =
Object.freeze({

  MAX_CONCURRENT_REQUESTS:
  100,

  DEFAULT_TIMEOUT:
  30000,

  MAX_RETRIES:
  3,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_EVENTS:true,

  ENABLE_ABORT_CONTROLLERS:true,

  ENABLE_REQUEST_TRACKING:true,

  ENABLE_UPLOAD_TRACKING:true,

  ENABLE_RESPONSE_NORMALIZATION:true

});



// =====================================
// VALID API STATUS
// =====================================

const VALID_API_STATUS =
Object.freeze([

  "idle",

  "loading",

  "success",

  "error"

]);



// =====================================
// API EVENTS
// =====================================

const API_RUNTIME_EVENTS =
Object.freeze({

  REQUEST_STARTED:
  "api.request.started",

  REQUEST_SUCCESS:
  "api.request.success",

  REQUEST_FAILED:
  "api.request.failed",

  REQUEST_ABORTED:
  "api.request.aborted",

  UPLOAD_STARTED:
  "api.upload.started",

  UPLOAD_COMPLETED:
  "api.upload.completed",

  UPLOAD_FAILED:
  "api.upload.failed"

});



// =====================================
// API STATE
// =====================================

const apiRuntimeState =
Object.seal({

  status:"idle",

  pendingRequests:0,

  lastError:null,

  lastRequestAt:null,

  activeRequests:
  new Map(),

  abortControllers:
  new Map(),

  uploads:
  new Map(),

  diagnostics:{

    requests:0,

    successful:0,

    failed:0,

    aborted:0,

    uploads:0

  }

});



// =====================================
// HELPERS
// =====================================

function createAPIRequestId(){

  return (

    "api_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



async function emitAPIRuntimeEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "api-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function safeDeepClone(
  value
){

  try{

    if(
      typeof deepClone ===
      "function"
    ){

      return deepClone(
        value
      );

    }

    return structuredClone(
      value
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(
          value
        )
      );

    }

    catch(cloneError){

      return null;

    }

  }

}



// =====================================
// VALIDATE API STATE VALUE
// =====================================

function validateAPIStateValue(
  key,
  value
){

  switch(key){

    case "status":

      return (

        typeof value ===
        "string"

        &&

        VALID_API_STATUS
        .includes(value)

      );

    case "pendingRequests":

      return (

        Number.isFinite(
          value
        ) &&

        value >= 0

      );

    case "lastError":

      return (

        value === null ||

        typeof value ===
        "string"

      );

    case "lastRequestAt":

      return (

        value === null ||

        Number.isFinite(
          value
        )

      );

    default:

      return false;

  }

}



// =====================================
// VALIDATE RESULT
// =====================================

function validateAPIResult(
  result
){

  return (

    result &&

    typeof result ===
    "object"

  );

}



// =====================================
// NORMALIZE API RESPONSE
// =====================================

function normalizeAPIResult(
  result
){

  validateAPIResult(
    result
  );

  const safeStatus =
  Number(
    result.status
  );

  return Object.freeze({

    ok:Boolean(
      result.ok
    ),

    status:

    Number.isFinite(
      safeStatus
    )

    ?

    safeStatus

    :

    0,

    data:
    result.data ?? null,

    headers:
    result.headers ?? null,

    requestId:

      typeof result
      .requestId ===
      "string"

      ?

      result.requestId

      :

      null,

    duration:

      Number.isFinite(
        result.duration
      )

      ?

      result.duration

      :

      null,

    attempt:

      Number.isFinite(
        result.attempt
      )

      ?

      result.attempt

      :

      null

  });

}



// =====================================
// CREATE API ERROR
// =====================================

function createAPIError(
  options = {}
){

  return Object.freeze({

    message:

      String(
        options.message ||
        "API ERROR"
      ),

    code:

      String(
        options.code ||
        "API_ERROR"
      )

  });

}



// =====================================
// CREATE PAYLOAD
// =====================================

function createAPIPayload(
  data = {}
){

  const hasFormData =

    typeof FormData !==
    "undefined";

  const hasFile =

    typeof File !==
    "undefined";

  const hasBlob =

    typeof Blob !==
    "undefined";

  if(

    (

      hasFormData &&

      data instanceof
      FormData

    ) ||

    (

      hasFile &&

      data instanceof
      File

    ) ||

    (

      hasBlob &&

      data instanceof
      Blob

    )

  ){

    return data;

  }

  if(

    !data ||

    typeof data !==
    "object" ||

    Array.isArray(
      data
    )

  ){

    return {};

  }

  return safeDeepClone(
    data
  ) || {};

}



// =====================================
// API REQUEST
// =====================================

async function apiRequest(
  options = {}
){

  const requestId =
  createAPIRequestId();

  const startedAt =
  Date.now();

  if(

    apiRuntimeState
    .pendingRequests >=

    API_RUNTIME_CONFIG
    .MAX_CONCURRENT_REQUESTS

  ){

    throw createAPIError({

      message:
      "Too many requests",

      code:
      "REQUEST_LIMIT"

    });

  }

  const controller =

    API_RUNTIME_CONFIG
    .ENABLE_ABORT_CONTROLLERS

    ?

    new AbortController()

    :

    null;

  apiRuntimeState
  .pendingRequests++;

  apiRuntimeState
  .lastRequestAt =
  Date.now();

  apiRuntimeState
  .status =
  "loading";

  apiRuntimeState
  .activeRequests
  .set(
    requestId,
    options
  );

  if(controller){

    apiRuntimeState
    .abortControllers
    .set(
      requestId,
      controller
    );

  }

  await emitAPIRuntimeEvent(

    API_RUNTIME_EVENTS
    .REQUEST_STARTED,

    {

      requestId,

      endpoint:
      options.endpoint

    }

  );

  try{

    const response =
    await fetch(

      options.endpoint,

      {

        method:

          options.method ||
          "GET",

        headers:

          options.headers ||
          {},

        body:

          options.body ||

          null,

        signal:

          controller
          ?.signal

      }

    );

    let data =
    null;

    try{

      data =
      await response.json();

    }

    catch(error){

      data = null;

    }

    const result =
    normalizeAPIResult({

      ok:
      response.ok,

      status:
      response.status,

      data,

      headers:
      response.headers,

      requestId,

      duration:

        Date.now() -
        startedAt,

      attempt:1

    });

    apiRuntimeState
    .diagnostics
    .requests++;

    apiRuntimeState
    .diagnostics
    .successful++;

    apiRuntimeState
    .status =
    "success";

    await emitAPIRuntimeEvent(

      API_RUNTIME_EVENTS
      .REQUEST_SUCCESS,

      {

        requestId,

        endpoint:
        options.endpoint

      }

    );

    return result;

  }

  catch(error){

    apiRuntimeState
    .diagnostics
    .failed++;

    apiRuntimeState
    .lastError =
    String(error);

    apiRuntimeState
    .status =
    "error";

    await emitAPIRuntimeEvent(

      API_RUNTIME_EVENTS
      .REQUEST_FAILED,

      {

        requestId,

        endpoint:
        options.endpoint,

        error:
        String(error)

      }

    );

    throw createAPIError({

      message:
      String(error),

      code:
      "REQUEST_FAILED"

    });

  }

  finally{

    apiRuntimeState
    .pendingRequests =

    Math.max(

      0,

      apiRuntimeState
      .pendingRequests - 1

    );

    apiRuntimeState
    .activeRequests
    .delete(
      requestId
    );

    apiRuntimeState
    .abortControllers
    .delete(
      requestId
    );

  }

}



// =====================================
// EXECUTE ACTION
// =====================================

async function executeAPIAction(
  callback
){

  try{

    return await callback();

  }

  catch(error){

    throw error;

  }

}



// =====================================
// ABORT REQUEST
// =====================================

function abortAPIRequest(
  requestId
){

  const controller =

    apiRuntimeState
    .abortControllers
    .get(
      requestId
    );

  if(!controller){

    return false;

  }

  controller.abort();

  apiRuntimeState
  .diagnostics
  .aborted++;

  emitAPIRuntimeEvent(

    API_RUNTIME_EVENTS
    .REQUEST_ABORTED,

    {

      requestId

    }

  );

  return true;

}



// =====================================
// UPLOAD FILE
// =====================================

async function uploadFile(
  file
){

  return executeAPIAction(
    async () => {

      const hasFile =

        typeof File !==
        "undefined";

      if(

        !hasFile ||

        !(file instanceof File)

      ){

        throw createAPIError({

          message:
          "Invalid file",

          code:
          "INVALID_FILE"

        });

      }

      const uploadId =
      createAPIRequestId();

      apiRuntimeState
      .uploads
      .set(

        uploadId,

        {

          startedAt:
          Date.now(),

          fileName:
          file.name

        }

      );

      await emitAPIRuntimeEvent(

        API_RUNTIME_EVENTS
        .UPLOAD_STARTED,

        {

          uploadId,

          fileName:
          file.name

        }

      );

      const maxFileSize =
      10 * 1024 * 1024;

      if(
        file.size >
        maxFileSize
      ){

        throw createAPIError({

          message:
          "File too large",

          code:
          "FILE_TOO_LARGE"

        });

      }

      const allowedMimeTypes = [

        "image/png",

        "image/jpeg",

        "image/webp",

        "application/pdf",

        "text/plain"

      ];

      if(

        file.type &&

        !allowedMimeTypes
        .includes(
          file.type
        )

      ){

        throw createAPIError({

          message:
          "Unsupported file type",

          code:
          "INVALID_FILE_TYPE"

        });

      }

      const formData =
      new FormData();

      formData.append(
        "file",
        file
      );

      const result =
      await apiRequest({

        endpoint:
        "/files/upload",

        method:"POST",

        headers:{

          Accept:
          "application/json"

        },

        body:formData

      });

      apiRuntimeState
      .diagnostics
      .uploads++;

      await emitAPIRuntimeEvent(

        API_RUNTIME_EVENTS
        .UPLOAD_COMPLETED,

        {

          uploadId,

          fileName:
          file.name

        }

      );

      return normalizeAPIResult(
        result
      );

    }
  );

}



// =====================================
// GET STATUS
// =====================================

function getAPIStatus(){

  return safeDeepClone({

    status:
    apiRuntimeState
    .status,

    pendingRequests:

      apiRuntimeState
      .pendingRequests,

    lastError:

      apiRuntimeState
      .lastError,

    lastRequestAt:

      apiRuntimeState
      .lastRequestAt,

    diagnostics:

      apiRuntimeState
      .diagnostics

  });

}



// =====================================
// RESET
// =====================================

function resetAPIRuntime(){

  apiRuntimeState
  .status =
  "idle";

  apiRuntimeState
  .pendingRequests =
  0;

  apiRuntimeState
  .lastError =
  null;

  apiRuntimeState
  .lastRequestAt =
  null;

  apiRuntimeState
  .activeRequests
  .clear();

  apiRuntimeState
  .abortControllers
  .clear();

  apiRuntimeState
  .uploads
  .clear();

  apiRuntimeState
  .diagnostics = {

    requests:0,

    successful:0,

    failed:0,

    aborted:0,

    uploads:0

  };

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const APIRuntime =
Object.freeze({

  request:
  apiRequest,

  upload:
  uploadFile,

  abort:
  abortAPIRequest,

  status:
  getAPIStatus,

  reset:
  resetAPIRuntime

});
