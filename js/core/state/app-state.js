// =====================================
// RIGO AI
// APP STATE
// =====================================



// =====================================
// IMPORTS
// =====================================

import APP_PHASES
from "../constants/app-phases.js";

import {
  createImmutableState
}
from "./state-utils.js";



// =====================================
// STATE
// =====================================

const appState =
Object.seal({

  initialized:false,

  started:false,

  starting:false,

  booting:false,

  ready:false,

  shuttingDown:false,

  recovering:false,

  crashed:false,

  phase:
  APP_PHASES.IDLE,

  initializedAt:null,

  startupStartedAt:null,

  startupCompletedAt:null,

  shutdownAt:null,

  lastError:null,

  recoveryAttempts:0,

  failedStarts:0,

  crashCount:0,

  startupDuration:0,

  lastHealthcheckAt:null,

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  activeServices:
  new Set(),

  pendingTasks:
  new Set(),

  runtimeLocks:
  new Set(),

  observers:
  new Set(),

  healthcheckTimer:null

});



// =====================================
// SNAPSHOT
// =====================================

function createAppStateSnapshot(){

  return createImmutableState({

    initialized:
    appState.initialized,

    started:
    appState.started,

    starting:
    appState.starting,

    booting:
    appState.booting,

    ready:
    appState.ready,

    shuttingDown:
    appState.shuttingDown,

    recovering:
    appState.recovering,

    crashed:
    appState.crashed,

    phase:
    appState.phase,

    initializedAt:
    appState.initializedAt,

    startupStartedAt:
    appState.startupStartedAt,

    startupCompletedAt:
    appState.startupCompletedAt,

    shutdownAt:
    appState.shutdownAt,

    lastError:
    appState.lastError
      ? String(appState.lastError)
      : null,

    recoveryAttempts:
    appState.recoveryAttempts,

    failedStarts:
    appState.failedStarts,

    crashCount:
    appState.crashCount,

    startupDuration:
    appState.startupDuration,

    lastHealthcheckAt:
    appState.lastHealthcheckAt,

    observers:
    appState.observers.size,

    activeModules:[
      ...appState.activeModules
    ],

    failedModules:[
      ...appState.failedModules
    ],

    activeServices:[
      ...appState.activeServices
    ],

    pendingTasks:[
      ...appState.pendingTasks
    ],

    runtimeLocks:[
      ...appState.runtimeLocks
    ]

  });

}



// =====================================
// OBSERVERS
// =====================================

function notifyAppStateObservers(){

  const snapshot =
  createAppStateSnapshot();

  for(
    const listener
    of [...appState.observers]
  ){

    try{

      listener(snapshot);

    }

    catch(error){}

  }

  return true;

}



// =====================================
// CORE
// =====================================

function updateAppState(
  updater
){

  if(
    typeof updater !==
    "function"
  ){

    return false;

  }

  try{

    updater(appState);

    notifyAppStateObservers();

    return true;

  }

  catch(error){

    return false;

  }

}



function getAppState(){

  return createAppStateSnapshot();

}



// =====================================
// SUBSCRIPTIONS
// =====================================

function subscribeAppState(
  listener
){

  if(
    typeof listener !==
    "function"
  ){

    return false;

  }

  appState.observers.add(
    listener
  );

  return true;

}



function unsubscribeAppState(
  listener
){

  return appState.observers.delete(
    listener
  );

}



// =====================================
// PHASE
// =====================================

function updateAppPhase(
  phase
){

  if(
    typeof phase !==
    "string"
  ){

    return false;

  }

  return updateAppState(
    (state) => {

      state.phase =
      phase;

      state.starting = (

        phase === APP_PHASES.PREINIT ||
        phase === APP_PHASES.INITIALIZING ||
        phase === APP_PHASES.BOOTING

      );

      state.booting =
      phase ===
      APP_PHASES.BOOTING;

      state.ready =
      phase ===
      APP_PHASES.READY;

      state.shuttingDown =
      phase ===
      APP_PHASES.SHUTTING_DOWN;

      state.recovering =
      phase ===
      APP_PHASES.RECOVERING;

      state.started =
      phase ===
      APP_PHASES.READY;

    }
  );

}



// =====================================
// HELPERS
// =====================================

function setAppError(
  error
){

  return updateAppState(
    (state) => {

      state.lastError =
      error;

      state.crashed =
      Boolean(error);

    }
  );

}



function updateHealthcheckTimestamp(){

  return updateAppState(
    (state) => {

      state.lastHealthcheckAt =
      Date.now();

    }
  );

}



function addActiveModule(
  moduleName
){

  if(!moduleName){

    return false;

  }

  return updateAppState(
    (state) => {

      state.activeModules.add(
        String(moduleName)
      );

    }
  );

}



function removeActiveModule(
  moduleName
){

  if(!moduleName){

    return false;

  }

  return updateAppState(
    (state) => {

      state.activeModules.delete(
        String(moduleName)
      );

    }
  );

}



// =====================================
// RESET
// =====================================

function resetAppState(){

  appState.initialized = false;
  appState.started = false;
  appState.starting = false;
  appState.booting = false;
  appState.ready = false;
  appState.shuttingDown = false;
  appState.recovering = false;
  appState.crashed = false;

  appState.phase =
  APP_PHASES.IDLE;

  appState.initializedAt = null;
  appState.startupStartedAt = null;
  appState.startupCompletedAt = null;
  appState.shutdownAt = null;
  appState.lastError = null;
  appState.recoveryAttempts = 0;
  appState.failedStarts = 0;
  appState.crashCount = 0;
  appState.startupDuration = 0;
  appState.lastHealthcheckAt = null;

  appState.activeModules.clear();
  appState.failedModules.clear();
  appState.activeServices.clear();
  appState.pendingTasks.clear();
  appState.runtimeLocks.clear();

  return notifyAppStateObservers();

}



// =====================================
// API
// =====================================

const AppState =
Object.freeze({

  get:
  getAppState,

  update:
  updateAppState,

  subscribe:
  subscribeAppState,

  unsubscribe:
  unsubscribeAppState,

  setPhase:
  updateAppPhase,

  setError:
  setAppError,

  updateHealthcheck:
  updateHealthcheckTimestamp,

  addModule:
  addActiveModule,

  removeModule:
  removeActiveModule,

  reset:
  resetAppState

});



// =====================================
// EXPORTS
// =====================================

export default
AppState;
