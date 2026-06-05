// =====================================
// RIGO AI
// MEMORY DEBUG
// DIAGNOSTICS LAYER
// =====================================

import {
  getMemorySnapshot,
  getMemoryDiagnostics,
  memoryState
}
from "./memory-state.js";

import {
  getStorageStats
}
from "./memory-storage.js";

import {
  getIndexStats
}
from "./memory-indexing.js";

import {
  getCloudSyncStatus
}
from "./memory-sync-cloud.js";



// =====================================
// SNAPSHOT
// =====================================

function getDebugSnapshot(){

  return Object.freeze({

    state:
    getMemorySnapshot(),

    diagnostics:
    getMemoryDiagnostics(),

    storage:
    getStorageStats(),

    indexing:
    getIndexStats(),

    cloud:
    getCloudSyncStatus()

  });

}



// =====================================
// MEMORY COUNTS
// =====================================

function getMemoryCounts(){

  return Object.freeze({

    memories:
    memoryState
    .memories
    .size,

    embeddings:
    memoryState
    .embeddings
    .size,

    indexes:
    memoryState
    .indexes
    .size,

    summaries:
    memoryState
    .summaries
    .size,

    context:
    memoryState
    .context
    .length

  });

}



// =====================================
// HEALTH CHECK
// =====================================

function runHealthCheck(){

  const snapshot =
  getMemorySnapshot();

  return Object.freeze({

    healthy:
    snapshot.healthy,

    initialized:
    snapshot.initialized,

    processing:
    snapshot.processing,

    searching:
    snapshot.searching,

    indexing:
    snapshot.indexing,

    syncing:
    snapshot.syncing

  });

}



// =====================================
// EXPORT DEBUG DATA
// =====================================

function exportDebugData(){

  return JSON.stringify(

    getDebugSnapshot(),

    null,

    2

  );

}



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetDebugSession(){

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryDebug =
Object.freeze({

  getDebugSnapshot,

  getMemoryCounts,

  runHealthCheck,

  exportDebugData,

  resetDebugSession

});



// =====================================
// EXPORTS
// =====================================

export {

  getDebugSnapshot,

  getMemoryCounts,

  runHealthCheck,

  exportDebugData,

  resetDebugSession,

  MemoryDebug

};

export default
MemoryDebug;
