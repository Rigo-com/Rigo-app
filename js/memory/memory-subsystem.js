// =====================================
// RIGO AI
// MEMORY SUBSYSTEM
// MEMORY ORCHESTRATION LAYER
// =====================================

import {
  initialize,
  destroy,
  health
}
from "./memory-core.js";

import {
  buildIndex
}
from "./memory-indexing.js";

import {
  cleanupMemorySystem
}
from "./memory-cleanup.js";

import {
  createGlobalSummary
}
from "./memory-summary.js";

import {
  getCloudSyncStatus
}
from "./memory-sync-cloud.js";

import {
  hydrateMemories
}
from "./memory-storage.js";



// =====================================
// INITIALIZE
// =====================================

function initializeSubsystem(){

  initialize();

  buildIndex();

  if(typeof window!=="undefined"){

    hydrateMemories()
    .then(()=>{

      buildIndex();

    })
    .catch(()=>{});

  }

  return true;

}



// =====================================
// MAINTENANCE
// =====================================

function runMaintenance(){

  return Object.freeze({

    cleanup:

    cleanupMemorySystem(),

    summary:

    createGlobalSummary()

  });

}



// =====================================
// REINDEX
// =====================================

function rebuildIndexes(){

  buildIndex();

  return true;

}



// =====================================
// STATUS
// =====================================

function getSubsystemStatus(){

  return Object.freeze({

    memory:
    health(),

    cloud:
    getCloudSyncStatus()

  });

}



// =====================================
// SHUTDOWN
// =====================================

function shutdownSubsystem(){

  destroy();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemorySubsystem =
Object.freeze({

  initialize:
  initializeSubsystem,

  maintenance:
  runMaintenance,

  rebuildIndexes,

  status:
  getSubsystemStatus,

  shutdown:
  shutdownSubsystem

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeSubsystem,

  runMaintenance,

  rebuildIndexes,

  getSubsystemStatus,

  shutdownSubsystem,

  MemorySubsystem

};

export default
MemorySubsystem;
