// =====================================
// RIGO AI
// MEMORY STORAGE
// LOCAL CACHE + POSTGRES ACCOUNT SYNC
// =====================================

import {
  STORAGE_KEYS
}
from "../storage/storage-config.js";

import {
  load,
  save
}
from "../storage/storage-runtime.js";

import {
  loadAccountSection,
  saveAccountSection
}
from "../storage/account-data-client.js";

import {
  sanitizeMemories
}
from "./memory-security.js";

import {
  validateMemoryCollection
}
from "./memory-validation.js";

function normalizeMemories(memories){
  const list=Array.isArray(memories)?memories:[];
  const sanitized=sanitizeMemories(list);
  return validateMemoryCollection(sanitized)?sanitized:[];
}

function loadMemories(){
  try{
    return normalizeMemories(load(STORAGE_KEYS.MEMORY));
  }
  catch{
    return [];
  }
}

async function hydrateMemories(){
  try{
    const remote=await loadAccountSection("memory");

    if(Array.isArray(remote)){
      const sanitized=normalizeMemories(remote);
      save(STORAGE_KEYS.MEMORY,sanitized);
      return sanitized;
    }

    const local=loadMemories();

    if(local.length){
      await saveAccountSection("memory",local);
    }

    return local;
  }
  catch{
    return loadMemories();
  }
}

function saveMemories(memories=[]){
  try{
    const sanitized=normalizeMemories(memories);
    const saved=save(STORAGE_KEYS.MEMORY,sanitized);

    if(saved&&typeof window!=="undefined"){
      saveAccountSection("memory",sanitized).catch(()=>{});
    }

    return saved;
  }
  catch{
    return false;
  }
}

function appendMemory(memory){
  const memories=loadMemories();
  memories.push(memory);
  return saveMemories(memories);
}

function removeStoredMemory(memoryId){
  const memories=loadMemories();
  return saveMemories(memories.filter(memory=>memory?.id!==memoryId));
}

function clearStoredMemories(){return saveMemories([]);}
function getStoredMemoryCount(){return loadMemories().length;}
function getStorageStats(){return Object.freeze({memories:getStoredMemoryCount()});}

const MemoryStorage=Object.freeze({
  loadMemories,
  hydrateMemories,
  saveMemories,
  appendMemory,
  removeStoredMemory,
  clearStoredMemories,
  getStoredMemoryCount,
  getStorageStats
});

export {
  loadMemories,
  hydrateMemories,
  saveMemories,
  appendMemory,
  removeStoredMemory,
  clearStoredMemories,
  getStoredMemoryCount,
  getStorageStats,
  MemoryStorage
};

export default MemoryStorage;
