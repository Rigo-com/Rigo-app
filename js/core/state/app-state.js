// =====================================
// RIGO AI
// APP STATE
// CENTRAL APPLICATION STATE
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeAppStateValue(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Date ||

    value instanceof RegExp ||

    value instanceof Map ||

    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      freezeAppStateValue(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// APP STATE
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

  return freezeAppStateValue({

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

      ? String(
          appState.lastError
        )

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

      appState
      .observers
      .size,

    activeModules:[

      ...appState
      .activeModules

    ],

    failedModules:[

      ...appState
      .failedModules

    ],

    activeServices:[

      ...appState
      .activeServices

    ],

    pendingTasks:[

      ...appState
      .pendingTasks

    ],

    runtimeLocks:[

      ...appState
      .runtimeLocks

    ]

  });

}



// =====================================
// NOTIFY
// =====================================

function notifyAppStateObservers(){

  const snapshot =
  createAppStateSnapshot();

  [
    ...appState
    .observers
  ]
  .forEach((listener) => {

    try{

      listener(
        snapshot
      );

    }

    catch(error){}

  });

  return true;

}



// =====================================
// UPDATE
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

    updater(
      appState
    );

    notifyAppStateObservers();

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// GET
// =====================================

function getAppState(){

  return createAppStateSnapshot();

}



// =====================================
// OBSERVERS
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

  appState
  .observers
  .add(
    listener
  );

  return true;

}



function unsubscribeAppState(
  listener
){

  return appState
  .observers
  .delete(
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

        phase ===
        APP_PHASES.PREINIT ||

        phase ===
        APP_PHASES.BOOTING ||

        phase ===
        APP_PHASES.INITIALIZING

      );

      state.booting = (

        phase ===
        APP_PHASES.BOOTING
      );

      state.ready = (

        phase ===
        APP_PHASES.READY
      );

      state.shuttingDown = (

        phase ===
        APP_PHASES.SHUTTING_DOWN
      );

      state.recovering = (

        phase ===
        APP_PHASES.RECOVERING
      );

      state.started = (

        phase ===
        APP_PHASES.READY
      );

    }
  );

}



// =====================================
// ERROR
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



// =====================================
// HEALTHCHECK
// =====================================

function updateHealthcheckTimestamp(){

  return updateAppState(
    (state) => {

      state.lastHealthcheckAt =
      Date.now();

    }
  );

}



// =====================================
// MODULES
// =====================================

function addActiveModule(
  moduleName
){

  if(
    !moduleName
  ){

    return false;

  }

  return updateAppState(
    (state) => {

      state
      .activeModules
      .add(
        String(moduleName)
      );

    }
  );

}



function removeActiveModule(
  moduleName
){

  if(
    !moduleName
  ){

    return false;

  }

  return updateAppState(
    (state) => {

      state
      .activeModules
      .delete(
        String(moduleName)
      );

    }
  );

}



// =====================================
// RESET
// =====================================

function resetAppState(){

  return updateAppState(
    (state) => {

      state.initialized =
      false;

      state.started =
      false;

      state.starting =
      false;

      state.booting =
      false;

      state.ready =
      false;

      state.shuttingDown =
      false;

      state.recovering =
      false;

      state.crashed =
      false;

      state.phase =
      APP_PHASES.IDLE;

      state.initializedAt =
      null;

      state.startupStartedAt =
      null;

      state.startupCompletedAt =
      null;

      state.shutdownAt =
      null;

      state.lastError =
      null;

      state.recoveryAttempts =
      0;

      state.failedStarts =
      0;

      state.crashCount =
      0;

      state.startupDuration =
      0;

      state.lastHealthcheckAt =
      null;

      state
      .activeModules
      .clear();

      state
      .failedModules
      .clear();

      state
      .activeServices
      .clear();

      state
      .pendingTasks
      .clear();

      state
      .runtimeLocks
      .clear();

      if(
        state
        .healthcheckTimer
      ){

        clearInterval(
          state
          .healthcheckTimer
        );

        state
        .healthcheckTimer =
        null;

      }

    }
  );

}



// =====================================
// PUBLIC API
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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppState =
  AppState;

  window.updateAppPhase =
  updateAppPhase;

  window.resetAppState =
  resetAppState;

}
