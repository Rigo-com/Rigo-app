// =====================================
// RIGO AI
// STORAGE MEMORY
// IN-MEMORY STORAGE LAYER
// =====================================

import {
  STORAGE_LIMITS
}
from "./storage-config.js";

import {
  deepClone
}
from "./storage-utils.js";



// =====================================
// MEMORY STORE
// =====================================

const memoryStore =
new Map();



// =====================================
// SET
// =====================================

function setMemoryItem(
  key,
  value
){

  if(
    !key
  ){
    return false;
  }

  memoryStore.set(

    key,

    deepClone(
      value
    )

  );

  while(

    memoryStore.size >

    STORAGE_LIMITS
    .MAX_CACHE_ITEMS

  ){

    const oldestKey =

      memoryStore
      .keys()
      .next()
      .value;

    memoryStore.delete(
      oldestKey
    );

  }

  return true;

}



// =====================================
// GET
// =====================================

function getMemoryItem(
  key
){

  const value =

    memoryStore.get(
      key
    );

  if(
    value === undefined
  ){
    return null;
  }

  return deepClone(
    value
  );

}



// =====================================
// HAS
// =====================================

function hasMemoryItem(
  key
){

  return memoryStore.has(
    key
  );

}



// =====================================
// REMOVE
// =====================================

function removeMemoryItem(
  key
){

  return memoryStore.delete(
    key
  );

}



// =====================================
// CLEAR
// =====================================

function clearMemoryStore(){

  memoryStore.clear();

  return true;

}



// =====================================
// KEYS
// =====================================

function getMemoryKeys(){

  return Array.from(

    memoryStore
    .keys()

  );

}



// =====================================
// VALUES
// =====================================

function getMemoryValues(){

  return Array.from(

    memoryStore
    .values()

  )
  .map(
    deepClone
  );

}



// =====================================
// ENTRIES
// =====================================

function getMemoryEntries(){

  return Array.from(

    memoryStore
    .entries()

  )
  .map(([
    key,
    value
  ]) => [

    key,

    deepClone(
      value
    )

  ]);

}



// =====================================
// SIZE
// =====================================

function getMemorySize(){

  return memoryStore
  .size;

}



// =====================================
// STATS
// =====================================

function getMemoryStats(){

  return Object.freeze({

    items:
    memoryStore.size

  });

}



// =====================================
// PUBLIC API
// =====================================

const StorageMemory =
Object.freeze({

  setMemoryItem,

  getMemoryItem,

  hasMemoryItem,

  removeMemoryItem,

  clearMemoryStore,

  getMemoryKeys,

  getMemoryValues,

  getMemoryEntries,

  getMemorySize,

  getMemoryStats

});



// =====================================
// EXPORTS
// =====================================

export {

  setMemoryItem,

  getMemoryItem,

  hasMemoryItem,

  removeMemoryItem,

  clearMemoryStore,

  getMemoryKeys,

  getMemoryValues,

  getMemoryEntries,

  getMemorySize,

  getMemoryStats,

  StorageMemory

};

export default
StorageMemory;
