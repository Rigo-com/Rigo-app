import { STORAGE_EVENTS } from "./storage-config.js";
import StorageState, { storageState } from "./storage-state.js";
import StorageEngine from "./storage-engine.js";
import StorageQueue from "./storage-queue.js";

const listeners = new Map();

function emit(eventName, payload = null){
  for(const handler of listeners.get(eventName) || []){
    try { handler(payload); } catch { /* listener isolation */ }
  }
  return true;
}

function on(eventName, callback){
  if(typeof eventName !== "string" || typeof callback !== "function") return false;
  if(!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(callback);
  return true;
}

function off(eventName, callback){
  const handlers = listeners.get(eventName);
  if(!handlers) return false;
  const removed = handlers.delete(callback);
  if(!handlers.size) listeners.delete(eventName);
  return removed;
}

async function initialize(){
  if(storageState.initialized) return true;
  StorageState.setInitialized(true);
  StorageState.setHealthy(true);
  emit(STORAGE_EVENTS.INITIALIZED);
  return true;
}

async function boot(){ return initialize(); }

function runOperation(kind, operation, successEvent, payload){
  StorageState.incrementOperations();
  if(kind === "load") StorageState.setLoading(true);
  if(kind === "save") StorageState.setSaving(true);
  try{
    const result = operation();
    const succeeded = kind === "load" ? true : Boolean(result);
    if(!succeeded){
      StorageState.incrementFailures();
      StorageState.setHealthy(false);
      emit(STORAGE_EVENTS.FAILED, payload);
      return result;
    }
    StorageState.setHealthy(true);
    if(kind === "load") StorageState.incrementLoads();
    if(kind === "save") StorageState.incrementSaves();
    if(kind === "remove") StorageState.incrementRemovals();
    if(kind === "clear") StorageState.incrementClears();
    emit(successEvent, payload);
    return result;
  }
  catch(error){
    StorageState.incrementFailures();
    StorageState.setHealthy(false);
    emit(STORAGE_EVENTS.FAILED, { ...payload, error:String(error?.message || error) });
    return kind === "load" ? null : false;
  }
  finally{
    if(kind === "load") StorageState.setLoading(false);
    if(kind === "save") StorageState.setSaving(false);
    StorageState.decrementOperations();
  }
}

const load = key => runOperation("load", () => StorageEngine.loadItem(key), STORAGE_EVENTS.LOADED, { key });
const save = (key, value) => runOperation("save", () => StorageEngine.saveItem(key, value), STORAGE_EVENTS.SAVED, { key });
const remove = key => runOperation("remove", () => StorageEngine.removeItem(key), STORAGE_EVENTS.REMOVED, { key });
const clear = () => runOperation("clear", () => StorageEngine.clearStorage(), STORAGE_EVENTS.CLEARED, null);
const queueSave = (key, value) => StorageQueue.enqueueOperation({ type:"save", key, value });

function flushQueue(){
  if(storageState.flushing) return false;
  StorageState.setFlushing(true);
  try{
    const pending = StorageQueue.getQueueSize();
    let succeeded = true;
    for(let index = 0; index < pending; index++){
      const operation = StorageQueue.dequeueOperation();
      if(!operation) continue;
      if(operation.type !== "save" || !save(operation.key, operation.value)){
        StorageQueue.enqueueOperation(operation);
        succeeded = false;
      }
    }
    return succeeded;
  }
  finally { StorageState.setFlushing(false); }
}

function snapshot(){
  return Object.freeze({
    ...StorageState.snapshot(),
    diagnostics:StorageState.diagnostics(),
    queue:StorageQueue.getQueueStats(),
    engine:StorageEngine.getEngineStats(),
    listeners:[...listeners.values()].reduce((count, handlers) => count + handlers.size, 0),
    timestamp:Date.now()
  });
}

const health = snapshot;

async function shutdown(){
  if(storageState.initialized) flushQueue();
  emit(STORAGE_EVENTS.DESTROYED);
  listeners.clear();
  StorageQueue.clearQueue();
  StorageState.reset();
  return true;
}

async function reset(){ return shutdown(); }
const destroy = shutdown;

const StorageRuntime = Object.freeze({
  id:"storage", priority:10,
  on, off, initialize, boot, load, save, remove, clear, queueSave, flushQueue,
  health, snapshot, shutdown, reset, destroy
});

export { listeners, emit, on, off, initialize, boot, load, save, remove, clear, queueSave, flushQueue, health, snapshot, shutdown, reset, destroy, StorageRuntime };
export default StorageRuntime;
