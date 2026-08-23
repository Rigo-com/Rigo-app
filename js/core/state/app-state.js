// =====================================
// RIGO AI
// STATE APP FACADE
// CANONICAL APP STATE ADAPTER
// =====================================

import CanonicalAppState
from "../app/app-state.js";

import APP_PHASES
from "../constants/app-phases.js";

function getAppState(){
  return CanonicalAppState.snapshot();
}

function applyDraft(
  draft
){
  if(!draft || typeof draft !== "object"){
    return false;
  }

  if("initialized" in draft){
    CanonicalAppState.setInitialized(draft.initialized);
  }

  if("booted" in draft || "started" in draft){
    CanonicalAppState.setBooted(
      "booted" in draft
        ? draft.booted
        : draft.started
    );
  }

  if("booting" in draft || "starting" in draft){
    CanonicalAppState.setBooting(
      "booting" in draft
        ? draft.booting
        : draft.starting
    );
  }

  if("ready" in draft){
    CanonicalAppState.setReady(draft.ready);
  }

  if("shuttingDown" in draft){
    CanonicalAppState.setShuttingDown(draft.shuttingDown);
  }

  if("recovering" in draft){
    CanonicalAppState.setRecovering(draft.recovering);
  }

  if("lastError" in draft){
    CanonicalAppState.setLastError(draft.lastError);
  }

  return true;
}

function updateAppState(
  updater
){
  if(typeof updater !== "function"){
    return false;
  }

  const current =
  CanonicalAppState.snapshot();

  const draft = {
    ...current,
    started:current.booted,
    starting:current.booting
  };

  try{
    updater(draft);
    return applyDraft(draft);
  }
  catch{
    return false;
  }
}

function updateAppPhase(
  phase
){
  if(typeof phase !== "string"){
    return false;
  }

  CanonicalAppState.setBooting(
    phase === APP_PHASES.BOOTING ||
    phase === APP_PHASES.INITIALIZING ||
    phase === APP_PHASES.PREINIT
  );

  CanonicalAppState.setReady(
    phase === APP_PHASES.READY
  );

  CanonicalAppState.setBooted(
    phase === APP_PHASES.READY
  );

  CanonicalAppState.setShuttingDown(
    phase === APP_PHASES.SHUTTING_DOWN
  );

  CanonicalAppState.setRecovering(
    phase === APP_PHASES.RECOVERING
  );

  return true;
}

function setAppError(
  error
){
  return CanonicalAppState.setLastError(error);
}

function resetAppState(){
  return CanonicalAppState.reset();
}

function subscribeAppState(){
  return false;
}

function unsubscribeAppState(){
  return false;
}

function updateHealthcheckTimestamp(){
  return true;
}

function addActiveModule(){
  return true;
}

function removeActiveModule(){
  return true;
}

const AppState =
Object.freeze({
  canonical:CanonicalAppState,
  state:CanonicalAppState.state,
  get:getAppState,
  snapshot:getAppState,
  update:updateAppState,
  subscribe:subscribeAppState,
  unsubscribe:unsubscribeAppState,
  setPhase:updateAppPhase,
  setError:setAppError,
  updateHealthcheck:updateHealthcheckTimestamp,
  addModule:addActiveModule,
  removeModule:removeActiveModule,
  reset:resetAppState
});

export {
  getAppState,
  updateAppState,
  subscribeAppState,
  unsubscribeAppState,
  updateAppPhase,
  setAppError,
  updateHealthcheckTimestamp,
  addActiveModule,
  removeActiveModule,
  resetAppState,
  AppState
};

export default
AppState;
