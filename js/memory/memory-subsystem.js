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
  getCloudSyncStatus,
  syncToCloud
}
from "./memory-sync-cloud.js";

import {
  MEMORY_TIMERS
}
from "./memory-constants.js";

import {
  hydrateMemories
}
from "./memory-storage.js";



// =====================================
// SCHEDULER STATE
// =====================================

const schedulerState =
Object.seal({
  cleanupTimer:null,
  summaryTimer:null,
  indexingTimer:null,
  cloudSyncTimer:null,
  cloudProvider:null,
  diagnostics:Object.seal({
    timersStarted:0,
    timersStopped:0,
    cleanupRuns:0,
    summaryRuns:0,
    indexingRuns:0,
    cloudSyncRuns:0
  })
});


function createSchedulerTimer(
  handler,
  interval
){
  const timer =
  setInterval(
    handler,
    interval
  );

  timer?.unref?.();

  schedulerState
  .diagnostics
  .timersStarted++;

  return timer;
}


function startScheduledMaintenance(){

  if(!schedulerState.cleanupTimer){
    schedulerState.cleanupTimer =
    createSchedulerTimer(() => {
      cleanupMemorySystem();
      schedulerState.diagnostics.cleanupRuns++;
    },MEMORY_TIMERS.CLEANUP_INTERVAL);
  }

  if(!schedulerState.summaryTimer){
    schedulerState.summaryTimer =
    createSchedulerTimer(() => {
      createGlobalSummary();
      schedulerState.diagnostics.summaryRuns++;
    },MEMORY_TIMERS.AUTO_SUMMARY_INTERVAL);
  }

  if(!schedulerState.indexingTimer){
    schedulerState.indexingTimer =
    createSchedulerTimer(() => {
      buildIndex();
      schedulerState.diagnostics.indexingRuns++;
    },MEMORY_TIMERS.INDEXING_INTERVAL);
  }

  if(
    schedulerState.cloudProvider &&
    !schedulerState.cloudSyncTimer
  ){
    schedulerState.cloudSyncTimer =
    createSchedulerTimer(() => {
      syncToCloud(
        schedulerState.cloudProvider
      )
      .catch(() => {});
      schedulerState.diagnostics.cloudSyncRuns++;
    },MEMORY_TIMERS.CLOUD_SYNC_INTERVAL);
  }

  return true;
}


function stopScheduledMaintenance(){

  for(const timerName of [
    "cleanupTimer",
    "summaryTimer",
    "indexingTimer",
    "cloudSyncTimer"
  ]){
    const timer =
    schedulerState[timerName];

    if(!timer){
      continue;
    }

    clearInterval(timer);
    schedulerState[timerName] = null;
    schedulerState.diagnostics.timersStopped++;
  }

  return true;
}


function configureCloudSync(
  provider = null
){

  if(
    provider !== null &&
    typeof provider !== "function"
  ){
    return false;
  }

  if(schedulerState.cloudSyncTimer){
    clearInterval(
      schedulerState.cloudSyncTimer
    );
    schedulerState.cloudSyncTimer = null;
    schedulerState.diagnostics.timersStopped++;
  }

  schedulerState.cloudProvider =
  provider;

  if(
    provider &&
    health().initialized
  ){
    startScheduledMaintenance();
  }

  return true;
}


function getSchedulerStatus(){

  return Object.freeze({
    cleanup:Boolean(schedulerState.cleanupTimer),
    summary:Boolean(schedulerState.summaryTimer),
    indexing:Boolean(schedulerState.indexingTimer),
    cloudSync:Boolean(schedulerState.cloudSyncTimer),
    cloudProviderConfigured:
    Boolean(schedulerState.cloudProvider),
    diagnostics:Object.freeze({
      ...schedulerState.diagnostics
    })
  });
}



// =====================================
// INITIALIZE
// =====================================

function initializeSubsystem(){

  initialize();

  buildIndex();

  startScheduledMaintenance();

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
    getCloudSyncStatus(),

    scheduler:
    getSchedulerStatus()

  });

}



// =====================================
// SHUTDOWN
// =====================================

function shutdownSubsystem(
  options = {}
){

  stopScheduledMaintenance();

  if(!options.preserveCloudProvider){
    schedulerState.cloudProvider = null;
  }

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

  configureCloudSync,

  scheduler:
  getSchedulerStatus,

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

  startScheduledMaintenance,

  stopScheduledMaintenance,

  configureCloudSync,

  getSchedulerStatus,

  getSubsystemStatus,

  shutdownSubsystem,

  MemorySubsystem

};

export default
MemorySubsystem;
