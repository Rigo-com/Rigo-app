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



// =====================================
// PUBLIC API
// =====================================

const MemoryManager =
Object.freeze({

  initialize,

  shutdown,

  create,

  update,

  remove,

  search,

  searchOne,

  addContext,

  getContext,

  clearContext,

  summary,

  maintenance,

  health,

  debug

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  shutdown,

  create,

  update,

  remove,

  search,

  searchOne,

  addContext,

  getContext,

  clearContext,

  summary,

  maintenance,

  health,

  debug,

  MemoryManager

};

export default
MemoryManager;
