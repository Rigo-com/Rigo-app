// =====================================
// RIGO AI
// MEMORY CLEANUP
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// CLEANUP CONFIG
// =====================================

const MEMORY_CLEANUP_CONFIG =
Object.freeze({

  ENABLE_AUTO_CLEANUP:true,

  ENABLE_CACHE_CLEANUP:true,

  ENABLE_INDEX_CLEANUP:true,

  ENABLE_EXPIRED_CLEANUP:true,

  ENABLE_CORRUPTED_ISOLATION:true,

  ENABLE_RUNTIME_OPTIMIZATION:true,

  ENABLE_ORPHAN_CLEANUP:true,

  ENABLE_SOFT_DELETE_CLEANUP:true,

  ENABLE_QUEUE_CLEANUP:true,

  ENABLE_AUTO_REPAIR:true,

  AUTO_CLEANUP_INTERVAL:
  1000 * 60 * 10,

  MAX_CLEANUP_BATCH:500,

  MAX_CLEANUP_HISTORY:100,

  MAX_ORPHAN_AGE:
  1000 * 60 * 60 * 24 * 7,

  MAX_DELETED_AGE:
  1000 * 60 * 60 * 24 * 30,

  CLEANUP_TIMEOUT:
  15000

});



// =====================================
// CLEANUP STATE
// =====================================

const memoryCleanupState =
Object.seal({

  initialized:false,

  cleaning:false,

  paused:false,

  cleanupTimer:null,

  activeCleanupId:null,

  lastCleanupAt:null,

  lastOptimizationAt:null,

  totalCleanups:0,

  failedCleanups:0,

  cleanedCaches:0,

  cleanedIndexes:0,

  cleanedMemories:0,

  repairedIndexes:0,

  isolatedCorrupted:0,

  removedOrphans:0,

  cleanupHistory:[],

  cleanupLocks:
  new Set()

});



// =====================================
// CLEANUP HELPERS
// =====================================

function createCleanupOperation(
  type
){

  return {

    id:createMemoryId(),

    type:
    normalizeMemoryString(
      type
    ),

    startedAt:
    Date.now(),

    completed:false,

    failed:false

  };

}



function isCleanupRunning(){

  return Boolean(
    memoryCleanupState
    .cleaning
  );

}



function lockCleanupOperation(
  operationId
){

  const normalizedId =
  normalizeMemoryString(
    operationId
  );

  if(!normalizedId){

    return false;

  }

  if(

    memoryCleanupState
    .cleanupLocks
    .has(
      normalizedId
    )

  ){

    return false;

  }

  memoryCleanupState
  .cleanupLocks
  .add(
    normalizedId
  );

  return true;

}



function unlockCleanupOperation(
  operationId
){

  return memoryCleanupState
  .cleanupLocks
  .delete(
    normalizeMemoryString(
      operationId
    )
  );

}



// =====================================
// CLEANUP HISTORY
// =====================================

function storeCleanupHistory(
  cleanup
){

  memoryCleanupState
  .cleanupHistory
  .push({

    id:cleanup.id,

    type:cleanup.type,

    startedAt:
    cleanup.startedAt,

    completedAt:
    Date.now(),

    failed:
    cleanup.failed

  });

  if(

    memoryCleanupState
    .cleanupHistory
    .length >

    MEMORY_CLEANUP_CONFIG
    .MAX_CLEANUP_HISTORY

  ){

    memoryCleanupState
    .cleanupHistory
    .shift();

  }

  return true;

}



// =====================================
// CACHE CLEANUP
// =====================================

function cleanupMemoryCaches(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_CACHE_CLEANUP

  ){

    return 0;

  }

  let cleaned = 0;

  Object.values(
    memoryState.cache
  )
  .forEach((cacheMap) => {

    if(
      !(cacheMap instanceof Map)
    ){

      return;
    }

    cleaned +=
    cacheMap.size;

    cacheMap.clear();

  });

  memoryCleanupState
  .cleanedCaches +=
  cleaned;

  return cleaned;

}



// =====================================
// INDEX CLEANUP
// =====================================

function cleanupMemoryIndexes(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_INDEX_CLEANUP

  ){

    return 0;

  }

  if(

    typeof cleanupOrphanIndexes ===
    "function"

  ){

    cleanupOrphanIndexes();

  }

  memoryCleanupState
  .cleanedIndexes++;

  return 1;

}



// =====================================
// EXPIRED MEMORY CLEANUP
// =====================================

function cleanupExpiredMemories(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_EXPIRED_CLEANUP

  ){

    return 0;

  }

  let cleaned = 0;

  const activeMemories = [];

  memoryState.memories
  .forEach((memory) => {

    if(
      !memory
    ){

      return;
    }

    const expiresAt =
    Number(
      memory.expiresAt
    );

    if(

      Number.isFinite(
        expiresAt
      )

      &&

      Date.now() >
      expiresAt

    ){

      markMemoryDeleted(
        memory.id
      );

      cleaned++;

      return;
    }

    activeMemories.push(
      memory
    );

  });

  memoryState.memories =
  activeMemories;

  memoryCleanupState
  .cleanedMemories +=
  cleaned;

  return cleaned;

}



// =====================================
// CORRUPTED ISOLATION
// =====================================

function isolateCorruptedMemories(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_CORRUPTED_ISOLATION

  ){

    return 0;

  }

  let isolated = 0;

  const cleanMemories = [];

  memoryState.memories
  .forEach((memory) => {

    if(
      !memory
    ){

      return;
    }

    if(

      memoryState
      .tracking
      .corruptedIds
      .has(
        memory.id
      )

    ){

      isolated++;

      return;
    }

    cleanMemories.push(
      memory
    );

  });

  memoryState.memories =
  cleanMemories;

  memoryCleanupState
  .isolatedCorrupted +=
  isolated;

  return isolated;

}



// =====================================
// ORPHAN RELATIONS
// =====================================

function cleanupOrphanRelations(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_ORPHAN_CLEANUP

  ){

    return 0;

  }

  const validIds =
  new Set(

    memoryState.memories
    .map((memory) => {

      return memory.id;

    })

  );

  let cleaned = 0;

  memoryState.memories
  .forEach((memory) => {

    if(
      !memory?.relations
    ){

      return;
    }

    if(

      Array.isArray(
        memory.relations
        .relatedMemoryIds
      )

    ){

      const originalLength =

        memory.relations
        .relatedMemoryIds
        .length;

      memory.relations
      .relatedMemoryIds =

        memory.relations
        .relatedMemoryIds
        .filter((id) => {

          return validIds.has(
            id
          );

        });

      cleaned +=

        originalLength -

        memory.relations
        .relatedMemoryIds
        .length;

    }

  });

  memoryCleanupState
  .removedOrphans +=
  cleaned;

  return cleaned;

}



// =====================================
// QUEUE CLEANUP
// =====================================

function cleanupMemoryQueues(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_QUEUE_CLEANUP

  ){

    return 0;

  }

  let cleaned = 0;

  Object.values(
    memoryState.queues
  )
  .forEach((queue) => {

    if(
      !Array.isArray(queue)
    ){

      return;
    }

    if(

      queue.length >

      MEMORY_CLEANUP_CONFIG
      .MAX_CLEANUP_BATCH

    ){

      cleaned +=
      queue.length;

      queue.length = 0;

    }

  });

  return cleaned;

}



// =====================================
// RUNTIME OPTIMIZATION
// =====================================

function optimizeMemoryRuntime(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_RUNTIME_OPTIMIZATION

  ){

    return false;

  }

  cleanupTrackingState();

  updateMemoryMetrics();

  refreshMemorySession();

  memoryCleanupState
  .lastOptimizationAt =
  Date.now();

  return true;

}



// =====================================
// AUTO REPAIR
// =====================================

function repairMemoryRuntime(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_AUTO_REPAIR

  ){

    return false;

  }

  if(

    typeof repairMemoryIndexes ===
    "function"

  ){

    repairMemoryIndexes();

    memoryCleanupState
    .repairedIndexes++;

  }

  return true;

}



// =====================================
// SAFE CLEANUP EXECUTION
// =====================================

async function executeCleanupTask(
  callback
){

  return Promise.race([

    Promise.resolve()
    .then(callback),

    new Promise((resolve) => {

      setTimeout(() => {

        resolve(false);

      },

      MEMORY_CLEANUP_CONFIG
      .CLEANUP_TIMEOUT);

    })

  ]);

}



// =====================================
// MAIN CLEANUP
// =====================================

async function runMemoryCleanup(
  options = {}
){

  if(
    isCleanupRunning()
  ){

    return false;

  }

  if(
    memoryCleanupState
    .paused
  ){

    return false;

  }

  const cleanup =
  createCleanupOperation(
    "full_cleanup"
  );

  const locked =
  lockCleanupOperation(
    cleanup.id
  );

  if(!locked){

    return false;

  }

  memoryCleanupState
  .cleaning = true;

  memoryCleanupState
  .activeCleanupId =
  cleanup.id;

  try{

    await executeCleanupTask(() => {

      cleanupMemoryCaches();

      cleanupMemoryIndexes();

      cleanupExpiredMemories();

      isolateCorruptedMemories();

      cleanupOrphanRelations();

      cleanupMemoryQueues();

      optimizeMemoryRuntime();

      repairMemoryRuntime();

      return true;

    });

    memoryCleanupState
    .totalCleanups++;

    memoryCleanupState
    .lastCleanupAt =
    Date.now();

    memoryState.metrics
    .lastCleanupAt =
    Date.now();

    cleanup.completed =
    true;

    storeCleanupHistory(
      cleanup
    );

    return true;

  }

  catch(error){

    cleanup.failed = true;

    memoryCleanupState
    .failedCleanups++;

    if(

      typeof registerMemoryRuntimeError ===
      "function"

    ){

      registerMemoryRuntimeError(
        error
      );

    }

    storeCleanupHistory(
      cleanup
    );

    return false;

  }

  finally{

    unlockCleanupOperation(
      cleanup.id
    );

    memoryCleanupState
    .cleaning = false;

    memoryCleanupState
    .activeCleanupId =
    null;

  }

}



// =====================================
// AUTO CLEANUP
// =====================================

function startAutoMemoryCleanup(){

  stopAutoMemoryCleanup();

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_AUTO_CLEANUP

  ){

    return false;

  }

  memoryCleanupState
  .cleanupTimer =
  setInterval(() => {

    runMemoryCleanup();

  },

  MEMORY_CLEANUP_CONFIG
  .AUTO_CLEANUP_INTERVAL);

  return true;

}



function stopAutoMemoryCleanup(){

  if(
    memoryCleanupState
    .cleanupTimer
  ){

    clearInterval(

      memoryCleanupState
      .cleanupTimer

    );

    memoryCleanupState
    .cleanupTimer =
    null;

  }

  return true;

}



// =====================================
// CLEANUP PAUSE
// =====================================

function pauseMemoryCleanup(){

  memoryCleanupState
  .paused = true;

  return true;

}



function resumeMemoryCleanup(){

  memoryCleanupState
  .paused = false;

  return true;

}



// =====================================
// CLEANUP DIAGNOSTICS
// =====================================

function getMemoryCleanupDiagnostics(){

  return deepFreeze({

    initialized:
    memoryCleanupState
    .initialized,

    cleaning:
    memoryCleanupState
    .cleaning,

    paused:
    memoryCleanupState
    .paused,

    totalCleanups:
    memoryCleanupState
    .totalCleanups,

    failedCleanups:
    memoryCleanupState
    .failedCleanups,

    cleanedCaches:
    memoryCleanupState
    .cleanedCaches,

    cleanedIndexes:
    memoryCleanupState
    .cleanedIndexes,

    cleanedMemories:
    memoryCleanupState
    .cleanedMemories,

    repairedIndexes:
    memoryCleanupState
    .repairedIndexes,

    isolatedCorrupted:
    memoryCleanupState
    .isolatedCorrupted,

    removedOrphans:
    memoryCleanupState
    .removedOrphans,

    activeCleanupId:
    memoryCleanupState
    .activeCleanupId,

    historySize:

      memoryCleanupState
      .cleanupHistory
      .length,

    lastCleanupAt:
    memoryCleanupState
    .lastCleanupAt,

    lastOptimizationAt:
    memoryCleanupState
    .lastOptimizationAt

  });

}
