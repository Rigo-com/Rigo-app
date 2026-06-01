// =====================================
// RIGO AI
// API MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import APIRuntime
from "./api-runtime.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeAPI(){

  return APIRuntime
  .initialize();

}



// =====================================
// START
// =====================================

async function startAPI(){

  return initializeAPI();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAPI(){

  return APIRuntime
  .shutdown();

}



// =====================================
// RESTART
// =====================================

async function restartAPI(){

  const stopped =
  await shutdownAPI();

  if(
    !stopped
  ){

    return false;

  }

  return startAPI();

}



// =====================================
// RESET
// =====================================

async function resetAPI(){

  return APIRuntime
  .reset();

}



// =====================================
// STATUS
// =====================================

function getAPIStatus(){

  return APIRuntime
  .status();

}



// =====================================
// HEALTH
// =====================================

function getAPIHealth(){

  return APIRuntime
  .health();

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAPIDiagnostics(){

  return APIRuntime
  .diagnostics();

}



// =====================================
// SNAPSHOT
// =====================================

function createAPIManagerSnapshot(){

  return Object.freeze({

    status:
    getAPIStatus(),

    health:
    getAPIHealth(),

    diagnostics:
    getAPIDiagnostics(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const APIManager =
Object.freeze({

  initialize:
  initializeAPI,

  start:
  startAPI,

  shutdown:
  shutdownAPI,

  restart:
  restartAPI,

  reset:
  resetAPI,

  status:
  getAPIStatus,

  health:
  getAPIHealth,

  diagnostics:
  getAPIDiagnostics,

  snapshot:
  createAPIManagerSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeAPI,

  startAPI,

  shutdownAPI,

  restartAPI,

  resetAPI,

  getAPIStatus,

  getAPIHealth,

  getAPIDiagnostics,

  createAPIManagerSnapshot,

  APIManager

};

export default
APIManager;
