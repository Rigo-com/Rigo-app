// =====================================
// RIGO AI
// MEMORY SYNC CLOUD
// USER-BOUND CLOUD SYNC LAYER
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
  MEMORY_FEATURES,
  MEMORY_EVENTS
}
from "./memory-constants.js";

import {emit}
from "./memory-events.js";

import {reload}
from "./memory-core.js";

import {
  getCurrentUserIdentity
}
from "../storage/storage-scope.js";

let lastSyncAt = null;

function recordSyncFailure(operation,reason){
  incrementFailures();
  emit(MEMORY_EVENTS.FAILED,{
    operation,
    reason:String(reason||"MEMORY_SYNC_FAILED")
  });
  return false;
}

function createSyncPayload(){
  const owner = getCurrentUserIdentity();
  if(!owner){
    return null;
  }

  return Object.freeze({
    owner,
    timestamp:Date.now(),
    memories:loadMemories()
  });
}

function applySyncPayload(payload){
  if(!payload||!Array.isArray(payload.memories)){
    return recordSyncFailure("restore","INVALID_SYNC_PAYLOAD");
  }

  const currentOwner = getCurrentUserIdentity();
  const payloadOwner = String(payload.owner||"").trim().toLowerCase();

  if(!currentOwner||!payloadOwner||payloadOwner!==currentOwner){
    return recordSyncFailure("restore","SYNC_OWNER_MISMATCH");
  }

  if(!saveMemories(payload.memories)){
    return recordSyncFailure("restore","SYNC_STORAGE_FAILED");
  }

  return reload();
}

async function syncToCloud(provider=null){
  if(!MEMORY_FEATURES.ENABLE_CLOUD_SYNC||typeof provider!=="function"){
    return false;
  }

  try{
    const payload = createSyncPayload();
    if(!payload){return false;}
    const accepted=await provider(payload);
    if(accepted===false){
      return recordSyncFailure("upload","SYNC_PROVIDER_REJECTED");
    }
    lastSyncAt=Date.now();
    incrementSynced();
    emit(MEMORY_EVENTS.SYNCED,{
      direction:"upload",
      owner:payload.owner,
      memories:payload.memories.length,
      syncedAt:lastSyncAt
    });
    return true;
  }
  catch(error){
    return recordSyncFailure("upload",error);
  }
}

async function restoreFromCloud(provider=null){
  if(typeof provider!=="function"){
    return false;
  }

  try{
    const payload=await provider();
    const restored=applySyncPayload(payload);
    if(restored){
      lastSyncAt=Date.now();
      incrementSynced();
      emit(MEMORY_EVENTS.SYNCED,{
        direction:"download",
        owner:String(payload.owner||"").trim().toLowerCase(),
        memories:payload.memories.length,
        syncedAt:lastSyncAt
      });
    }
    return restored;
  }
  catch(error){
    return recordSyncFailure("restore",error);
  }
}

function getCloudSyncStatus(){
  return Object.freeze({
    enabled:MEMORY_FEATURES.ENABLE_CLOUD_SYNC,
    owner:getCurrentUserIdentity()||null,
    lastSyncAt
  });
}

function resetCloudSync(){
  lastSyncAt=null;
  return true;
}

const MemorySyncCloud = Object.freeze({
  createSyncPayload,
  applySyncPayload,
  syncToCloud,
  restoreFromCloud,
  getCloudSyncStatus,
  resetCloudSync
});

export {
  createSyncPayload,
  applySyncPayload,
  syncToCloud,
  restoreFromCloud,
  getCloudSyncStatus,
  resetCloudSync,
  MemorySyncCloud
};

export default MemorySyncCloud;
