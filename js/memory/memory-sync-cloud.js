// =====================================
// RIGO AI
// MEMORY SYNC CLOUD
// CLOUD SYNC LAYER
// =====================================

import {
  loadMemories,
  saveMemories
}
from "./memory-storage.js";

import {
  incrementSynced,
  incrementFailures
}
from "./memory-state.js";

import {
  MEMORY_FEATURES
}
from "./memory-constants.js";



// =====================================
// SYNC STATE
// =====================================

let lastSyncAt =
null;



// =====================================
// EXPORT PAYLOAD
// =====================================

function createSyncPayload(){

  return Object.freeze({

    timestamp:
    Date.now(),

    memories:
    loadMemories()

  });

}



// =====================================
// IMPORT PAYLOAD
// =====================================

function applySyncPayload(
  payload
){

  if(
    !payload
  ){
    return false;
  }

  if(
    !Array.isArray(
      payload.memories
    )
  ){
    return false;
  }

  return saveMemories(
    payload.memories
  );

}



// =====================================
// SYNC
// =====================================

async function syncToCloud(
  provider = null
){

  if(
    !MEMORY_FEATURES
    .ENABLE_CLOUD_SYNC
  ){

    return false;

  }

  if(
    typeof provider !==
    "function"
  ){

    return false;

  }

  try{

    const payload =

      createSyncPayload();

    await provider(
      payload
    );

    lastSyncAt =
    Date.now();

    incrementSynced();

    return true;

  }

  catch(error){

    incrementFailures();

    return false;

  }

}



// =====================================
// RESTORE
// =====================================

async function restoreFromCloud(
  provider = null
){

  if(
    typeof provider !==
    "function"
  ){

    return false;

  }

  try{

    const payload =
    await provider();

    const restored =

      applySyncPayload(
        payload
      );

    if(
      restored
    ){

      lastSyncAt =
      Date.now();

      incrementSynced();

    }

    return restored;

  }

  catch(error){

    incrementFailures();

    return false;

  }

}



// =====================================
// STATUS
// =====================================

function getCloudSyncStatus(){

  return Object.freeze({

    enabled:

    MEMORY_FEATURES
    .ENABLE_CLOUD_SYNC,

    lastSyncAt

  });

}



// =====================================
// RESET
// =====================================

function resetCloudSync(){

  lastSyncAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemorySyncCloud =
Object.freeze({

  createSyncPayload,

  applySyncPayload,

  syncToCloud,

  restoreFromCloud,

  getCloudSyncStatus,

  resetCloudSync

});



// =====================================
// EXPORTS
// =====================================

export {

  createSyncPayload,

  applySyncPayload,

  syncToCloud,

  restoreFromCloud,

  getCloudSyncStatus,

  resetCloudSync,

  MemorySyncCloud

};

export default
MemorySyncCloud;
