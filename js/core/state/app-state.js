// =====================================
// RIGO AI
// APP STATE
// CENTRAL APPLICATION STATE
// =====================================



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
// IMMUTABLE SNAPSHOT
// =====================================

function createAppStateSnapshot(){

  return Object.freeze({

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
// NOTIFY OBSERVERS
// =====================================

function notifyAppStateObservers(){

  const snapshot =
  createAppStateSnapshot();

  appState
  .observers
  .forEach((listener) => {

    try{

      listener(
        snapshot
      );

    }

    catch(error){

      console.error(
        error
      );

    }

  });

  return true;

}



// =====================================
// UPDATE PHASE
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

  appState.phase =
  phase;

  appState.ready =
  (
    phase ===
    APP_PHASES.READY
  );

  notifyAppStateObservers();

  return true;

}



// =====================================
// ERROR STATE
// =====================================

function setAppError(
  error
){

  appState.lastError =
  error;

  appState.crashed =
  Boolean(error);

  notifyAppStateObservers();

  return true;

}



// =====================================
// HEALTHCHECK
// =====================================

function updateHealthcheckTimestamp(){

  appState
  .lastHealthcheckAt =
  Date.now();

  return true;

}



// =====================================
// MODULE HELPERS
// =====================================

function addActiveModule(
  moduleName
){

  if(
    !moduleName
  ){

    return false;

  }

  appState
  .activeModules
  .add(
    String(moduleName)
  );

  notifyAppStateObservers();

  return true;

}



function removeActiveModule(
  moduleName
){

  if(
    !moduleName
  ){

    return false;

  }

  appState
  .activeModules
  .delete(
    String(moduleName)
  );

  notifyAppStateObservers();

  return true;

}



// =====================================
// RESET APP STATE
// =====================================

function resetAppState(){

  appState.initialized =
  false;

  appState.started =
  false;

  appState.starting =
  false;

  appState.booting =
  false;

  appState.ready =
  false;

  appState.shuttingDown =
  false;

  appState.recovering =
  false;

  appState.crashed =
  false;

  appState.phase =
  APP_PHASES.IDLE;

  appState.initializedAt =
  null;

  appState.startupStartedAt =
  null;

  appState.startupCompletedAt =
  null;

  appState.shutdownAt =
  null;

  appState.lastError =
  null;

  appState.recoveryAttempts =
  0;

  appState.failedStarts =
  0;

  appState.crashCount =
  0;

  appState.startupDuration =
  0;

  appState.lastHealthcheckAt =
  null;

  appState
  .activeModules
  .clear();

  appState
  .failedModules
  .clear();

  appState
  .activeServices
  .clear();

  appState
  .pendingTasks
  .clear();

  appState
  .runtimeLocks
  .clear();

  if(
    appState
    .healthcheckTimer
  ){

    clearInterval(
      appState
      .healthcheckTimer
    );

    appState
    .healthcheckTimer =
    null;

  }

  notifyAppStateObservers();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const AppState =
Object.freeze({

  get:
  createAppStateSnapshot,

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
