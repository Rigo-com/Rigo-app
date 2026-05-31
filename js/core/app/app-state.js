// =====================================
// RIGO AI
// APP STATE
// =====================================



// =====================================
// APP STATE
// =====================================

const appState =
Object.seal({

  initialized:false,

  booted:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  ready:false,

  lastBootAt:null,

  lastShutdownAt:null,

  lastRecoveryAt:null,

  lastError:null

});



// =====================================
// STATE MUTATIONS
// =====================================

function setInitialized(
  value = true
){

  appState.initialized =
  Boolean(value);

  return true;

}



function setBooted(
  value = true
){

  appState.booted =
  Boolean(value);

  return true;

}



function setBooting(
  value = true
){

  appState.booting =
  Boolean(value);

  return true;

}



function setShuttingDown(
  value = true
){

  appState.shuttingDown =
  Boolean(value);

  return true;

}



function setRecovering(
  value = true
){

  appState.recovering =
  Boolean(value);

  return true;

}



function setReady(
  value = true
){

  appState.ready =
  Boolean(value);

  return true;

}



function setLastBootAt(
  timestamp = Date.now()
){

  appState.lastBootAt =
  timestamp;

  return true;

}



function setLastShutdownAt(
  timestamp = Date.now()
){

  appState.lastShutdownAt =
  timestamp;

  return true;

}



function setLastRecoveryAt(
  timestamp = Date.now()
){

  appState.lastRecoveryAt =
  timestamp;

  return true;

}



function setLastError(
  error = null
){

  appState.lastError =
  error;

  return true;

}



// =====================================
// RESET
// =====================================

function resetAppState(){

  appState.initialized =
  false;

  appState.booted =
  false;

  appState.booting =
  false;

  appState.shuttingDown =
  false;

  appState.recovering =
  false;

  appState.ready =
  false;

  appState.lastBootAt =
  null;

  appState.lastShutdownAt =
  null;

  appState.lastRecoveryAt =
  null;

  appState.lastError =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createAppStateSnapshot(){

  return Object.freeze({

    initialized:
    appState.initialized,

    booted:
    appState.booted,

    booting:
    appState.booting,

    shuttingDown:
    appState.shuttingDown,

    recovering:
    appState.recovering,

    ready:
    appState.ready,

    lastBootAt:
    appState.lastBootAt,

    lastShutdownAt:
    appState.lastShutdownAt,

    lastRecoveryAt:
    appState.lastRecoveryAt,

    lastError:
    appState.lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AppState =
Object.freeze({

  state:
  appState,

  setInitialized,

  setBooted,

  setBooting,

  setShuttingDown,

  setRecovering,

  setReady,

  setLastBootAt,

  setLastShutdownAt,

  setLastRecoveryAt,

  setLastError,

  reset:
  resetAppState,

  snapshot:
  createAppStateSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  appState,

  setInitialized,

  setBooted,

  setBooting,

  setShuttingDown,

  setRecovering,

  setReady,

  setLastBootAt,

  setLastShutdownAt,

  setLastRecoveryAt,

  setLastError,

  resetAppState,

  createAppStateSnapshot,

  AppState

};

export default
AppState;
