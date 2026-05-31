// =====================================
// RIGO AI
// API RUNTIME
// =====================================

import {

  apiState

}
from "./api-state.js";

import {

  executeRequest,

  get,

  post,

  put,

  patch,

  remove,

  abortRequest,

  abortAllRequests

}
from "./api-request.js";

import {

  uploadFile

}
from "./api-upload.js";

import {

  getAPIStatus,

  getAPIDiagnostics,

  createAPISnapshot,

  getAPIHealth

}
from "./api-diagnostics.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeAPIRuntime(){

  if(
    apiState
    .initialized
  ){

    return true;

  }

  if(
    typeof fetch !==
    "function"
  ){

    return false;

  }

  apiState
  .initialized =
  true;

  return true;

}



// =====================================
// RESET
// =====================================

async function resetAPIRuntime(){

  abortAllRequests();

  apiState
  .pendingRequests =
  0;

  apiState
  .activeRequests
  .clear();

  apiState
  .abortControllers
  .clear();

  apiState
  .uploads
  .clear();

  apiState
  .lastRequestAt =
  null;

  apiState
  .lastError =
  null;

  apiState
  .diagnostics = {

    requests:0,

    successful:0,

    failed:0,

    aborted:0,

    uploads:0,

    retries:0

  };

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAPIRuntime(){

  await resetAPIRuntime();

  apiState
  .initialized =
  false;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const APIRuntime =
Object.freeze({

  initialize:
  initializeAPIRuntime,

  shutdown:
  shutdownAPIRuntime,

  reset:
  resetAPIRuntime,

  request:
  executeRequest,

  get,

  post,

  put,

  patch,

  delete:
  remove,

  upload:
  uploadFile,

  abort:
  abortRequest,

  abortAll:
  abortAllRequests,

  status:
  getAPIStatus,

  diagnostics:
  getAPIDiagnostics,

  snapshot:
  createAPISnapshot,

  health:
  getAPIHealth

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeAPIRuntime,

  shutdownAPIRuntime,

  resetAPIRuntime,

  APIRuntime

};

export default
APIRuntime;
