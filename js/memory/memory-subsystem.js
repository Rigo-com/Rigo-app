import { initialize, reload, destroy, health } from "./memory-core.js";
import { buildIndex } from "./memory-indexing.js";
import { cleanupMemorySystem } from "./memory-cleanup.js";
import { createGlobalSummary } from "./memory-summary.js";
import { getCloudSyncStatus, syncToCloud } from "./memory-sync-cloud.js";
import { MEMORY_TIMERS } from "./memory-constants.js";
import { hydrateMemories } from "./memory-storage.js";

const schedulerState = Object.seal({
  cleanupTimer:null, summaryTimer:null, indexingTimer:null, cloudSyncTimer:null,
  cloudProvider:null,
  initializePromise:null,
  shutdownPromise:null,
  diagnostics:Object.seal({ timersStarted:0, timersStopped:0, cleanupRuns:0, summaryRuns:0, indexingRuns:0, cloudSyncRuns:0 })
});

function createSchedulerTimer(handler, interval){
  const timer = setInterval(handler, interval);
  timer?.unref?.();
  schedulerState.diagnostics.timersStarted++;
  return timer;
}

function startScheduledMaintenance(){
  if(!schedulerState.cleanupTimer) schedulerState.cleanupTimer = createSchedulerTimer(() => { cleanupMemorySystem(); schedulerState.diagnostics.cleanupRuns++; }, MEMORY_TIMERS.CLEANUP_INTERVAL);
  if(!schedulerState.summaryTimer) schedulerState.summaryTimer = createSchedulerTimer(() => { createGlobalSummary(); schedulerState.diagnostics.summaryRuns++; }, MEMORY_TIMERS.AUTO_SUMMARY_INTERVAL);
  if(!schedulerState.indexingTimer) schedulerState.indexingTimer = createSchedulerTimer(() => { buildIndex(); schedulerState.diagnostics.indexingRuns++; }, MEMORY_TIMERS.INDEXING_INTERVAL);
  if(schedulerState.cloudProvider && !schedulerState.cloudSyncTimer){
    schedulerState.cloudSyncTimer = createSchedulerTimer(() => {
      syncToCloud(schedulerState.cloudProvider).catch(() => {});
      schedulerState.diagnostics.cloudSyncRuns++;
    }, MEMORY_TIMERS.CLOUD_SYNC_INTERVAL);
  }
  return true;
}

function stopScheduledMaintenance(){
  for(const timerName of ["cleanupTimer", "summaryTimer", "indexingTimer", "cloudSyncTimer"]){
    if(!schedulerState[timerName]) continue;
    clearInterval(schedulerState[timerName]);
    schedulerState[timerName] = null;
    schedulerState.diagnostics.timersStopped++;
  }
  return true;
}

function configureCloudSync(provider = null){
  if(provider !== null && typeof provider !== "function") return false;
  if(schedulerState.cloudSyncTimer){
    clearInterval(schedulerState.cloudSyncTimer);
    schedulerState.cloudSyncTimer = null;
    schedulerState.diagnostics.timersStopped++;
  }
  schedulerState.cloudProvider = provider;
  if(provider && health().initialized) startScheduledMaintenance();
  return true;
}

function getSchedulerStatus(){
  return Object.freeze({
    cleanup:Boolean(schedulerState.cleanupTimer), summary:Boolean(schedulerState.summaryTimer),
    indexing:Boolean(schedulerState.indexingTimer), cloudSync:Boolean(schedulerState.cloudSyncTimer),
    cloudProviderConfigured:Boolean(schedulerState.cloudProvider),
    initializing:Boolean(schedulerState.initializePromise), shuttingDown:Boolean(schedulerState.shutdownPromise),
    diagnostics:Object.freeze({ ...schedulerState.diagnostics })
  });
}

function initializeSubsystem(){
  if(health().initialized) return Promise.resolve(true);
  if(schedulerState.initializePromise) return schedulerState.initializePromise;
  if(schedulerState.shutdownPromise) return schedulerState.shutdownPromise.then(() => initializeSubsystem());
  schedulerState.initializePromise = Promise.resolve().then(async() => {
    if(typeof window !== "undefined") await hydrateMemories();
    if(!initialize()) return false;
    reload();
    startScheduledMaintenance();
    return true;
  }).catch(() => false).finally(() => { schedulerState.initializePromise = null; });
  return schedulerState.initializePromise;
}

function runMaintenance(){
  return Object.freeze({ cleanup:cleanupMemorySystem(), summary:createGlobalSummary() });
}
const rebuildIndexes = () => (buildIndex(), true);
const getSubsystemStatus = () => Object.freeze({ memory:health(), cloud:getCloudSyncStatus(), scheduler:getSchedulerStatus() });

function shutdownSubsystem(options = {}){
  if(schedulerState.shutdownPromise) return schedulerState.shutdownPromise;
  if(schedulerState.initializePromise) return schedulerState.initializePromise.then(() => shutdownSubsystem(options));
  schedulerState.shutdownPromise = Promise.resolve().then(async() => {
    stopScheduledMaintenance();
    if(!options.preserveCloudProvider) schedulerState.cloudProvider = null;
    destroy();
    return true;
  }).finally(() => { schedulerState.shutdownPromise = null; });
  return schedulerState.shutdownPromise;
}

function resetSubsystem(){
  stopScheduledMaintenance();
  destroy();
  if(!initialize()) return false;
  reload();
  startScheduledMaintenance();
  return true;
}

const MemorySubsystem = Object.freeze({ initialize:initializeSubsystem, maintenance:runMaintenance, rebuildIndexes, configureCloudSync, scheduler:getSchedulerStatus, status:getSubsystemStatus, shutdown:shutdownSubsystem, reset:resetSubsystem });
export { schedulerState, initializeSubsystem, runMaintenance, rebuildIndexes, startScheduledMaintenance, stopScheduledMaintenance, configureCloudSync, getSchedulerStatus, getSubsystemStatus, shutdownSubsystem, resetSubsystem, MemorySubsystem };
export default MemorySubsystem;
