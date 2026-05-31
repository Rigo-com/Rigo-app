// =====================================
// RIGO AI
// APP INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import AppState
from "./app-state.js";

import AppDOM
from "./app-dom.js";

import AppRecovery
from "./app-recovery.js";

import ApplicationRuntime
from "./application-runtime.js";

import AppManager
from "./app-manager.js";



// =====================================
// SHORTCUTS
// =====================================

async function initializeApp(){

  return AppManager
  .initialize();

}



async function startApp(){

  return AppManager
  .start();

}



async function shutdownApp(){

  return AppManager
  .shutdown();

}



async function restartApp(){

  return AppManager
  .restart();

}



async function resetApp(){

  return AppManager
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createAppSnapshot(){

  return Object.freeze({

    app:
    AppManager
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const App =
Object.freeze({

  state:
  AppState,

  dom:
  AppDOM,

  recovery:
  AppRecovery,

  runtime:
  ApplicationRuntime,

  manager:
  AppManager,

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

  snapshot:
  createAppSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  AppState,

  AppDOM,

  AppRecovery,

  ApplicationRuntime,

  AppManager,

  initializeApp,

  startApp,

  shutdownApp,

  restartApp,

  resetApp,

  createAppSnapshot,

  App

};

export default
App;
