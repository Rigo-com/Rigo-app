// =====================================
// RIGO AI
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

const VALID_API_STATUS =
Object.freeze([

  "idle",

  "loading",

  "success",

  "error"

]);

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

export {

  API_RUNTIME_CONFIG,

  VALID_API_STATUS,

  API_RUNTIME_EVENTS

};
