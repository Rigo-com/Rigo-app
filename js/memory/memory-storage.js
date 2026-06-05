// =====================================
// RIGO AI
// MEMORY STORAGE
// STORAGE LAYER
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
  sanitizeMemories
}
from "./memory-security.js";

import {
  validateMemoryCollection
}
from "./memory-validation.js";



// =====================================
// LOAD MEMORIES
// =====================================

function loadMemories(){

  try{

    const memories =

      load(
        STORAGE_KEYS
        .MEMORY
      );

    if(
      !memories
    ){
      return [];
    }

    const sanitized =

      sanitizeMemories(
        memories
      );

    if(

      !validateMemoryCollection(
        sanitized
      )

    ){
      return [];
    }

    return sanitized;

  }

  catch{

    return [];

  }

}



// =====================================
// SAVE MEMORIES
// =====================================

function saveMemories(
  memories = []
){

  try{

    const sanitized =

      sanitizeMemories(
        memories
      );

    if(

      !validateMemoryCollection(
        sanitized
      )

    ){
      return false;
    }

    return save(

      STORAGE_KEYS
      .MEMORY,

      sanitized

    );

  }

  catch{

    return false;

  }

}



// =====================================
// APPEND MEMORY
// =====================================

function appendMemory(
  memory
){

  const memories =
  loadMemories();

  memories.push(
    memory
  );

  return saveMemories(
    memories
  );

}



// =====================================
// REMOVE MEMORY
// =====================================

function removeStoredMemory(
  memoryId
){

  const memories =

    loadMemories();

  const filtered =

    memories.filter(

      memory =>

      memory?.id !==
      memoryId

    );

  return saveMemories(
    filtered
  );

}



// =====================================
// CLEAR MEMORIES
// =====================================

function clearStoredMemories(){

  return saveMemories(
    []
  );

}



// =====================================
// COUNT
// =====================================

function getStoredMemoryCount(){

  return loadMemories()
  .length;

}



// =====================================
// STATS
// =====================================

function getStorageStats(){

  return Object.freeze({

    memories:

    getStoredMemoryCount()

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryStorage =
Object.freeze({

  loadMemories,

  saveMemories,

  appendMemory,

  removeStoredMemory,

  clearStoredMemories,

  getStoredMemoryCount,

  getStorageStats

});



// =====================================
// EXPORTS
// =====================================

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

export default
MemoryStorage;
