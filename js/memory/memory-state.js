// =====================================
// RIGO AI
// MEMORY STATE
// ENTERPRISE STABLE FINAL
// OPTIMIZED + HARDENED
// =====================================



// =====================================
// STATE CONFIG
// =====================================

const MEMORY_STATE_CONFIG =
Object.freeze({

  MAX_QUEUE_SIZE:1000,

  MAX_TRACKING_IDS:50000,

  MAX_RUNTIME_ERRORS:100,

  ENABLE_RUNTIME_PROTECTION:true,

  ENABLE_AUTO_CLEANUP:true,

  ENABLE_CONSISTENCY_CHECKS:true,

  SESSION_TIMEOUT:
  1000 * 60 * 30

});



// =====================================
// MEMORY INDEX FACTORY
// =====================================

function createMemoryIndex(){

  return Object.seal({

    byId:new Map(),

    byType:new Map(),

    byCategory:new Map(),

    byPriority:new Map(),

    byTag:new Map(),

    byState:new Map(),

    byCreatedAt:new Map(),

    byUpdatedAt:new Map(),

    byToken:new Map(),

    byContentHash:new Map(),

    byParent:new Map(),

    byChild:new Map(),

    byRelation:new Map()

  });

}



// =====================================
// MEMORY HEALTH
// =====================================

function createMemoryHealth(){

  return Object.seal({

    score:100,

    corruptionCount:0,

    recoveryCount:0,

    lastRecoveryAt:null,

    lastHealthCheckAt:
    Date.now()

  });

}



// =====================================
// MEMORY METRICS
// =====================================

function createMemoryMetrics(){

  return Object.seal({

    totalMemories:0,

    activeMemories:0,

    archivedMemories:0,

    deletedMemories:0,

    pinnedMemories:0,

    cachedMemories:0,

    indexedMemories:0,

    failedOperations:0,

    successfulOperations:0,

    lastSaveAt:null,

    lastLoadAt:null,

    lastCleanupAt:null,

    lastErrorAt:null,

    loadDuration:0,

    saveDuration:0,

    averageLoadDuration:0,

    averageSaveDuration:0

  });

}



// =====================================
// MEMORY RUNTIME
// =====================================

function createMemoryRuntime(){

  return Object.seal({

    initialized:false,

    loading:false,

    saving:false,

    syncing:false,

    cleaning:false,

    rebuildingIndexes:false,

    hydrating:false,

    migrating:false,

    resetting:false,

    locked:false,

    corrupted:false,

    panicMode:false,

    startupAt:
    Date.now(),

    shutdownAt:null,

    lastError:null,

    runtimeErrors:[],

    activeOperations:0,

    pendingSaves:0,

    pendingCleanup:0,

    pendingSync:0,

    version:
    MEMORY_VERSION

  });

}



// =====================================
// MEMORY QUEUES
// =====================================

function createMemoryQueues(){

  return Object.seal({

    saveQueue:[],

    cleanupQueue:[],

    syncQueue:[],

    retryQueue:[],

    operationQueue:[]

  });

}



// =====================================
// MEMORY CACHE
// =====================================

function createMemoryCache(){

  return Object.seal({

    memories:new Map(),

    searchResults:new Map(),

    summaries:new Map(),

    context:new Map(),

    metadata:new Map(),

    relevance:new Map(),

    embeddings:new Map(),

    tokens:new Map()

  });

}



// =====================================
// MEMORY TRACKING
// =====================================

function createMemoryTracking(){

  return Object.seal({

    corruptedIds:new Set(),

    dirtyIds:new Set(),

    accessedIds:new Set(),

    expiredIds:new Set(),

    deletedIds:new Set(),

    syncedIds:new Set(),

    lockedIds:new Set(),

    pinnedMemoryIds:new Set(),

    sessionMemoryIds:new Set(),

    temporaryMemoryIds:new Set()

  });

}



// =====================================
// MEMORY SESSION
// =====================================

function createMemorySession(){

  return Object.seal({

    sessionId:
    createMemoryId(),

    startedAt:
    Date.now(),

    lastActivityAt:
    Date.now(),

    interactionCount:0

  });

}



// =====================================
// MEMORY STATS
// =====================================

function createMemoryStatsState(){

  return Object.seal({

    searches:0,

    saves:0,

    loads:0,

    cleanups:0,

    imports:0,

    exports:0,

    updates:0,

    deletions:0

  });

}



// =====================================
// MEMORY STATE
// =====================================

const memoryState =
Object.seal({

  initialized:false,

  memories:[],

  activeMemoryId:null,

  indexes:
  createMemoryIndex(),

  cache:
  createMemoryCache(),

  queues:
  createMemoryQueues(),

  tracking:
  createMemoryTracking(),

  metrics:
  createMemoryMetrics(),

  health:
  createMemoryHealth(),

  stats:
  createMemoryStatsState(),

  runtime:
  createMemoryRuntime(),

  session:
  createMemorySession(),

  version:
  MEMORY_VERSION

});



// =====================================
// STATE HELPERS
// =====================================

function isMemoryStateInitialized(){

  return Boolean(
    memoryState.initialized
  );

}



function setMemoryStateInitialized(
  value
){

  memoryState.initialized =
  Boolean(value);

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createMemoryStateSnapshot(){

  const safeClone =

    typeof deepClone ===
    "function"

    ? deepClone

    : structuredClone;

  const safeFreeze =

    typeof deepFreeze ===
    "function"

    ? deepFreeze

    : Object.freeze;

  return safeFreeze({

    initialized:
    memoryState.initialized,

    activeMemoryId:
    memoryState.activeMemoryId,

    memoryCount:
    memoryState.memories.length,

    metrics:
    safeClone(
      memoryState.metrics
    ),

    runtime:
    safeClone(
      memoryState.runtime
    ),

    health:
    safeClone(
      memoryState.health
    ),

    stats:
    safeClone(
      memoryState.stats
    ),

    timestamp:
    Date.now()

  });

}



// =====================================
// RUNTIME HELPERS
// =====================================

function isMemoryLocked(){

  return Boolean(
    memoryState.runtime.locked
  );

}



function lockMemoryState(){

  if(
    memoryState.runtime.locked
  ){

    return false;

  }

  memoryState.runtime.locked =
  true;

  return true;

}



function unlockMemoryState(){

  memoryState.runtime.locked =
  false;

  return true;

}



// =====================================
// OPERATION HELPERS
// =====================================

function incrementMemoryOperations(){

  memoryState.runtime
  .activeOperations++;

  return memoryState.runtime
  .activeOperations;

}



function decrementMemoryOperations(){

  memoryState.runtime
  .activeOperations =
  Math.max(

    0,

    memoryState.runtime
    .activeOperations - 1

  );

  return memoryState.runtime
  .activeOperations;

}



// =====================================
// RUNTIME ERROR
// =====================================

function registerMemoryRuntimeError(
  error
){

  const safeError = {

    id:createMemoryId(),

    message:String(

      error?.message ||
      error ||
      "Unknown error"

    ).slice(0,2000),

    timestamp:
    Date.now()

  };

  memoryState.runtime
  .runtimeErrors
  .push(
    safeError
  );

  while(

    memoryState.runtime
    .runtimeErrors.length >

    MEMORY_STATE_CONFIG
    .MAX_RUNTIME_ERRORS

  ){

    memoryState.runtime
    .runtimeErrors.shift();

  }

  memoryState.runtime.lastError =
  safeError;

  memoryState.metrics
  .failedOperations++;

  memoryState.metrics
  .lastErrorAt =
  Date.now();

  return true;

}



// =====================================
// MEMORY LOOKUP
// =====================================

function getMemoryById(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return null;

  }

  return (

    memoryState.indexes
    .byId
    .get(
      normalizedMemoryId
    )

    ||

    null

  );

}



function hasMemory(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  return memoryState.indexes
  .byId
  .has(
    normalizedMemoryId
  );

}



// =====================================
// ACTIVE MEMORY
// =====================================

function setActiveMemory(
  memoryId
){

  if(!memoryId){

    memoryState.activeMemoryId =
    null;

    return true;

  }

  const memory =
  getMemoryById(
    memoryId
  );

  if(!memory){

    return false;

  }

  memoryState.activeMemoryId =
  memory.id;

  return true;

}



// =====================================
// MEMORY COUNTS
// =====================================

function getMemoryCount(){

  return memoryState.metrics
  .totalMemories;

}



function getPinnedMemoryCount(){

  return memoryState.tracking
  .pinnedMemoryIds.size;

}



function getSessionMemoryCount(){

  return memoryState.tracking
  .sessionMemoryIds.size;

}



// =====================================
// METRICS UPDATE
// =====================================

function updateMemoryMetrics(){

  const memories =
  memoryState.memories;

  memoryState.metrics
  .totalMemories =
  memories.length;

  memoryState.metrics
  .pinnedMemories =
  memoryState.tracking
  .pinnedMemoryIds.size;

  memoryState.metrics
  .cachedMemories =
  memoryState.cache
  .memories.size;

  memoryState.metrics
  .indexedMemories =
  memoryState.indexes
  .byId.size;

  let active = 0;
  let archived = 0;
  let deleted = 0;

  memories.forEach((memory) => {

    switch(memory?.state){

      case "active":
        active++;
      break;

      case "archived":
        archived++;
      break;

      case "deleted":
        deleted++;
      break;

    }

  });

  memoryState.metrics
  .activeMemories =
  active;

  memoryState.metrics
  .archivedMemories =
  archived;

  memoryState.metrics
  .deletedMemories =
  deleted;

  memoryState.health
  .lastHealthCheckAt =
  Date.now();

  return true;

}



// =====================================
// TRACKING CLEANUP
// =====================================

function cleanupTrackingState(){

  const validIds =
  new Set(

    memoryState.memories
    .map((memory) => {

      return memory?.id;

    })
    .filter(Boolean)

  );

  Object.values(
    memoryState.tracking
  )
  .forEach((trackingSet) => {

    if(
      !(trackingSet instanceof Set)
    ){

      return;
    }

    [...trackingSet]
    .forEach((id) => {

      if(
        !validIds.has(id)
      ){

        trackingSet.delete(id);

      }

    });

  });

  return true;

}



// =====================================
// TRACKING HELPERS
// =====================================

function markMemoryDirty(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  memoryState.tracking
  .dirtyIds
  .add(
    normalizedMemoryId
  );

  return true;

}



function markMemoryCorrupted(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  memoryState.tracking
  .corruptedIds
  .add(
    normalizedMemoryId
  );

  memoryState.runtime
  .corrupted = true;

  memoryState.health
  .corruptionCount++;

  return true;

}



function markMemoryDeleted(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  memoryState.tracking
  .deletedIds
  .add(
    normalizedMemoryId
  );

  return true;

}



function markMemoryAccessed(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  memoryState.tracking
  .accessedIds
  .add(
    normalizedMemoryId
  );

  memoryState.session
  .lastActivityAt =
  Date.now();

  memoryState.session
  .interactionCount++;

  return true;

}



// =====================================
// CACHE HELPERS
// =====================================

function clearMemoryCache(){

  Object.values(
    memoryState.cache
  )
  .forEach((cacheMap) => {

    if(
      typeof cacheMap?.clear ===
      "function"
    ){

      cacheMap.clear();

    }

  });

  return true;

}



// =====================================
// INDEX HELPERS
// =====================================

function resetRuntimeMemoryIndexes(){

  Object.values(
    memoryState.indexes
  )
  .forEach((indexMap) => {

    if(
      typeof indexMap?.clear ===
      "function"
    ){

      indexMap.clear();

    }

  });

  return true;

}



// =====================================
// CONSISTENCY CHECK
// =====================================

function validateMemoryStateConsistency(){

  try{

    if(
      !(memoryState.indexes.byId
      instanceof Map)
    ){

      return false;

    }

    if(
      !Array.isArray(
        memoryState.memories
      )
    ){

      return false;

    }

    const memoryIds =
    new Set();

    for(
      const memory
      of memoryState.memories
    ){

      if(
        !memory?.id
      ){

        return false;
      }

      if(
        memoryIds.has(
          memory.id
        )
      ){

        return false;
      }

      memoryIds.add(
        memory.id
      );

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SESSION REFRESH
// =====================================

function refreshMemorySession(){

  const expired =

    (
      Date.now() -

      (
        memoryState.session
        ?.lastActivityAt || 0
      )

    ) >

    MEMORY_STATE_CONFIG
    .SESSION_TIMEOUT;

  if(!expired){

    return false;

  }

  Object.assign(

    memoryState.session,

    createMemorySession()

  );

  return true;

}



// =====================================
// EMERGENCY RESET
// =====================================

function emergencyResetMemoryRuntime(){

  Object.assign(

    memoryState.runtime,

    createMemoryRuntime()

  );

  clearMemoryCache();

  cleanupTrackingState();

  updateMemoryMetrics();

  return true;

}



// =====================================
// RESET MEMORY STATE
// =====================================

function resetMemoryState(){

  try{

    if(
      typeof stopAutoMemorySync ===
      "function"
    ){

      stopAutoMemorySync();

    }

    if(
      typeof clearMemoryEventListeners ===
      "function"
    ){

      clearMemoryEventListeners();

    }

    if(
      typeof clearMemoryEventHistory ===
      "function"
    ){

      clearMemoryEventHistory();

    }

    if(
      typeof clearMemoryRankings ===
      "function"
    ){

      clearMemoryRankings();

    }

    if(
      typeof clearMemoryDebugData ===
      "function"
    ){

      clearMemoryDebugData();

    }

  }

  catch(error){

    registerMemoryRuntimeError(
      error
    );

  }

  memoryState.initialized =
  false;

  memoryState.memories
  .length = 0;

  memoryState.activeMemoryId =
  null;

  resetRuntimeMemoryIndexes();

  clearMemoryCache();

  Object.assign(
    memoryState.queues,
    createMemoryQueues()
  );

  Object.assign(
    memoryState.tracking,
    createMemoryTracking()
  );

  Object.assign(
    memoryState.metrics,
    createMemoryMetrics()
  );

  Object.assign(
    memoryState.health,
    createMemoryHealth()
  );

  Object.assign(
    memoryState.stats,
    createMemoryStatsState()
  );

  Object.assign(
    memoryState.runtime,
    createMemoryRuntime()
  );

  Object.assign(
    memoryState.session,
    createMemorySession()
  );

  memoryState.version =
  MEMORY_VERSION;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryState =
Object.freeze({

  state:
  memoryState,

  config:
  MEMORY_STATE_CONFIG,

  createIndexes:
  createMemoryIndex,

  createMetrics:
  createMemoryMetrics,

  createRuntime:
  createMemoryRuntime,

  createQueues:
  createMemoryQueues,

  createCache:
  createMemoryCache,

  createTracking:
  createMemoryTracking,

  createSession:
  createMemorySession,

  createStats:
  createMemoryStatsState,

  isInitialized:
  isMemoryStateInitialized,

  setInitialized:
  setMemoryStateInitialized,

  snapshot:
  createMemoryStateSnapshot,

  isLocked:
  isMemoryLocked,

  lock:
  lockMemoryState,

  unlock:
  unlockMemoryState,

  incrementOperations:
  incrementMemoryOperations,

  decrementOperations:
  decrementMemoryOperations,

  registerError:
  registerMemoryRuntimeError,

  getById:
  getMemoryById,

  has:
  hasMemory,

  setActive:
  setActiveMemory,

  getCount:
  getMemoryCount,

  getPinnedCount:
  getPinnedMemoryCount,

  getSessionCount:
  getSessionMemoryCount,

  updateMetrics:
  updateMemoryMetrics,

  cleanupTracking:
  cleanupTrackingState,

  markDirty:
  markMemoryDirty,

  markCorrupted:
  markMemoryCorrupted,

  markDeleted:
  markMemoryDeleted,

  markAccessed:
  markMemoryAccessed,

  clearCache:
  clearMemoryCache,

  resetIndexes:
  resetRuntimeMemoryIndexes,

  validateConsistency:
  validateMemoryStateConsistency,

  refreshSession:
  refreshMemorySession,

  emergencyReset:
  emergencyResetMemoryRuntime,

  reset:
  resetMemoryState

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryState =
  MemoryState;

}
