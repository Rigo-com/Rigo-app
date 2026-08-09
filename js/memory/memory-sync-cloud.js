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
  MEMORY_FEATURES
}
from "./memory-constants.js";

import {
  getCurrentUserIdentity
}
from "../storage/storage-scope.js";

let lastSyncAt = null;

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
    return false;
  }

  const currentOwner = getCurrentUserIdentity();
  const payloadOwner = String(payload.owner||"").trim().toLowerCase();

  if(!currentOwner||!payloadOwner||payloadOwner!==currentOwner){
    incrementFailures();
    return false;
  }

  return saveMemories(payload.memories);
}

async function syncToCloud(provider=null){
  if(!MEMORY_FEATURES.ENABLE_CLOUD_SYNC||typeof provider!=="function"){
    return false;
  }

  try{
    const payload = createSyncPayload();
    if(!payload){return false;}
    await provider(payload);
    lastSyncAt=Date.now();
    incrementSynced();
    return true;
  }
  catch{
    incrementFailures();
    return false;
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
    }
    return restored;
  }
  catch{
    incrementFailures();
    return false;
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
