// =====================================
// MANAGER STATE PATCH
// =====================================

const MEMORY_MANAGER_CONFIG =
Object.freeze({

  MAX_RECOVERY_ATTEMPTS:
  3,

  TRANSACTION_LOCK_TIMEOUT:
  30000

});



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
// STALE LOCK CLEANUP
// =====================================

function cleanupStaleMemoryLock(){

  try{

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

      unlockMemoryState();

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

    unlockMemoryState();

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
    isMemoryLocked()
  ){

    return false;

  }

  try{

    incrementMemoryOperations();

    lockMemoryState();

    memoryManagerState
    .transactionLockStartedAt =
    Date.now();

    return await transaction();

  }

  catch(error){

    memoryState.runtime
    .lastError =
    error;

    memoryState.metrics
    .failedOperations++;

    return false;

  }

  finally{

    unlockMemoryState();

    memoryManagerState
    .transactionLockStartedAt =
    null;

    decrementMemoryOperations();

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
    validateMemoryIndexes();

    const cacheHealthy =

      typeof memoryState.cache ===
      "object";

    const runtimeHealthy =

      typeof memoryState.runtime ===
      "object";

    const mapsHealthy =

      memoryState.indexes
      .byId instanceof Map

      &&

      memoryState.cache
      .searchResults instanceof Map;

    const setsHealthy =

      memoryState.tracking
      .dirtyIds instanceof Set

      &&

      memoryState.tracking
      .deletedIds instanceof Set;

    const indexConsistency =

      memoryState.memories
      .every((memory) => {

        return memoryState
        .indexes
        .byId
        .has(memory.id);

      });

    if(

      !validation.valid ||

      !cacheHealthy ||

      !runtimeHealthy ||

      !mapsHealthy ||

      !setsHealthy ||

      !indexConsistency

    ){

      memoryState.runtime
      .corrupted = true;

      memoryState.health
      .corruptionCount++;

    }

    cleanupOrphanIndexes();

    clearSearchCache();

    updateMemoryMetrics();

    memoryManagerState
    .lastHealthCheckAt =
    Date.now();

    return {

      valid:

        validation.valid &&

        cacheHealthy &&

        runtimeHealthy &&

        mapsHealthy &&

        setsHealthy &&

        indexConsistency,

      errors:
      validation.errors,

      warnings:
      validation.warnings

    };

  }

  catch(error){

    memoryState.runtime
    .lastError =
    error;

    memoryState.metrics
    .failedOperations++;

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
// CLEANUP PATCH
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

    cleanupOrphanIndexes();

    cleanupMemoryCaches();

    clearSearchCache();

    memoryState.tracking
    .deletedIds
    .forEach((memoryId) => {

      memoryState.tracking
      .dirtyIds
      .delete(memoryId);

      memoryState.tracking
      .accessedIds
      .delete(memoryId);

    });

    updateMemoryMetrics();

    memoryState.metrics
    .lastCleanupAt =
    Date.now();

    memoryManagerState
    .lastCleanupAt =
    Date.now();

    memoryState.stats
    .cleanups++;

    return true;

  }

  catch(error){

    memoryState.runtime
    .lastError =
    error;

    memoryState.metrics
    .failedOperations++;

    return false;

  }

  finally{

    memoryManagerState
    .maintenanceRunning =
    false;

  }

}



// =====================================
// INITIALIZATION PATCH
// =====================================

async function initializeMemorySystem(){

  if(
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

  memoryManagerState
  .initializing = true;

  try{

    const hydrated =
    await hydrateMemorySystem();

    if(!hydrated){

      memoryManagerState
      .recoveryAttempts++;

      const recovered =
      await recoverMemorySystem();

      if(!recovered){

        return false;

      }

      const rehydrated =
      await hydrateMemorySystem();

      if(!rehydrated){

        return false;

      }

    }

    updateMemoryMetrics();

    startMemoryServices();

    setMemoryStateInitialized(
      true
    );

    memoryManagerState
    .initialized = true;

    memoryManagerState
    .recoveryAttempts = 0;

    memoryState.runtime
    .initialized = true;

    return true;

  }

  catch(error){

    memoryState.runtime
    .lastError =
    error;

    memoryState.metrics
    .failedOperations++;

    return false;

  }

  finally{

    memoryManagerState
    .initializing = false;

  }

}



// =====================================
// RESTART PATCH
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

    const initializeSuccess =
    await initializeMemorySystem();

    return initializeSuccess;

  }

  catch(error){

    memoryState.runtime
    .lastError =
    error;

    return false;

  }

  finally{

    memoryManagerState
    .restarting = false;

  }

}



// =====================================
// CREATE MEMORY PATCH
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
      createMemoryObject(
        memoryData
      );

      const validation =
      validateMemoryObject(
        memory,
        {
          strict:true
        }
      );

      if(
        !validation.valid
      ){

        return null;

      }

      memoryState.memories
      .push(memory);

      indexMemory(
        memory
      );

      markMemoryDirty(
        memory.id
      );

      updateMemoryMetrics();

      const saved =
      await saveMemory(
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

        deindexMemory(
          memory
        );

        memoryState.tracking
        .dirtyIds
        .delete(
          memory.id
        );

        return null;

      }

      memoryState.stats
      .saves++;

      return memory;

    }
  );

}



// =====================================
// UPDATE MEMORY PATCH
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

      const existingMemory =
      getMemoryById(
        memoryId
      );

      if(
        !existingMemory
      ){

        return null;

      }

      const previousMemory =
      deepClone(
        existingMemory
      );

      const updatedMemory =
      sanitizeMemoryObject({

        ...existingMemory,

        ...sanitizeMemoryInput(
          updates
        ),

        updatedAt:
        Date.now()

      });

      const validation =
      validateMemoryObject(
        updatedMemory,
        {
          strict:true
        }
      );

      if(
        !validation.valid
      ){

        return null;

      }

      const memoryIndex =

        memoryState.memories
        .findIndex((memory) => {

          return (
            memory.id ===
            memoryId
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

      updateMemoryIndexes(
        existingMemory,
        updatedMemory
      );

      markMemoryDirty(
        memoryId
      );

      clearSearchCache();

      updateMemoryMetrics();

      const saved =
      await saveMemory(
        updatedMemory
      );

      if(!saved){

        memoryState.memories[
          memoryIndex
        ] = previousMemory;

        updateMemoryIndexes(
          updatedMemory,
          previousMemory
        );

        memoryState.tracking
        .dirtyIds
        .delete(
          memoryId
        );

        return null;

      }

      memoryState.stats
      .updates++;

      return updatedMemory;

    }
  );

}



// =====================================
// DELETE MEMORY PATCH
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

      const memory =
      getMemoryById(
        memoryId
      );

      if(!memory){

        return false;

      }

      const memoryIndex =

        memoryState.memories
        .findIndex((item) => {

          return (
            item.id ===
            memoryId
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

      deindexMemory(
        memory
      );

      markMemoryDeleted(
        memoryId
      );

      clearSearchCache();

      updateMemoryMetrics();

      const saved =
      await saveMemories(
        memoryState.memories
      );

      if(!saved){

        memoryState.memories
        .splice(
          memoryIndex,
          0,
          removedMemory
        );

        indexMemory(
          removedMemory
        );

        memoryState.tracking
        .deletedIds
        .delete(
          memoryId
        );

        return false;

      }

      memoryState.stats
      .deletions++;

      return true;

    }
  );

}



// =====================================
// SYNC PATCH
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

  try{

    memoryState.runtime
    .syncing = true;

    if(

      memoryState.tracking
      .dirtyIds
      .size <= 0

    ){

      return true;

    }

    const saved =
    await saveMemories(
      memoryState.memories
    );

    if(!saved){

      return false;

    }

    memoryState.tracking
    .dirtyIds
    .clear();

    memoryManagerState
    .lastSyncAt =
    Date.now();

    updateMemoryMetrics();

    return true;

  }

  catch(error){

    memoryState.runtime
    .lastError =
    error;

    return false;

  }

  finally{

    memoryState.runtime
    .syncing = false;

  }

}
