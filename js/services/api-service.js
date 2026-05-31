// =====================================
// RIGO AI
// API SERVICE
// SERVICE FACADE LAYER
// =====================================

import {

  APIRuntime

}
from "../api/index.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeAPIService(){

  return APIRuntime
  .initialize();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAPIService(){

  return APIRuntime
  .shutdown();

}



// =====================================
// RESET
// =====================================

async function resetAPIService(){

  return APIRuntime
  .reset();

}



// =====================================
// PUBLIC API
// =====================================

const APIService =
Object.freeze({

  initialize:
  initializeAPIService,

  shutdown:
  shutdownAPIService,

  reset:
  resetAPIService,

  request:
  APIRuntime.request,

  get:
  APIRuntime.get,

  post:
  APIRuntime.post,

  put:
  APIRuntime.put,

  patch:
  APIRuntime.patch,

  delete:
  APIRuntime.delete,

  upload:
  APIRuntime.upload,

  abort:
  APIRuntime.abort,

  abortAll:
  APIRuntime.abortAll,

  status:
  APIRuntime.status,

  diagnostics:
  APIRuntime.diagnostics,

  snapshot:
  APIRuntime.snapshot,

  health:
  APIRuntime.health

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeAPIService,

  shutdownAPIService,

  resetAPIService,

  APIService

};

export default
APIService;
