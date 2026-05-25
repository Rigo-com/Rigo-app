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

  RETRY_BASE_DELAY:
  1000,

  MAX_RETRY_DELAY:
  10000,

  MAX_QUEUE_RETRIES:
  2,

  UPLOAD_ENDPOINT:
  "/files/upload",

  ENABLE_DIAGNOSTICS:true,

  ENABLE_EVENTS:true,

  ENABLE_ABORT_CONTROLLERS:true,

  ENABLE_REQUEST_TRACKING:true,

  ENABLE_UPLOAD_TRACKING:true,

  ENABLE_RESPONSE_NORMALIZATION:true,

  ENABLE_PRIORITY_QUEUE:true

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

  REQUEST_QUEUED:
  "api.request.queued",

  REQUEST_DEQUEUED:
  "api.request.dequeued",

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

  requestQueue:[],

  processingQueue:false,

  diagnostics:{

    requests:0,

    successful:0,

    failed:0,

    aborted:0,

    uploads:0,

    retries:0,

    queued:0

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



function wait(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function calculateRetryDelay(
  attempt
){

  const delay =

    API_RUNTIME_CONFIG
    .RETRY_BASE_DELAY *

    Math.pow(
      2,
      attempt - 1
    );

  return Math.min(

    delay,

    API_RUNTIME_CONFIG
    .MAX_RETRY_DELAY

  );

}



async function emitAPIRuntimeEvent(
  eventName,
  payload = {}
){

  if(

    !API_RUNTIME_CONFIG
    .ENABLE_EVENTS

  ){

    return false;

  }

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

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



function createAPIError(
  options = {}
){

  const error =
  new Error(

    String(
      options.message ||
      "API ERROR"
    )

  );

  error.code =

    String(
      options.code ||
      "API_ERROR"
    );

  return error;

}



function normalizeAPIResult(
  result
){

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
    "object"

  ){

    return null;

  }

  return safeDeepClone(
    data
  );

}



function validateEndpoint(
  endpoint
){

  return (

    typeof endpoint ===
    "string"

    &&

    endpoint.trim()
    .length > 0

  );

}



function isAbortError(
  error
){

  return (

    error?.name ===
    "AbortError"

  );

}



function validateAPIEnvironment(){

  return (
    typeof fetch ===
    "function"
  );

}



async function parseAPIResponse(
  response
){

  const contentType =

    response.headers
    .get(
      "content-type"
    ) || "";

  try{

    if(

      contentType.includes(
        "application/json"
      )

    ){

      return await response.json();

    }

    if(

      contentType.includes(
        "text/"
      )

    ){

      return await response.text();

    }

    return await response.blob();

  }

  catch(error){

    return null;

  }

}



function setAPIStatus(
  status
){

  if(

    !VALID_API_STATUS
    .includes(status)

  ){

    return false;

  }

  apiRuntimeState
  .status =
  status;

  return true;

}



function updateAPIStatus(){

  if(

    apiRuntimeState
    .pendingRequests > 0

  ){

    setAPIStatus(
      "loading"
    );

    return true;

  }

  if(
    apiRuntimeState
    .lastError
  ){

    setAPIStatus(
      "error"
    );

    return true;

  }

  setAPIStatus(
    "idle"
  );

  return true;

}



// =====================================
// PRIORITY QUEUE
// =====================================

function enqueueAPIRequest(
  task
){

  apiRuntimeState
  .requestQueue
  .push({

    ...task,

    queuedAt:
    Date.now()

  });

  apiRuntimeState
  .requestQueue
  .sort((a,b) => {

    if(
      b.priority ===
      a.priority
    ){

      return (
        a.queuedAt -
        b.queuedAt
      );

    }

    return (
      b.priority -
      a.priority
    );

  });

  apiRuntimeState
  .diagnostics
  .queued++;

  emitAPIRuntimeEvent(

    API_RUNTIME_EVENTS
    .REQUEST_QUEUED,

    {

      requestId:
      task.requestId

    }

  );

  processAPIQueue();

  return true;

}



async function processAPIQueue(){

  if(
    apiRuntimeState
    .processingQueue
  ){

    return false;

  }

  apiRuntimeState
  .processingQueue =
  true;

  try{

    while(

      apiRuntimeState
      .requestQueue
      .length > 0

      &&

      apiRuntimeState
      .pendingRequests <

      API_RUNTIME_CONFIG
      .MAX_CONCURRENT_REQUESTS

    ){

      const task =

        apiRuntimeState
        .requestQueue
        .shift();

      if(!task){

        continue;

      }

      await emitAPIRuntimeEvent(

        API_RUNTIME_EVENTS
        .REQUEST_DEQUEUED,

        {

          requestId:
          task.requestId

        }

      );

      Promise.resolve()

      .then(() => {

        return executeAPIRequest(

          task.options,

          task.requestId

        );

      })

      .then(task.resolve)

      .catch(task.reject);

    }

    return true;

  }

  finally{

    apiRuntimeState
    .processingQueue =
    false;

  }

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAPIRuntime(){

  return true;

}
