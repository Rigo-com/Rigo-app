// =====================================
// INITIALIZE STORAGE
// =====================================

function initializeStorageRuntime(){

  if(
    storageState.initialized
  ){

    return true;

  }

  const available =
  isStorageAvailable();

  if(!available){

    return false;

  }

  hydrateStorageCache();

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



// =====================================
// DESTROY STORAGE
// =====================================

function destroyStorageRuntime(){

  clearTimeout(
    storageState.writeTimer
  );

  storageState.writeQueue =
  [];

  storageState.writeTimer =
  null;

  storageState.available =
  null;

  storageState.lastSyncAt =
  null;

  storageState.destroyed =
  true;

  storageState.initialized =
  false;

  storageState.hydrated =
  false;

  storageState.writing =
  false;

  storageState.cache.chats =
  [];

  storageState.cache.memory =
  {};

  return true;

}



// =====================================
// HYDRATE CACHE
// =====================================

function hydrateStorageCache(){

  storageState.cache.chats =
  loadChatsFromStorage();

  storageState.cache.memory =
  loadMemoryFromStorage();

  return true;

}
