// =====================================
// RIGO AI
// MEMORY MANAGER
// HIGH LEVEL MEMORY API
// =====================================

import {
  MemoryCore
}
from "./memory-core.js";

import {
  MemorySearch
}
from "./memory-search.js";

import {
  MemoryContext
}
from "./memory-context.js";

import {
  MemorySummary
}
from "./memory-summary.js";

import {
  MemorySubsystem
}
from "./memory-subsystem.js";

import {
  MemoryDebug
}
from "./memory-debug.js";

import {
  MemorySyncCloud
}
from "./memory-sync-cloud.js";



// =====================================
// LIFECYCLE
// =====================================

function initialize(){

  return MemorySubsystem
  .initialize();

}



function shutdown(){

  return MemorySubsystem
  .shutdown();

}


function reset(){

  MemorySubsystem
  .shutdown();

  return MemorySubsystem
  .initialize();

}



// =====================================
// MEMORY
// =====================================

function create(

  content,

  options = {}

){

  return MemoryCore
  .createMemory(

    content,

    options

  );

}



function update(

  memoryId,

  updates

){

  return MemoryCore
  .updateMemory(

    memoryId,

    updates

  );

}



function remove(
  memoryId
){

  return MemoryCore
  .deleteMemory(
    memoryId
  );

}



// =====================================
// SEARCH
// =====================================

function search(

  query,

  options = {}

){

  return MemorySearch
  .searchMemories(

    query,

    options

  );

}



function searchOne(
  query
){

  return MemorySearch
  .searchMemory(
    query
  );

}



// =====================================
// CONTEXT
// =====================================

function addContext(
  item
){

  return MemoryContext
  .addContextItem(
    item
  );

}

function removeContext(
  id
){

  return MemoryContext
  .removeContextItem(
    id
  );

}


function getContext(){

  return MemoryContext
  .getContextItems();

}



function clearContext(){

  return MemoryContext
  .clearContext();

}



// =====================================
// SUMMARY
// =====================================

function summary(){

  return MemorySummary
  .createGlobalSummary();

}



// =====================================
// MAINTENANCE
// =====================================

function maintenance(){

  return MemorySubsystem
  .maintenance();

}


function sync(provider){

  return MemorySyncCloud
  .syncToCloud(provider);

}


function restore(provider){

  return MemorySyncCloud
  .restoreFromCloud(provider);

}



// =====================================
// DIAGNOSTICS
// =====================================

function health(){

  return MemorySubsystem
  .status();

}



function debug(){

  return MemoryDebug
  .getDebugSnapshot();

}


function snapshot(){

  return health();

}



// =====================================
// PUBLIC API
// =====================================

const MemoryManager =
Object.freeze({

  initialize,

  shutdown,

  reset,

  create,

  update,

  remove,

  search,

  searchOne,

  addContext,

  removeContext,

  getContext,

  clearContext,

  summary,

  maintenance,

  sync,

  restore,

  health,

  debug,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  shutdown,

  reset,

  create,

  update,

  remove,

  search,

  searchOne,

  addContext,

  removeContext,

  getContext,

  clearContext,

  summary,

  maintenance,

  sync,

  restore,

  health,

  debug,

  snapshot,

  MemoryManager

};

export default
MemoryManager;
