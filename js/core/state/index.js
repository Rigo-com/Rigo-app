// =====================================
// RIGO AI
// STATE INDEX
// =====================================

import AppState
from "./app-state.js";

import StateManager
from "./state-manager.js";

import STATE_EVENTS
from "./state-events.js";

import SystemEvents
from "../events/event-manager.js";

let appObserverRegistered = false;

async function emitStateEvent(type, payload = {}){
  try{
    return await SystemEvents.emit(type, payload);
  }
  catch{
    return false;
  }
}

async function syncCanonicalAppState(snapshot = AppState.snapshot()){
  const updated = await StateManager.update(
    "app",
    snapshot,
    { source:"canonical-app-state" }
  );

  if(updated){
    await emitStateEvent(STATE_EVENTS.UPDATED, {
      path:"app",
      source:"canonical-app-state"
    });
  }

  return updated;
}

function handleCanonicalAppState(snapshot){
  void syncCanonicalAppState(snapshot);
}

async function initialize(){
  await SystemEvents.initialize();

  const initialized =
  await StateManager.initialize();

  if(!initialized){
    return false;
  }

  if(!appObserverRegistered){
    AppState.subscribe(handleCanonicalAppState);
    appObserverRegistered = true;
  }

  await syncCanonicalAppState();
  await emitStateEvent(STATE_EVENTS.INITIALIZED, {
    timestamp:Date.now()
  });

  return true;
}

const boot = initialize;

async function shutdown(){
  if(appObserverRegistered){
    AppState.unsubscribe(handleCanonicalAppState);
    appObserverRegistered = false;
  }

  return true;
}

async function update(path, value, metadata = {}){
  const updated = await StateManager.update(path, value, metadata);

  if(updated){
    await emitStateEvent(STATE_EVENTS.UPDATED, {
      path,
      metadata,
      timestamp:Date.now()
    });
  }

  return updated;
}

async function remove(path){
  const removed = await StateManager.remove(path);

  if(removed){
    await emitStateEvent(STATE_EVENTS.REMOVED, {
      path,
      timestamp:Date.now()
    });
  }

  return removed;
}

async function reset(){
  const resetResult = await StateManager.reset();

  if(resetResult){
    await emitStateEvent(STATE_EVENTS.RESET, {
      timestamp:Date.now()
    });
  }

  return resetResult;
}

function snapshot(){
  return Object.freeze({
    app:AppState.snapshot(),
    state:StateManager.getAll(),
    diagnostics:StateManager.diagnostics(),
    events:STATE_EVENTS,
    observerRegistered:appObserverRegistered,
    timestamp:Date.now()
  });
}

const State =
Object.freeze({
  id:"core-state",
  priority:20,
  app:AppState,
  manager:StateManager,
  events:STATE_EVENTS,
  initialize,
  boot,
  shutdown,
  reset,
  update,
  remove,
  snapshot
});

export {
  AppState,
  StateManager,
  STATE_EVENTS,
  initialize,
  boot,
  shutdown,
  reset,
  update,
  remove,
  snapshot,
  State
};

export default State;
