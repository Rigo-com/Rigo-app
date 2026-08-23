// =====================================
// RIGO AI
// APP STATE
// CANONICAL APPLICATION STATE
// =====================================

const observers =
new Set();

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

function createAppStateSnapshot(){
  return Object.freeze({
    initialized:appState.initialized,
    booted:appState.booted,
    booting:appState.booting,
    shuttingDown:appState.shuttingDown,
    recovering:appState.recovering,
    ready:appState.ready,
    lastBootAt:appState.lastBootAt,
    lastShutdownAt:appState.lastShutdownAt,
    lastRecoveryAt:appState.lastRecoveryAt,
    lastError:appState.lastError,
    observers:observers.size,
    timestamp:Date.now()
  });
}

function notify(){
  const snapshot =
  createAppStateSnapshot();

  for(const observer of [...observers]){
    try{
      observer(snapshot);
    }
    catch{}
  }

  return true;
}

function subscribe(
  observer
){
  if(typeof observer !== "function"){
    return false;
  }

  observers.add(observer);
  return true;
}

function unsubscribe(
  observer
){
  return observers.delete(observer);
}

function setInitialized(value = true){
  appState.initialized = Boolean(value);
  notify();
  return true;
}

function setBooted(value = true){
  appState.booted = Boolean(value);
  notify();
  return true;
}

function setBooting(value = true){
  appState.booting = Boolean(value);
  notify();
  return true;
}

function setShuttingDown(value = true){
  appState.shuttingDown = Boolean(value);
  notify();
  return true;
}

function setRecovering(value = true){
  appState.recovering = Boolean(value);
  notify();
  return true;
}

function setReady(value = true){
  appState.ready = Boolean(value);
  notify();
  return true;
}

function setLastBootAt(timestamp = Date.now()){
  appState.lastBootAt = timestamp;
  notify();
  return true;
}

function setLastShutdownAt(timestamp = Date.now()){
  appState.lastShutdownAt = timestamp;
  notify();
  return true;
}

function setLastRecoveryAt(timestamp = Date.now()){
  appState.lastRecoveryAt = timestamp;
  notify();
  return true;
}

function setLastError(error = null){
  appState.lastError = error;
  notify();
  return true;
}

function resetAppState(){
  appState.initialized = false;
  appState.booted = false;
  appState.booting = false;
  appState.shuttingDown = false;
  appState.recovering = false;
  appState.ready = false;
  appState.lastBootAt = null;
  appState.lastShutdownAt = null;
  appState.lastRecoveryAt = null;
  appState.lastError = null;
  notify();
  return true;
}

const AppState =
Object.freeze({
  state:appState,
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
  subscribe,
  unsubscribe,
  reset:resetAppState,
  snapshot:createAppStateSnapshot
});

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
  subscribe,
  unsubscribe,
  resetAppState,
  createAppStateSnapshot,
  AppState
};

export default
AppState;
