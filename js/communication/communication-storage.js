// =====================================
// RIGO AI
// COMMUNICATION STORAGE
// STORAGE LAYER
// =====================================

import {

  COMMUNICATION_LIMITS,

  COMMUNICATION_TIMERS

}
from "./communication-config.js";



// =====================================
// STORAGE
// =====================================

const processedHashes =
new Map();



const responseCache =
new Map();



// =====================================
// HASH STORAGE
// =====================================

function registerHash(
  hash
){

  if(
    !hash
  ){
    return false;
  }

  processedHashes.set(

    hash,

    Date.now()

  );

  while(

    processedHashes.size >

    COMMUNICATION_LIMITS
    .MAX_HASH_CACHE

  ){

    const oldest =

      processedHashes
      .keys()
      .next()
      .value;

    processedHashes.delete(
      oldest
    );

  }

  return true;

}



function hasHash(
  hash
){

  if(
    !hash
  ){
    return false;
  }

  return processedHashes.has(
    hash
  );

}



function clearHashes(){

  processedHashes.clear();

  return true;

}



// =====================================
// CACHE STORAGE
// =====================================

function setCache(
  key,
  value
){

  if(
    !key
  ){
    return false;
  }

  responseCache.set(

    key,

    {

      value,

      timestamp:
      Date.now()

    }

  );

  while(

    responseCache.size >

    COMMUNICATION_LIMITS
    .MAX_CACHE_ENTRIES

  ){

    const oldest =

      responseCache
      .keys()
      .next()
      .value;

    responseCache.delete(
      oldest
    );

  }

  return true;

}



function getCache(
  key
){

  const entry =

    responseCache.get(
      key
    );

  if(
    !entry
  ){
    return null;
  }

  const expired =

    Date.now()

    -

    entry.timestamp

    >

    COMMUNICATION_TIMERS
    .CACHE_TTL;

  if(
    expired
  ){

    responseCache.delete(
      key
    );

    return null;

  }

  return entry.value;

}



function removeCache(
  key
){

  return responseCache.delete(
    key
  );

}



function clearCache(){

  responseCache.clear();

  return true;

}



// =====================================
// TTL CLEANUP
// =====================================

function cleanupExpiredHashes(){

  const now =
  Date.now();

  for(
    const [

      hash,

      timestamp

    ]

    of

    processedHashes
  ){

    const expired =

      now -

      timestamp >

      COMMUNICATION_TIMERS
      .HASH_TTL;

    if(
      expired
    ){

      processedHashes
      .delete(
        hash
      );

    }

  }

  return true;

}



function cleanupExpiredCache(){

  const now =
  Date.now();

  for(
    const [

      key,

      entry

    ]

    of

    responseCache
  ){

    const expired =

      now -

      entry.timestamp >

      COMMUNICATION_TIMERS
      .CACHE_TTL;

    if(
      expired
    ){

      responseCache
      .delete(
        key
      );

    }

  }

  return true;

}



// =====================================
// STATS
// =====================================

function getStorageStats(){

  return Object.freeze({

    hashes:
    processedHashes.size,

    cache:
    responseCache.size

  });

}



// =====================================
// RESET
// =====================================

function resetStorage(){

  processedHashes.clear();

  responseCache.clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationStorage =
Object.freeze({

  registerHash,

  hasHash,

  clearHashes,

  setCache,

  getCache,

  removeCache,

  clearCache,

  cleanupExpiredHashes,

  cleanupExpiredCache,

  getStorageStats,

  resetStorage

});



// =====================================
// EXPORTS
// =====================================

export {

  registerHash,

  hasHash,

  clearHashes,

  setCache,

  getCache,

  removeCache,

  clearCache,

  cleanupExpiredHashes,

  cleanupExpiredCache,

  getStorageStats,

  resetStorage,

  CommunicationStorage

};

export default
CommunicationStorage;
