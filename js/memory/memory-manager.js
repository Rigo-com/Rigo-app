// =====================================
// RIGO AI
// MEMORY MANAGER
// FINAL STABILIZED ARCHITECTURE
// =====================================



// =====================================
// MANAGER CONFIG
// =====================================

const MEMORY_MANAGER_CONFIG =
Object.freeze({

  TRANSACTION_TIMEOUT:
  30000

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

  transactionStartedAt:null

});



// =====================================
// TRANSACTION LOCK
// =====================================

function cleanupExpiredTransaction(){

  if(
    !isMemoryLocked()
  ){

    return false;

  }

  const startedAt =
  memoryManagerState
  .transactionStartedAt;

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
  .TRANSACTION_TIMEOUT;

  if(!expired){

    return false;

  }

  unlockMemoryState();

  memoryManagerState
  .transactionStartedAt =
  null;

  return true;

}



// =====================================
// TRANSACTION WRAPPER
// =====================================

async function runMemoryTransaction(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return null;

  }

  cleanupExpiredTransaction();

  if(
    isMemoryLocked()
  ){

    return null;

  }

  try{

    incrementMemoryOperations();

    lockMemoryState();

    memoryManagerState
    .transactionStartedAt =
    Date.now();

    return await callback();

  }

  catch(error){

    registerMemoryRuntimeError(
      error
    );

    return null;

  }

  finally{

    unlockMemoryState();

    memoryManagerState
    .transactionStartedAt =
    null;

    decrementMemoryOperations();

  }

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeMemorySystem(){

  if(
    memoryManagerState
    .initialized
  ){

    return true;

  }

  if(
    memoryManagerState
    .initializing
  ){

    return false;

  }

  memoryManagerState
  .initializing =
  true;

  try{

    const hydrated =
    await hydrateMemorySystem();

    if(!hydrated){

      return false;

    }

    rebuildMemoryIndexes();

    updateMemoryMetrics();

    setMemoryStateInitialized(
      true
    );

    memoryManagerState
    .initialized =
    true;

    memoryState.runtime
    .initialized =
    true;

    memoryState.runtime
    .corrupted =
    false;

    return true;

  }

  catch(error){

    registerMemoryRuntimeError(
      error
    );

    return false;

  }

  finally{

    memoryManagerState
    .initializing =
    false;

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
    .shuttingDown =
    true;

    await performMemorySync();

    cleanupMemoryCaches();

    memoryManagerState
    .initialized =
    false;

    memoryState.runtime
    .initialized =
    false;

    return true;

  }

  catch(error){

    registerMemoryRuntimeError(
      error
    );

    return false;

  }

  finally{

    memoryManagerState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESTART
// =====================================

async function restartMemorySystem(){

  if(
    memoryManagerState
    .restarting
  ){

    return false;

  }

  memoryManagerState
  .restarting =
  true;

  try{

    const shutdown =
    await shutdownMemorySystem();

    if(!shutdown){

      return false;

    }

    return await initializeMemorySystem();

  }

  catch(error){

    registerMemoryRuntimeError(
      error
    );

    return false;

  }

  finally{

    memoryManagerState
    .restarting =
    false;

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
      await createMemoryObject(
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

      clearSearchCache();

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

        memoryState
        .tracking
        .dirtyIds
        .delete(
          memory.id
        );

        updateMemoryMetrics();

        return null;

      }

      memoryState.stats
      .saves++;

      return freezeMemoryObject(
        memory
      );

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

      const normalizedId =
      normalizeMemoryString(
        memoryId
      );

      const existingMemory =
      getMemoryById(
        normalizedId
      );

      if(!existingMemory){

        return null;

      }

      const previousMemory =
      deepClone(
        existingMemory
      );

      const updatedMemory =
      await sanitizeMemoryObject({

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

      const index =

        memoryState.memories
        .findIndex((memory) => {

          return (
            memory.id ===
            normalizedId
          );

        });

      if(
        index < 0
      ){

        return null;

      }

      memoryState.memories[
        index
      ] = updatedMemory;

      deindexMemory(
        previousMemory
      );

      indexMemory(
        updatedMemory
      );

      markMemoryDirty(
        normalizedId
      );

      clearSearchCache();

      updateMemoryMetrics();

      const saved =
      await saveMemory(
        updatedMemory
      );

      if(!saved){

        memoryState.memories[
          index
        ] = previousMemory;

        deindexMemory(
          updatedMemory
        );

        indexMemory(
          previousMemory
        );

        updateMemoryMetrics();

        return null;

      }

      memoryState.stats
      .updates++;

      return freezeMemoryObject(
        updatedMemory
      );

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

      const normalizedId =
      normalizeMemoryString(
        memoryId
      );

      const memory =
      getMemoryById(
        normalizedId
      );

      if(!memory){

        return false;

      }

      const index =

        memoryState.memories
        .findIndex((item) => {

          return (
            item.id ===
            normalizedId
          );

        });

      if(
        index < 0
      ){

        return false;

      }

      const removedMemory =
      memoryState.memories[
        index
      ];

      memoryState.memories
      .splice(
        index,
        1
      );

      deindexMemory(
        removedMemory
      );

      removeMemoryEmbedding(
        normalizedId
      );

      markMemoryDeleted(
        normalizedId
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
          index,
          0,
          removedMemory
        );

        indexMemory(
          removedMemory
        );

        memoryState
        .tracking
        .deletedIds
        .delete(
          normalizedId
        );

        updateMemoryMetrics();

        return false;

      }

      memoryState.stats
      .deletions++;

      return true;

    }
  );

}



// =====================================
// MEMORY SYNC
// =====================================

async function performMemorySync(){

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
    memoryState.runtime
    .syncing
  ){

    return false;

  }

  try{

    memoryState.runtime
    .syncing = true;

    if(

      memoryState
      .tracking
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

    memoryState
    .tracking
    .dirtyIds
    .clear();

    updateMemoryMetrics();

    return true;

  }

  catch(error){

    registerMemoryRuntimeError(
      error
    );

    return false;

  }

  finally{

    memoryState.runtime
    .syncing = false;

  }

}
