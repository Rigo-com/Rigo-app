// =====================================
// RIGO AI
// APP MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import AppState
from "./app-state.js";

import ApplicationRuntime
from "./application-runtime.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeApp(){

  return ApplicationRuntime
  .initialize();

}



// =====================================
// START
// =====================================

async function startApp(){

  return ApplicationRuntime
  .boot();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownApp(){

  return ApplicationRuntime
  .shutdown();

}



// =====================================
// RESTART
// =====================================

async function restartApp(){

  const stopped =
  await shutdownApp();

  if(
    !stopped
  ){

    return false;

  }

  return startApp();

}



// =====================================
// RESET
// =====================================

async function resetApp(){

  return ApplicationRuntime
  .reset();

}



// =====================================
// STATUS
// =====================================

function getAppStatus(){

  const snapshot =
  AppState
  .snapshot();

  return Object.freeze({

    initialized:
    snapshot
    .initialized,

    booted:
    snapshot
    .booted,

    ready:
    snapshot
    .ready,

    booting:
    snapshot
    .booting,

    shuttingDown:
    snapshot
    .shuttingDown,

    recovering:
    snapshot
    .recovering

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createAppManagerSnapshot(){

  return Object.freeze({

    status:
    getAppStatus(),

    runtime:
    ApplicationRuntime
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AppManager =
Object.freeze({

  initialize:
  initializeApp,

  start:
  startApp,

  shutdown:
  shutdownApp,

  restart:
  restartApp,

  reset:
  resetApp,

  status:
  getAppStatus,

  snapshot:
  createAppManagerSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeApp,

  startApp,

  shutdownApp,

  restartApp,

  resetApp,

  getAppStatus,

  createAppManagerSnapshot,

  AppManager

};

export default
AppManager;
