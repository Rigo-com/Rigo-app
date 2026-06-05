// =====================================
// RIGO AI
// MEMORY CORE
// CORE MEMORY OPERATIONS
// =====================================

import {
  MEMORY_EVENTS
}
from "./memory-constants.js";

import {
  MEMORY_STATES
}
from "./memory-types.js";

import {
  emit
}
from "./memory-events.js";

import {
  MemoryState
}
from "./memory-state.js";

import {
  createMemoryRecord
}
from "./memory-utils.js";

import {
  validateMemoryRecord
}
from "./memory-validation.js";

import {
  loadMemories,
  saveMemories
}
from "./memory-storage.js";

import {
  indexMemory,
  buildIndex
}
from "./memory-indexing.js";



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    MemoryState
    .snapshot()
    .initialized
  ){
    return true;
  }

  MemoryState
  .setState(
    MEMORY_STATES
    .INITIALIZING
  );

  const memories =
  loadMemories();

  for(
    const memory
    of memories
  ){

    MemoryState
    .setMemory(
      memory.id,
      memory
    );

  }

  buildIndex();

  MemoryState
  .setInitialized(
    true
  );

  MemoryState
  .setState(
    MEMORY_STATES
    .READY
  );

  emit(
    MEMORY_EVENTS
    .INITIALIZED
  );

  return true;

}



// =====================================
// CREATE
// =====================================

function createMemory(
  content,
  options = {}
){

  const memory =

    createMemoryRecord(
      content,
      options
    );

  if(
    !validateMemoryRecord(
      memory
    )
  ){
    return null;
  }

  const memories =
  loadMemories();

  memories.push(
    memory
  );

  saveMemories(
    memories
  );

  MemoryState
  .setMemory(
    memory.id,
    memory
  );

  indexMemory(
    memory
  );

  MemoryState
  .incrementCreated();

  emit(

    MEMORY_EVENTS
    .CREATED,

    memory

  );

  return memory;

}



// =====================================
// UPDATE
// =====================================

function updateMemory(
  memoryId,
  updates = {}
){

  const memories =
  loadMemories();

  const index =

    memories.findIndex(

      memory =>

      memory.id ===
      memoryId

    );

  if(
    index < 0
  ){
    return false;
  }

  memories[index] = {

    ...memories[index],

    ...updates,

    updatedAt:
    Date.now()

  };

  saveMemories(
    memories
  );

  MemoryState
  .setMemory(

    memoryId,

    memories[index]

  );

  MemoryState
  .incrementUpdated();

  emit(

    MEMORY_EVENTS
    .UPDATED,

    memories[index]

  );

  return true;

}



// =====================================
// DELETE
// =====================================

function deleteMemory(
  memoryId
){

  const memories =
  loadMemories();

  const filtered =

    memories.filter(

      memory =>

      memory.id !==
      memoryId

    );

  saveMemories(
    filtered
  );

  MemoryState
  .removeMemory(
    memoryId
  );

  MemoryState
  .incrementDeleted();

  emit(

    MEMORY_EVENTS
    .REMOVED,

    {
      memoryId
    }

  );

  return true;

}



// =====================================
// HEALTH
// =====================================

function health(){

  return Object.freeze({

    ...MemoryState
    .snapshot(),

    diagnostics:

    MemoryState
    .diagnostics()

  });

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  MemoryState
  .reset();

  emit(
    MEMORY_EVENTS
    .DESTROYED
  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryCore =
Object.freeze({

  initialize,

  createMemory,

  updateMemory,

  deleteMemory,

  health,

  destroy

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  createMemory,

  updateMemory,

  deleteMemory,

  health,

  destroy,

  MemoryCore

};

export default
MemoryCore;
