// =====================================
// RIGO AI
// MEMORY STORAGE
// LOCAL CACHE + NEON BACKEND
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

function loadMemories(){
  try{
    const memories=load(STORAGE_KEYS.MEMORY);
    if(!memories)return [];

    const sanitized=sanitizeMemories(memories);
    if(!validateMemoryCollection(sanitized))return [];

    return sanitized;
  }
  catch{
    return [];
  }
}

function saveMemories(memories=[]){
  try{
    const sanitized=sanitizeMemories(memories);
    if(!validateMemoryCollection(sanitized))return false;

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
  saveMemories,
  appendMemory,
  removeStoredMemory,
  clearStoredMemories,
  getStoredMemoryCount,
  getStorageStats
});

export {
  loadMemories,
  saveMemories,
  appendMemory,
  removeStoredMemory,
  clearStoredMemories,
  getStoredMemoryCount,
  getStorageStats,
  MemoryStorage
};

export default MemoryStorage;
