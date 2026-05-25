// =====================================
// RIGO AI
// MEMORY MANAGER
// ENTERPRISE INFINITY FINAL
// PATCHED + HARDENED
// =====================================



// =====================================
// MANAGER CONFIG
// =====================================

const MEMORY_MANAGER_CONFIG =
Object.freeze({

  MAX_RECOVERY_ATTEMPTS:
  3,

  TRANSACTION_LOCK_TIMEOUT:
  30000,

  AUTO_SYNC_INTERVAL:
  30000,

  AUTO_HEALTHCHECK_INTERVAL:
  60000,

  AUTO_CLEANUP_INTERVAL:
  300000

});



// =====================================
// MANAGER STATE
// =====================================

const memoryManagerState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  restarting:false,

  maintenanceRunning:false,

  healthcheckRunning:false,

  cleanupTimer:null,

  healthcheckTimer:null,

  syncTimer:null,

  transactionLockStartedAt:null,

  lastHealthCheckAt:null,

  lastCleanupAt:null,

  lastSyncAt:null,

  recoveryAttempts:0

});



// =====================================
// LOCK HELPERS
// =====================================

function cleanupStaleMemoryLock(){

  try{

    if(
      typeof isMemoryLocked !==
      "function"
    ){

      return false;

    }

    if(
      !isMemoryLocked()
    ){

      return false;

    }

    const startedAt =

      memoryManagerState
      .transactionLockStartedAt;

    if(
      !Number.isFinite(
        startedAt
      )
    ){

      unlockMemoryState?.();

      return true;

    }

    const expired = (

      Date.now() -

      startedAt

    ) >

    MEMORY_MANAGER_CONFIG
    .TRANSACTION_LOCK_TIMEOUT;

    if(!expired){

      return false;

    }

    unlockMemoryState?.();

    memoryManagerState
    .transactionLockStartedAt =
    null;

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// TRANSACTION WRAPPER
// =====================================

async function runMemoryTransaction(
  transaction
){

  if(
    typeof transaction !==
    "function"
  ){

    return false;

  }

  cleanupStaleMemoryLock();

  if(
    isMemoryLocked?.()
  ){

    return false;

  }

  try{

    incrementMemoryOperations?.();

    lockMemoryState?.();

    memoryManagerState
    .transactionLockStartedAt =
    Date.now();

    return await transaction();

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .failedOperations++;

    }

    console.error(
      "MEMORY TRANSACTION ERROR:",
      error
    );

    return false;

  }

  finally{

    unlockMemoryState?.();

    memoryManagerState
    .transactionLockStartedAt =
    null;

    decrementMemoryOperations?.();

  }

}



// =====================================
// HEALTH CHECK
// =====================================

function runMemoryHealthCheck(){

  try{

    memoryManagerState
    .healthcheckRunning =
    true;

    const validation =

      typeof validateMemoryIndexes ===
      "function"

      ? validateMemoryIndexes()

      : {
          valid:false,
          errors:[
            "INDEX_VALIDATOR_MISSING"
          ],
          warnings:[]
        };

    const cacheHealthy =

      typeof memoryState?.cache ===
      "object";

    const runtimeHealthy =

      typeof memoryState?.runtime ===
      "object";

    const mapsHealthy =

      memoryState?.indexes
      ?.byId instanceof Map

      &&

      memoryState?.cache
      ?.searchResults instanceof Map;

    const setsHealthy =

      memoryState?.tracking
      ?.dirtyIds instanceof Set

      &&

      memoryState?.tracking
      ?.deletedIds instanceof Set;

    const indexConsistency =

      Array.isArray(
        memoryState?.memories
      )

      &&

      memoryState.memories
      .every((memory) => {

        return memoryState
        ?.indexes
        ?.byId
        ?.has(

          normalizeMemoryString?.(
            memory.id
          )

        );

      });

    const valid = (

      validation.valid

      &&

      cacheHealthy

      &&

      runtimeHealthy

      &&

      mapsHealthy

      &&

      setsHealthy

      &&

      indexConsistency

    );

    if(!valid){

      if(
        memoryState?.runtime
      ){

        memoryState.runtime
        .corrupted = true;

      }

      if(
        memoryState?.health
      ){

        memoryState.health
        .corruptionCount++;

      }

    }

    cleanupOrphanIndexes?.();

    clearSearchCache?.();

    updateMemoryMetrics?.();

    memoryManagerState
    .lastHealthCheckAt =
    Date.now();

    return {

      valid,

      errors:
      validation.errors || [],

      warnings:
      validation.warnings || []

    };

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .failedOperations++;

    }

    return {

      valid:false,

      errors:[
        error.message
      ],

      warnings:[]

    };

  }

  finally{

    memoryManagerState
    .healthcheckRunning =
    false;

  }

}



// =====================================
// CLEANUP SYSTEM
// =====================================

function cleanupMemorySystem(){

  if(
    memoryManagerState
    .maintenanceRunning
  ){

    return false;

  }

  try{

    memoryManagerState
    .maintenanceRunning =
    true;

    cleanupOrphanIndexes?.();

    cleanupMemoryCaches?.();

    clearSearchCache?.();

    cleanupEmbeddingRelations?.();

    if(
      memoryState?.tracking
      ?.deletedIds instanceof Set
    ){

      memoryState.tracking
      .deletedIds
      .forEach((memoryId) => {

        memoryState?.tracking
        ?.dirtyIds
        ?.delete(memoryId);

        memoryState?.tracking
        ?.accessedIds
        ?.delete(memoryId);

      });

    }

    updateMemoryMetrics?.();

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .lastCleanupAt =
      Date.now();

    }

    memoryManagerState
    .lastCleanupAt =
    Date.now();

    if(
      memoryState?.stats
    ){

      memoryState.stats
      .cleanups++;

    }

    return true;

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .failedOperations++;

    }

    return false;

  }

  finally{

    memoryManagerState
    .maintenanceRunning =
    false;

  }

}



// =====================================
// START SERVICES
// =====================================

function startMemoryServices(){

  stopMemoryServices();

  memoryManagerState
  .syncTimer =
  setInterval(() => {

    syncMemorySystem();

  },

    MEMORY_MANAGER_CONFIG
    .AUTO_SYNC_INTERVAL

  );

  memoryManagerState
  .healthcheckTimer =
  setInterval(() => {

    runMemoryHealthCheck();

  },

    MEMORY_MANAGER_CONFIG
    .AUTO_HEALTHCHECK_INTERVAL

  );

  memoryManagerState
  .cleanupTimer =
  setInterval(() => {

    cleanupMemorySystem();

  },

    MEMORY_MANAGER_CONFIG
    .AUTO_CLEANUP_INTERVAL

  );

  return true;

}



// =====================================
// STOP SERVICES
// =====================================

function stopMemoryServices(){

  clearInterval(
    memoryManagerState
    .syncTimer
  );

  clearInterval(
    memoryManagerState
    .healthcheckTimer
  );

  clearInterval(
    memoryManagerState
    .cleanupTimer
  );

  memoryManagerState
  .syncTimer = null;

  memoryManagerState
  .healthcheckTimer = null;

  memoryManagerState
  .cleanupTimer = null;

  return true;

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeMemorySystem(){

  if(
    typeof canInitializeMemorySystem ===
    "function"

    &&

    !canInitializeMemorySystem()
  ){

    return false;

  }

  if(

    memoryManagerState
    .recoveryAttempts >=

    MEMORY_MANAGER_CONFIG
    .MAX_RECOVERY_ATTEMPTS

  ){

    return false;

  }

  if(
    memoryManagerState
    .initializing
  ){

    return false;

  }

  memoryManagerState
  .initializing = true;

  try{

    const hydrated =

      await hydrateMemorySystem?.();

    if(!hydrated){

      memoryManagerState
      .recoveryAttempts++;

      const recovered =

        await recoverMemorySystem?.();

      if(!recovered){

        return false;

      }

      const rehydrated =

        await hydrateMemorySystem?.();

      if(!rehydrated){

        return false;

      }

    }

    rebuildMemoryIndexes?.();

    rebuildDirtyEmbeddings?.();

    restoreEmbeddingCache?.();

    updateMemoryMetrics?.();

    startMemoryServices();

    setMemoryStateInitialized?.(
      true
    );

    memoryManagerState
    .initialized = true;

    memoryManagerState
    .recoveryAttempts = 0;

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .initialized = true;

      memoryState.runtime
      .corrupted = false;

    }

    return true;

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .failedOperations++;

    }

    return false;

  }

  finally{

    memoryManagerState
    .initializing = false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownMemorySystem(){

  if(
    memoryManagerState
    .shuttingDown
  ){

    return false;

  }

  try{

    memoryManagerState
    .shuttingDown = true;

    stopMemoryServices();

    await syncMemorySystem();

    persistEmbeddingCache?.();

    cleanupMemorySystem();

    memoryManagerState
    .initialized = false;

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .initialized = false;

    }

    return true;

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    return false;

  }

  finally{

    memoryManagerState
    .shuttingDown = false;

  }

}



// =====================================
// RESTART SYSTEM
// =====================================

async function restartMemorySystem(){

  if(
    memoryManagerState
    .restarting
  ){

    return false;

  }

  memoryManagerState
  .restarting = true;

  try{

    cleanupMemorySystem();

    const shutdownSuccess =
    await shutdownMemorySystem();

    if(!shutdownSuccess){

      return false;

    }

    return await initializeMemorySystem();

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    return false;

  }

  finally{

    memoryManagerState
    .restarting = false;

  }

}



// =====================================
// CREATE MEMORY
// =====================================

async function createMemory(
  memoryData = {}
){

  if(
    memoryManagerState
    .shuttingDown
  ){

    return null;

  }

  return runMemoryTransaction(
    async() => {

      const memory =
      createMemoryObject?.(
        memoryData
      );

      const validation =
      validateMemoryObject?.(
        memory,
        {
          strict:true
        }
      );

      if(
        !validation?.valid
      ){

        return null;

      }

      memoryState.memories
      .push(memory);

      indexMemory?.(
        memory
      );

      markMemoryDirty?.(
        memory.id
      );

      markEmbeddingDirty?.(
        memory.id
      );

      clearSearchCache?.();

      updateMemoryMetrics?.();

      const saved =
      await saveMemory?.(
        memory
      );

      if(!saved){

        memoryState.memories =

          memoryState.memories
          .filter((item) => {

            return (
              item.id !==
              memory.id
            );

          });

        deindexMemory?.(
          memory
        );

        memoryState?.tracking
        ?.dirtyIds
        ?.delete(
          memory.id
        );

        clearSearchCache?.();

        updateMemoryMetrics?.();

        return null;

      }

      memoryState?.stats
      ?.saves++;

      return freezeMemoryObject?.(
        memory
      )

      ||

      memory;

    }
  );

}



// =====================================
// UPDATE MEMORY
// =====================================

async function updateMemoryData(
  memoryId,
  updates = {}
){

  if(
    memoryManagerState
    .shuttingDown
  ){

    return null;

  }

  return runMemoryTransaction(
    async() => {

      const normalizedMemoryId =
      normalizeMemoryString?.(
        memoryId
      );

      const existingMemory =
      getMemoryById?.(
        normalizedMemoryId
      );

      if(
        !existingMemory
      ){

        return null;

      }

      const previousMemory =
      deepClone?.(
        existingMemory
      );

      const updatedMemory =
      sanitizeMemoryObject?.({

        ...existingMemory,

        ...sanitizeMemoryInput?.(
          updates
        ),

        updatedAt:
        Date.now()

      });

      const validation =
      validateMemoryObject?.(
        updatedMemory,
        {
          strict:true
        }
      );

      if(
        !validation?.valid
      ){

        return null;

      }

      const memoryIndex =

        memoryState.memories
        .findIndex((memory) => {

          return (

            normalizeMemoryString?.(
              memory.id
            )

            ===

            normalizedMemoryId

          );

        });

      if(
        memoryIndex < 0
      ){

        return null;

      }

      memoryState.memories[
        memoryIndex
      ] = updatedMemory;

      deindexMemory?.(
        previousMemory
      );

      indexMemory?.(
        updatedMemory
      );

      markMemoryDirty?.(
        normalizedMemoryId
      );

      markEmbeddingDirty?.(
        normalizedMemoryId
      );

      clearSearchCache?.();

      updateMemoryMetrics?.();

      const saved =
      await saveMemory?.(
        updatedMemory
      );

      if(!saved){

        memoryState.memories[
          memoryIndex
        ] = previousMemory;

        deindexMemory?.(
          updatedMemory
        );

        indexMemory?.(
          previousMemory
        );

        memoryState?.tracking
        ?.dirtyIds
        ?.delete(
          normalizedMemoryId
        );

        clearSearchCache?.();

        updateMemoryMetrics?.();

        return null;

      }

      memoryState?.stats
      ?.updates++;

      return freezeMemoryObject?.(
        updatedMemory
      )

      ||

      updatedMemory;

    }
  );

}



// =====================================
// DELETE MEMORY
// =====================================

async function deleteMemoryData(
  memoryId
){

  if(
    memoryManagerState
    .shuttingDown
  ){

    return false;

  }

  return runMemoryTransaction(
    async() => {

      const normalizedMemoryId =
      normalizeMemoryString?.(
        memoryId
      );

      const memory =
      getMemoryById?.(
        normalizedMemoryId
      );

      if(!memory){

        return false;

      }

      const memoryIndex =

        memoryState.memories
        .findIndex((item) => {

          return (

            normalizeMemoryString?.(
              item.id
            )

            ===

            normalizedMemoryId

          );

        });

      if(
        memoryIndex < 0
      ){

        return false;

      }

      const removedMemory =
      memoryState.memories[
        memoryIndex
      ];

      memoryState.memories
      .splice(
        memoryIndex,
        1
      );

      deindexMemory?.(
        memory
      );

      memoryEmbeddingsState
      ?.embeddingIndex
      ?.delete(
        normalizedMemoryId
      );

      markMemoryDeleted?.(
        normalizedMemoryId
      );

      clearSearchCache?.();

      updateMemoryMetrics?.();

      const saved =
      await saveMemories?.(
        memoryState.memories
      );

      if(!saved){

        memoryState.memories
        .splice(
          memoryIndex,
          0,
          removedMemory
        );

        indexMemory?.(
          removedMemory
        );

        memoryState?.tracking
        ?.deletedIds
        ?.delete(
          normalizedMemoryId
        );

        clearSearchCache?.();

        updateMemoryMetrics?.();

        return false;

      }

      memoryState?.stats
      ?.deletions++;

      return true;

    }
  );

}



// =====================================
// SYNC SYSTEM
// =====================================

async function syncMemorySystem(){

  if(
    !memoryManagerState
    .initialized
  ){

    return false;

  }

  if(
    memoryManagerState
    .shuttingDown
  ){

    return false;

  }

  if(
    memoryState?.runtime
    ?.syncing
  ){

    return false;

  }

  try{

    memoryState.runtime
    .syncing = true;

    if(

      memoryState?.tracking
      ?.dirtyIds
      ?.size <= 0

    ){

      return true;

    }

    const saved =
    await saveMemories?.(
      memoryState.memories
    );

    if(!saved){

      return false;

    }

    memoryState.tracking
    .dirtyIds
    .clear();

    persistEmbeddingCache?.();

    memoryManagerState
    .lastSyncAt =
    Date.now();

    updateMemoryMetrics?.();

    return true;

  }

  catch(error){

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .lastError =
      error;

    }

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .failedOperations++;

    }

    return false;

  }

  finally{

    if(
      memoryState?.runtime
    ){

      memoryState.runtime
      .syncing = false;

    }

  }

}
