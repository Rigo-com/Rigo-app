// =====================================
// RIGO AI
// API EVENTS
// =====================================

const API_EVENTS =
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

export {

  API_EVENTS

};

export default
API_EVENTS;
