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

  try{

    const available =
    isStorageAvailable();

    if(!available){

      return false;

    }

    storageState.pendingHydration =
    true;

    try{

      hydrateStorageCache();

    }

    catch(hydrationError){

      handleStorageError(
        "STORAGE HYDRATION ERROR",
        hydrationError
      );

      storageState.pendingHydration =
      false;

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
      "STORAGE INITIALIZATION ERROR",
      error
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

    storageState.writeQueue
    .length = 0;

    storageState.writeTimer =
    null;

    storageState.available =
    null;

    storageState.lastSyncAt =
    null;

    storageState.lastWriteAt =
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
    Object.freeze([]);

    storageState.cache.memory =
    Object.freeze({});

    return true;

  }

  catch(error){

    handleStorageError(
      "DESTROY STORAGE ERROR",
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

    storageState.cache.chats =
    Object.freeze(
      deepClone(chats) || []
    );

    storageState.cache.memory =
    deepFreezeMemory(
      deepClone(memory) || {}
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "HYDRATE STORAGE CACHE ERROR",
      error
    );

    storageState.cache.chats =
    Object.freeze([]);

    storageState.cache.memory =
    Object.freeze({});

    return false;

  }

}
