// =====================================
// RIGO AI
// STORAGE MEMORY
// PER-USER IN-MEMORY STORAGE
// =====================================

import { STORAGE_LIMITS }
from "./storage-config.js";

import { deepClone }
from "./storage-utils.js";

import { scopeStorageKey }
from "./storage-scope.js";

const memoryStore = new Map();

function resolveKey(key){
  try{
    return scopeStorageKey(key);
  }
  catch{
    return "";
  }
}

function setMemoryItem(key,value){
  const scopedKey = resolveKey(key);
  if(!scopedKey){return false;}

  memoryStore.set(scopedKey,deepClone(value));

  while(memoryStore.size > STORAGE_LIMITS.MAX_CACHE_ITEMS){
    const oldestKey = memoryStore.keys().next().value;
    memoryStore.delete(oldestKey);
  }

  return true;
}

function getMemoryItem(key){
  const scopedKey = resolveKey(key);
  if(!scopedKey){return null;}

  const value = memoryStore.get(scopedKey);
  return value === undefined ? null : deepClone(value);
}

function hasMemoryItem(key){
  const scopedKey = resolveKey(key);
  return scopedKey ? memoryStore.has(scopedKey) : false;
}

function removeMemoryItem(key){
  const scopedKey = resolveKey(key);
  return scopedKey ? memoryStore.delete(scopedKey) : false;
}

function clearMemoryStore(){
  try{
    const probe = scopeStorageKey("");
    const prefix = probe.slice(0,probe.lastIndexOf(".")+1);
    for(const key of Array.from(memoryStore.keys())){
      if(key.startsWith(prefix)){
        memoryStore.delete(key);
      }
    }
    return true;
  }
  catch{
    return false;
  }
}

function getScopedEntries(){
  try{
    const probe = scopeStorageKey("");
    const prefix = probe.slice(0,probe.lastIndexOf(".")+1);
    return Array.from(memoryStore.entries()).filter(([key])=>key.startsWith(prefix));
  }
  catch{
    return [];
  }
}

function getMemoryKeys(){return getScopedEntries().map(([key])=>key);}
function getMemoryValues(){return getScopedEntries().map(([,value])=>deepClone(value));}
function getMemoryEntries(){return getScopedEntries().map(([key,value])=>[key,deepClone(value)]);}
function getMemorySize(){return getScopedEntries().length;}
function getMemoryStats(){return Object.freeze({items:getMemorySize()});}

const StorageMemory = Object.freeze({
  setMemoryItem,getMemoryItem,hasMemoryItem,removeMemoryItem,
  clearMemoryStore,getMemoryKeys,getMemoryValues,getMemoryEntries,
  getMemorySize,getMemoryStats
});

export {
  setMemoryItem,getMemoryItem,hasMemoryItem,removeMemoryItem,
  clearMemoryStore,getMemoryKeys,getMemoryValues,getMemoryEntries,
  getMemorySize,getMemoryStats,StorageMemory
};

export default StorageMemory;
