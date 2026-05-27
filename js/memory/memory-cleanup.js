// =====================================
// RIGO AI
// MEMORY CLEANUP
// FINAL OPTIMIZED BUILD
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

  ENABLE_QUEUE_CLEANUP:true,

  ENABLE_AUTO_REPAIR:true,

  AUTO_CLEANUP_INTERVAL:
  1000 * 60 * 10,

  MAX_QUEUE_SIZE:500,

  MAX_HISTORY:50,

  CLEANUP_TIMEOUT:15000

});



// =====================================
// CLEANUP STATE
// =====================================

const memoryCleanupState =
Object.seal({

  initialized:false,

  cleaning:false,

  paused:false,

  timer:null,

  activeCleanupId:null,

  lastCleanupAt:null,

  lastOptimizationAt:null,

  totalCleanups:0,

  failedCleanups:0,

  cleanupHistory:[],

  cleanupLocks:
  new Set()

});



// =====================================
// HELPERS
// =====================================

function createCleanupId(){

  return createMemoryId();

}



function acquireCleanupLock(
  cleanupId
){

  const normalizedId =
  normalizeMemoryString(
    cleanupId
  );

  if(
    !normalizedId
  ){

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



function releaseCleanupLock(
  cleanupId
){

  memoryCleanupState
  .cleanupLocks
  .delete(

    normalizeMemoryString(
      cleanupId
    )

  );

  return true;

}



function storeCleanupHistory(
  cleanupId,
  success = true
){

  memoryCleanupState
  .cleanupHistory
  .push({

    id:cleanupId,

    success,

    timestamp:
    Date.now()

  });

  while(

    memoryCleanupState
    .cleanupHistory
    .length >

    MEMORY_CLEANUP_CONFIG
    .MAX_HISTORY

  ){

    memoryCleanupState
    .cleanupHistory
    .shift();

  }

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
    memoryState?.cache || {}
  )
  .forEach((cache) => {

    if(
      !(cache instanceof Map)
    ){

      return;

    }

    cleaned +=
    cache.size;

    cache.clear();

  });

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

    return false;

  }

  cleanupOrphanIndexes?.();

  return true;

}



// =====================================
// EXPIRED CLEANUP
// =====================================

function cleanupExpiredMemories(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_EXPIRED_CLEANUP

  ){

    return 0;

  }

  const now =
  Date.now();

  const originalLength =

    memoryState.memories
    .length;

  memoryState.memories =

    memoryState.memories
    .filter((memory) => {

      if(
        !memory
      ){

        return false;

      }

      const expiresAt =
      Number(
        memory.expiresAt
      );

      return !(

        Number.isFinite(
          expiresAt
        )

        &&

        now > expiresAt

      );

    });

  return (

    originalLength -

    memoryState.memories
    .length

  );

}



// =====================================
// CORRUPTED CLEANUP
// =====================================

function isolateCorruptedMemories(){

  if(

    !MEMORY_CLEANUP_CONFIG
    .ENABLE_CORRUPTED_ISOLATION

  ){

    return 0;

  }

  const corruptedIds =

    memoryState
    ?.tracking
    ?.corruptedIds;

  if(
    !(corruptedIds instanceof Set)
  ){

    return 0;

  }

  const originalLength =

    memoryState.memories
    .length;

  memoryState.memories =

    memoryState.memories
    .filter((memory) => {

      return !corruptedIds
      .has(memory.id);

    });

  return (

    originalLength -

    memoryState.memories
    .length

  );

}



// =====================================
// ORPHAN CLEANUP
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

    const relatedIds =

      memory?.relations
      ?.relatedMemoryIds;

    if(
      !Array.isArray(
        relatedIds
      )
    ){

      return;

    }

    const filteredIds =

      relatedIds.filter((id) => {

        return validIds.has(
          id
        );

      });

    cleaned +=

      relatedIds.length -

      filteredIds.length;

    memory.relations
    .relatedMemoryIds =
    filteredIds;

  });

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
    memoryState?.queues || {}
  )
  .forEach((queue) => {

    if(
      !Array.isArray(queue)
    ){

      return;

    }

    if(

      queue.length <=

      MEMORY_CLEANUP_CONFIG
      .MAX_QUEUE_SIZE

    ){

      return;

    }

    const removeCount =

      queue.length -

      MEMORY_CLEANUP_CONFIG
      .MAX_QUEUE_SIZE;

    queue.splice(
      0,
      removeCount
    );

    cleaned +=
    removeCount;

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

  [

    cleanupTrackingState,

    updateMemoryMetrics,

    refreshMemorySession

  ]
  .forEach((callback) => {

    try{

      callback?.();

    }

    catch(error){}

  });

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

  repairMemoryIndexes?.();

  return true;

}



// =====================================
// EXECUTE CLEANUP
// =====================================

async function executeCleanupPipeline(){

  cleanupMemoryCaches();

  cleanupMemoryIndexes();

  cleanupExpiredMemories();

  isolateCorruptedMemories();

  cleanupOrphanRelations();

  cleanupMemoryQueues();

  optimizeMemoryRuntime();

  repairMemoryRuntime();

  return true;

}



// =====================================
// MAIN CLEANUP
// =====================================

async function runMemoryCleanup(){

  if(
    memoryCleanupState.cleaning
  ){

    return false;

  }

  if(
    memoryCleanupState.paused
  ){

    return false;

  }

  const cleanupId =
  createCleanupId();

  if(
    !acquireCleanupLock(
      cleanupId
    )
  ){

    return false;

  }

  memoryCleanupState
  .cleaning = true;

  memoryCleanupState
  .activeCleanupId =
  cleanupId;

  try{

    const completed =
    await Promise.race([

      executeCleanupPipeline(),

      new Promise((resolve) => {

        setTimeout(() => {

          resolve(false);

        },

        MEMORY_CLEANUP_CONFIG
        .CLEANUP_TIMEOUT);

      })

    ]);

    if(
      completed !== true
    ){

      throw new Error(
        "MEMORY_CLEANUP_TIMEOUT"
      );

    }

    memoryCleanupState
    .totalCleanups++;

    memoryCleanupState
    .lastCleanupAt =
    Date.now();

    memoryState
    ?.metrics && (

      memoryState.metrics
      .lastCleanupAt =
      Date.now()

    );

    storeCleanupHistory(
      cleanupId,
      true
    );

    return true;

  }

  catch(error){

    memoryCleanupState
    .failedCleanups++;

    registerMemoryRuntimeError?.(
      error
    );

    storeCleanupHistory(
      cleanupId,
      false
    );

    return false;

  }

  finally{

    releaseCleanupLock(
      cleanupId
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
  .timer =
  setInterval(() => {

    runMemoryCleanup();

  },

  MEMORY_CLEANUP_CONFIG
  .AUTO_CLEANUP_INTERVAL);

  return true;

}



function stopAutoMemoryCleanup(){

  if(
    memoryCleanupState.timer
  ){

    clearInterval(
      memoryCleanupState
      .timer
    );

    memoryCleanupState
    .timer = null;

  }

  return true;

}



// =====================================
// CLEANUP CONTROL
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
// INITIALIZE
// =====================================

function initializeMemoryCleanup(){

  if(
    memoryCleanupState
    .initialized
  ){

    return true;

  }

  startAutoMemoryCleanup();

  memoryCleanupState
  .initialized = true;

  return true;

}



// =====================================
// RESET
// =====================================

function resetMemoryCleanup(){

  stopAutoMemoryCleanup();

  memoryCleanupState
  .initialized = false;

  memoryCleanupState
  .cleaning = false;

  memoryCleanupState
  .paused = false;

  memoryCleanupState
  .activeCleanupId =
  null;

  memoryCleanupState
  .lastCleanupAt =
  null;

  memoryCleanupState
  .lastOptimizationAt =
  null;

  memoryCleanupState
  .totalCleanups = 0;

  memoryCleanupState
  .failedCleanups = 0;

  memoryCleanupState
  .cleanupHistory = [];

  memoryCleanupState
  .cleanupLocks
  .clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryCleanup =
Object.freeze({

  initialize:
  initializeMemoryCleanup,

  run:
  runMemoryCleanup,

  start:
  startAutoMemoryCleanup,

  stop:
  stopAutoMemoryCleanup,

  pause:
  pauseMemoryCleanup,

  resume:
  resumeMemoryCleanup,

  reset:
  resetMemoryCleanup,

  cleanupCaches:
  cleanupMemoryCaches,

  cleanupIndexes:
  cleanupMemoryIndexes,

  cleanupExpired:
  cleanupExpiredMemories,

  cleanupOrphans:
  cleanupOrphanRelations,

  cleanupQueues:
  cleanupMemoryQueues,

  optimize:
  optimizeMemoryRuntime,

  repair:
  repairMemoryRuntime

});



// =====================================
// DIAGNOSTICS
// =====================================

function getMemoryCleanupDiagnostics(){

  return {

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

  };

}



// =====================================
// EXPORTS
// =====================================

export {

  MEMORY_CLEANUP_CONFIG,

  memoryCleanupState,

  runMemoryCleanup,

  initializeMemoryCleanup,

  startAutoMemoryCleanup,

  stopAutoMemoryCleanup,

  pauseMemoryCleanup,

  resumeMemoryCleanup,

  resetMemoryCleanup,

  cleanupMemoryCaches,

  cleanupMemoryIndexes,

  cleanupExpiredMemories,

  cleanupOrphanRelations,

  cleanupMemoryQueues,

  optimizeMemoryRuntime,

  repairMemoryRuntime,

  getMemoryCleanupDiagnostics,

  MemoryCleanup

};
