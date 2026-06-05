// =====================================
// RIGO AI
// MEMORY STATE
// FOUNDATION STATE LAYER
// =====================================

import {
  MEMORY_STATES
}
from "./memory-types.js";



// =====================================
// MEMORY STATE
// =====================================

const memoryState =
Object.seal({

  initialized:false,

  processing:false,

  searching:false,

  indexing:false,

  syncing:false,

  healthy:true,

  currentState:
  MEMORY_STATES.IDLE,



  // ===================================
  // MEMORY DATA
  // ===================================

  memories:
  new Map(),

  context:
  [],

  summaries:
  new Map(),

  embeddings:
  new Map(),

  indexes:
  new Map(),



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  Object.seal({

    created:0,

    updated:0,

    deleted:0,

    searches:0,

    indexed:0,

    summarized:0,

    synced:0,

    failures:0

  })

});



// =====================================
// FLAGS
// =====================================

function setInitialized(
  value
){

  memoryState
  .initialized =
  Boolean(value);

}



function setProcessing(
  value
){

  memoryState
  .processing =
  Boolean(value);

}



function setSearching(
  value
){

  memoryState
  .searching =
  Boolean(value);

}



function setIndexing(
  value
){

  memoryState
  .indexing =
  Boolean(value);

}



function setSyncing(
  value
){

  memoryState
  .syncing =
  Boolean(value);

}



function setHealthy(
  value
){

  memoryState
  .healthy =
  Boolean(value);

}



function setState(
  state
){

  memoryState
  .currentState =
  state;

}



// =====================================
// MEMORY STORE
// =====================================

function setMemory(
  id,
  memory
){

  memoryState
  .memories
  .set(

    id,

    memory

  );

  return true;

}



function getMemory(
  id
){

  return (

    memoryState
    .memories
    .get(id)

    ??

    null

  );

}



function removeMemory(
  id
){

  return memoryState
  .memories
  .delete(
    id
  );

}



function clearMemories(){

  memoryState
  .memories
  .clear();

  return true;

}



// =====================================
// CONTEXT
// =====================================

function setContext(
  context = []
){

  memoryState
  .context =

  Array.isArray(
    context
  )

  ? context

  : [];

  return true;

}



function getContext(){

  return [

    ...memoryState
    .context

  ];

}



// =====================================
// EMBEDDINGS
// =====================================

function setEmbedding(
  id,
  embedding
){

  memoryState
  .embeddings
  .set(

    id,

    embedding

  );

  return true;

}



function getEmbedding(
  id
){

  return (

    memoryState
    .embeddings
    .get(id)

    ??

    null

  );

}



// =====================================
// INDEXES
// =====================================

function setIndex(
  key,
  value
){

  memoryState
  .indexes
  .set(

    key,

    value

  );

  return true;

}



function getIndex(
  key
){

  return (

    memoryState
    .indexes
    .get(key)

    ??

    null

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementCreated(){

  memoryState
  .diagnostics
  .created++;

}



function incrementUpdated(){

  memoryState
  .diagnostics
  .updated++;

}



function incrementDeleted(){

  memoryState
  .diagnostics
  .deleted++;

}



function incrementSearches(){

  memoryState
  .diagnostics
  .searches++;

}



function incrementIndexed(){

  memoryState
  .diagnostics
  .indexed++;

}



function incrementSummarized(){

  memoryState
  .diagnostics
  .summarized++;

}



function incrementSynced(){

  memoryState
  .diagnostics
  .synced++;

}



function incrementFailures(){

  memoryState
  .diagnostics
  .failures++;

}



// =====================================
// SNAPSHOT
// =====================================

function getMemorySnapshot(){

  return Object.freeze({

    initialized:
    memoryState.initialized,

    processing:
    memoryState.processing,

    searching:
    memoryState.searching,

    indexing:
    memoryState.indexing,

    syncing:
    memoryState.syncing,

    healthy:
    memoryState.healthy,

    currentState:
    memoryState.currentState,

    memories:
    memoryState.memories.size,

    summaries:
    memoryState.summaries.size,

    embeddings:
    memoryState.embeddings.size,

    indexes:
    memoryState.indexes.size,

    context:
    memoryState.context.length

  });

}



function getMemoryDiagnostics(){

  return Object.freeze({

    ...memoryState
    .diagnostics

  });

}



// =====================================
// RESET
// =====================================

function resetMemoryState(){

  memoryState.initialized = false;
  memoryState.processing = false;
  memoryState.searching = false;
  memoryState.indexing = false;
  memoryState.syncing = false;
  memoryState.healthy = true;

  memoryState.currentState =
  MEMORY_STATES.IDLE;

  memoryState.memories.clear();
  memoryState.summaries.clear();
  memoryState.embeddings.clear();
  memoryState.indexes.clear();

  memoryState.context = [];

  Object.keys(
    memoryState
    .diagnostics
  )
  .forEach(key => {

    memoryState
    .diagnostics[key] = 0;

  });

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryState =
Object.freeze({

  setInitialized,
  setProcessing,
  setSearching,
  setIndexing,
  setSyncing,
  setHealthy,
  setState,

  setMemory,
  getMemory,
  removeMemory,
  clearMemories,

  setContext,
  getContext,

  setEmbedding,
  getEmbedding,

  setIndex,
  getIndex,

  incrementCreated,
  incrementUpdated,
  incrementDeleted,
  incrementSearches,
  incrementIndexed,
  incrementSummarized,
  incrementSynced,
  incrementFailures,

  snapshot:
  getMemorySnapshot,

  diagnostics:
  getMemoryDiagnostics,

  reset:
  resetMemoryState

});



// =====================================
// EXPORTS
// =====================================

export {

  memoryState,

  setInitialized,
  setProcessing,
  setSearching,
  setIndexing,
  setSyncing,
  setHealthy,
  setState,

  setMemory,
  getMemory,
  removeMemory,
  clearMemories,

  setContext,
  getContext,

  setEmbedding,
  getEmbedding,

  setIndex,
  getIndex,

  incrementCreated,
  incrementUpdated,
  incrementDeleted,
  incrementSearches,
  incrementIndexed,
  incrementSummarized,
  incrementSynced,
  incrementFailures,

  getMemorySnapshot,
  getMemoryDiagnostics,

  resetMemoryState,

  MemoryState

};

export default
MemoryState;
