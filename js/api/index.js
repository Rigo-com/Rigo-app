// =====================================
// RIGO AI
// API INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  API_CONFIG

}
from "./api-config.js";

import {

  apiState

}
from "./api-state.js";

import APIRuntime
from "./api-runtime.js";

import APIManager
from "./api-manager.js";



// =====================================
// SHORTCUTS
// =====================================

async function initializeAPI(){

  return APIManager
  .initialize();

}



async function startAPI(){

  return APIManager
  .start();

}



async function shutdownAPI(){

  return APIManager
  .shutdown();

}



async function resetAPI(){

  return APIManager
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createAPISnapshot(){

  return Object.freeze({

    manager:

      APIManager
      .snapshot(),

    runtime:

      APIRuntime
      .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const API =
Object.freeze({

  config:
  API_CONFIG,

  state:
  apiState,

  runtime:
  APIRuntime,

  manager:
  APIManager,

  initialize:
  initializeAPI,

  start:
  startAPI,

  shutdown:
  shutdownAPI,

  reset:
  resetAPI,

  snapshot:
  createAPISnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  API_CONFIG,

  apiState,

  APIRuntime,

  APIManager,

  initializeAPI,

  startAPI,

  shutdownAPI,

  resetAPI,

  createAPISnapshot,

  API

};

export default
API;
