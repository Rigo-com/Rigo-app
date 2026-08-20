// =====================================
// RIGO AI
// API DIAGNOSTICS
// =====================================

import {

  API_CONFIG

}
from "./api-config.js";

import {

  apiState

}
from "./api-state.js";



// =====================================
// STATUS
// =====================================

function getAPIStatus(){

  return Object.freeze({

    initialized:
    apiState
    .initialized,

    pendingRequests:
    apiState
    .pendingRequests,

    activeRequests:

      apiState
      .activeRequests
      .size,

    uploads:

      apiState
      .uploads
      .size,

    lastRequestAt:
    apiState
    .lastRequestAt,

    lastError:
    apiState
    .lastError

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAPIDiagnostics(){

  return Object.freeze({

    ...getAPIStatus(),

    diagnostics:
    Object.freeze({

      ...apiState
      .diagnostics

    })

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createAPISnapshot(){

  return Object.freeze({

    initialized:
    apiState
    .initialized,

    activeRequests:

      apiState
      .activeRequests
      .size,

    uploads:

      apiState
      .uploads
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// HEALTH
// =====================================

function getAPIHealth(){

  return Object.freeze({

    initialized:
    apiState
    .initialized,

    healthy:
      apiState.initialized &&
      apiState.pendingRequests < API_CONFIG.MAX_CONCURRENT_REQUESTS &&
      apiState.lastError === null,

    reason:
      !apiState.initialized ? "not-initialized" :
      apiState.pendingRequests >= API_CONFIG.MAX_CONCURRENT_REQUESTS ? "concurrency-limit" :
      apiState.lastError !== null ? "last-request-failed" : "ready",

    timestamp:
    Date.now()

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  getAPIStatus,

  getAPIDiagnostics,

  createAPISnapshot,

  getAPIHealth

};
