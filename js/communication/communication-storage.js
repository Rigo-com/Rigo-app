// =====================================
// RIGO AI
// COMMUNICATION STORAGE
// STORAGE LAYER
// =====================================

import { COMMUNICATION_LIMITS, COMMUNICATION_TIMERS }
from "./communication-config.js";

import CommunicationState
from "./communication-state.js";

const processedHashes = new Map();
const responseCache = new Map();

function registerHash(hash){
  if(!hash) return false;
  processedHashes.set(hash,Date.now());
  while(processedHashes.size > COMMUNICATION_LIMITS.MAX_HASH_CACHE){
    processedHashes.delete(processedHashes.keys().next().value);
  }
  return true;
}

function hasHash(hash){
  if(!hash) return false;
  const timestamp = processedHashes.get(hash);
  if(!timestamp) return false;
  if(Date.now() - timestamp > COMMUNICATION_TIMERS.HASH_TTL){
    processedHashes.delete(hash);
    return false;
  }
  return true;
}

function clearHashes(){ processedHashes.clear(); return true; }

function setCache(key,value){
  if(!key) return false;
  responseCache.set(key,{ value, timestamp:Date.now() });
  while(responseCache.size > COMMUNICATION_LIMITS.MAX_CACHE_ENTRIES){
    responseCache.delete(responseCache.keys().next().value);
  }
  return true;
}

function getCache(key){
  const entry = responseCache.get(key);
  if(!entry){
    CommunicationState.incrementCacheMisses();
    return null;
  }
  if(Date.now() - entry.timestamp > COMMUNICATION_TIMERS.CACHE_TTL){
    responseCache.delete(key);
    CommunicationState.incrementCacheMisses();
    return null;
  }
  CommunicationState.incrementCacheHits();
  return entry.value;
}

function removeCache(key){ return responseCache.delete(key); }
function clearCache(){ responseCache.clear(); return true; }

function cleanupExpiredHashes(){
  const now = Date.now();
  for(const [hash,timestamp] of processedHashes){
    if(now - timestamp > COMMUNICATION_TIMERS.HASH_TTL) processedHashes.delete(hash);
  }
  return true;
}

function cleanupExpiredCache(){
  const now = Date.now();
  for(const [key,entry] of responseCache){
    if(now - entry.timestamp > COMMUNICATION_TIMERS.CACHE_TTL) responseCache.delete(key);
  }
  return true;
}

function getStorageStats(){
  cleanupExpiredHashes();
  cleanupExpiredCache();
  return Object.freeze({ hashes:processedHashes.size, cache:responseCache.size });
}

function resetStorage(){
  processedHashes.clear();
  responseCache.clear();
  return true;
}

const CommunicationStorage = Object.freeze({
  registerHash,hasHash,clearHashes,setCache,getCache,removeCache,clearCache,
  cleanupExpiredHashes,cleanupExpiredCache,getStorageStats,resetStorage
});

export {
  registerHash,hasHash,clearHashes,setCache,getCache,removeCache,clearCache,
  cleanupExpiredHashes,cleanupExpiredCache,getStorageStats,resetStorage,
  CommunicationStorage
};

export default CommunicationStorage;
