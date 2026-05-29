// =====================================
// INITIALIZE STORAGE
// =====================================

function initializeStorageRuntime(){

  if(
    storageState.destroyed
  ){

    storageState.destroyed =
    false;

  }

  if(
    storageState.initialized
  ){

    return true;

  }

  if(
    storageState.pendingHydration
  ){

    return false;

  }

  storageState.pendingHydration =
  true;

  try{

    const available =
    isStorageAvailable();

    if(
      !available
    ){

      storageState.initialized =
      false;

      return false;

    }

    const hydrated =
    hydrateStorageCache();

    if(
      !hydrated
    ){

      storageState.cache.chats =
      deepFreeze(
        []
      );

      storageState.cache.memory =
      deepFreezeMemory(
        {}
      );

      storageState.initialized =
      false;

      storageState.hydrated =
      false;

      return false;

    }

    storageState.initialized =
    true;

    storageState.hydrated =
    true;

    storageState.destroyed =
    false;

    storageState.lastSyncAt =
    Date.now();

    return true;

  }

  catch(error){

    handleStorageError(
      "STORAGE_INITIALIZATION_ERROR",
      error
    );

    storageState.cache.chats =
    deepFreeze(
      []
    );

    storageState.cache.memory =
    deepFreezeMemory(
      {}
    );

    storageState.initialized =
    false;

    storageState.hydrated =
    false;

    return false;

  }

  finally{

    storageState.pendingHydration =
    false;

  }

}



// =====================================
// DESTROY STORAGE
// =====================================

function destroyStorageRuntime(){

  if(
    storageState.destroyed
  ){

    return true;

  }

  try{

    if(
      storageState.writeTimer
    ){

      clearTimeout(
        storageState.writeTimer
      );

    }

    storageState
    .writeQueue
    .length = 0;

    storageState.writeTimer =
    null;

    storageState.available =
    null;

    storageState.lastSyncAt =
    null;

    storageState.lastWriteAt =
    null;

    storageState.lastMemoryWriteVersion =
    null;

    storageState.pendingHydration =
    false;

    storageState.destroyed =
    true;

    storageState.initialized =
    false;

    storageState.hydrated =
    false;

    storageState.writing =
    false;

    storageState.cache.chats =
    deepFreeze(
      []
    );

    storageState.cache.memory =
    deepFreezeMemory(
      {}
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "DESTROY_STORAGE_ERROR",
      error
    );

    return false;

  }

}



// =====================================
// HYDRATE CACHE
// =====================================

function hydrateStorageCache(){

  if(
    storageState.destroyed
  ){

    return false;

  }

  try{

    const chats =
    loadChatsFromStorage();

    const memory =
    loadMemoryFromStorage();

    const safeChats =
    deepClone(
      chats
    ) || [];

    const safeMemory =
    deepClone(
      memory
    ) || {};

    storageState.cache.chats =
    deepFreeze(
      safeChats
    );

    storageState.cache.memory =
    deepFreezeMemory(
      safeMemory
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "HYDRATE_STORAGE_CACHE_ERROR",
      error
    );

    storageState.cache.chats =
    deepFreeze(
      []
    );

    storageState.cache.memory =
    deepFreezeMemory(
      {}
    );

    return false;

  }

}
