// =====================================
// RIGO AI
// STORAGE RUNTIME
// ORCHESTRATION LAYER
// =====================================

import {
  STORAGE_EVENTS
}
from "./storage-config.js";

import {
  setInitialized,
  setLoading,
  setSaving,
  incrementLoads,
  incrementSaves,
  incrementFailures,
  getStorageSnapshot,
  getStorageDiagnostics,
  resetStorageState
}
from "./storage-state.js";

import {
  saveItem,
  loadItem,
  removeItem,
  clearStorage
}
from "./storage-engine.js";

import {
  enqueueOperation,
  dequeueOperation,
  isQueueEmpty
}
from "./storage-queue.js";



// =====================================
// EVENTS
// =====================================

const listeners =
new Map();



function emit(
  eventName,
  payload = null
){

  const handlers =

    listeners.get(
      eventName
    );

  if(
    !handlers
  ){
    return true;
  }

  for(
    const handler
    of handlers
  ){

    try{

      handler(
        payload
      );

    }

    catch{}

  }

  return true;

}



function on(
  eventName,
  callback
){

  if(
    typeof callback !==
    "function"
  ){
    return false;
  }

  if(
    !listeners.has(
      eventName
    )
  ){

    listeners.set(

      eventName,

      new Set()

    );

  }

  listeners
  .get(
    eventName
  )
  .add(
    callback
  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  setInitialized(
    true
  );

  emit(
    STORAGE_EVENTS
    .INITIALIZED
  );

  return true;

}



// =====================================
// LOAD
// =====================================

function load(
  key
){

  try{

    setLoading(
      true
    );

    const value =

      loadItem(
        key
      );

    incrementLoads();

    emit(

      STORAGE_EVENTS
      .LOADED,

      {
        key
      }

    );

    return value;

  }

  catch{

    incrementFailures();

    return null;

  }

  finally{

    setLoading(
      false
    );

  }

}



// =====================================
// SAVE
// =====================================

function save(
  key,
  value
){

  try{

    setSaving(
      true
    );

    const result =

      saveItem(

        key,

        value

      );

    if(
      result
    ){

      incrementSaves();

      emit(

        STORAGE_EVENTS
        .SAVED,

        {
          key
        }

      );

    }

    return result;

  }

  catch{

    incrementFailures();

    return false;

  }

  finally{

    setSaving(
      false
    );

  }

}



// =====================================
// REMOVE
// =====================================

function remove(
  key
){

  const result =

    removeItem(
      key
    );

  if(
    result
  ){

    emit(

      STORAGE_EVENTS
      .REMOVED,

      {
        key
      }

    );

  }

  return result;

}



// =====================================
// CLEAR
// =====================================

function clear(){

  const result =
  clearStorage();

  if(
    result
  ){

    emit(
      STORAGE_EVENTS
      .CLEARED
    );

  }

  return result;

}



// =====================================
// QUEUE
// =====================================

function queueSave(
  key,
  value
){

  return enqueueOperation({

    type:"save",

    key,

    value

  });

}



function flushQueue(){

  while(

    !isQueueEmpty()

  ){

    const operation =

      dequeueOperation();

    if(
      !operation
    ){
      continue;
    }

    if(
      operation.type ===
      "save"
    ){

      save(

        operation.key,

        operation.value

      );

    }

  }

  return true;

}



// =====================================
// HEALTH
// =====================================

function health(){

  return Object.freeze({

    ...getStorageSnapshot(),

    diagnostics:
    getStorageDiagnostics()

  });

}



// =====================================
// RESET
// =====================================

function destroy(){

  resetStorageState();

  emit(
    STORAGE_EVENTS
    .DESTROYED
  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const StorageRuntime =
Object.freeze({

  on,

  initialize,

  load,

  save,

  remove,

  clear,

  queueSave,

  flushQueue,

  health,

  destroy

});



// =====================================
// EXPORTS
// =====================================

export {

  on,

  initialize,

  load,

  save,

  remove,

  clear,

  queueSave,

  flushQueue,

  health,

  destroy,

  StorageRuntime

};

export default
StorageRuntime;
