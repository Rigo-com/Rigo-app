// =====================================
// RIGO AI
// STORAGE STATE
// FOUNDATION STATE LAYER
// =====================================



// =====================================
// STORAGE STATE
// =====================================

const storageState =
Object.seal({

  initialized:false,

  loading:false,

  saving:false,

  flushing:false,

  healthy:true,

  activeOperations:0,

  cache:
  new Map(),

  diagnostics:
  Object.seal({

    loads:0,

    saves:0,

    removals:0,

    clears:0,

    failures:0,

    cacheHits:0,

    cacheMisses:0

  })

});



// =====================================
// HELPERS
// =====================================

function createSnapshot(){

  return {

    initialized:
    storageState
    .initialized,

    loading:
    storageState
    .loading,

    saving:
    storageState
    .saving,

    flushing:
    storageState
    .flushing,

    healthy:
    storageState
    .healthy,

    activeOperations:
    storageState
    .activeOperations,

    cacheSize:
    storageState
    .cache
    .size,

    diagnostics:{

      ...storageState
      .diagnostics

    }

  };

}



// =====================================
// FLAGS
// =====================================

function setInitialized(
  value
){

  storageState
  .initialized =
  Boolean(value);

}



function setLoading(
  value
){

  storageState
  .loading =
  Boolean(value);

}



function setSaving(
  value
){

  storageState
  .saving =
  Boolean(value);

}



function setFlushing(
  value
){

  storageState
  .flushing =
  Boolean(value);

}



function setHealthy(
  value
){

  storageState
  .healthy =
  Boolean(value);

}



// =====================================
// OPERATIONS
// =====================================

function incrementOperations(){

  storageState
  .activeOperations++;

}



function decrementOperations(){

  storageState
  .activeOperations =

  Math.max(

    0,

    storageState
    .activeOperations - 1

  );

}



// =====================================
// CACHE
// =====================================

function setCacheItem(
  key,
  value
){

  storageState
  .cache
  .set(

    key,

    value

  );

  return true;

}



function getCacheItem(
  key
){

  return (

    storageState
    .cache
    .get(
      key
    )

    ?? null

  );

}



function removeCacheItem(
  key
){

  return storageState
  .cache
  .delete(
    key
  );

}



function clearCache(){

  storageState
  .cache
  .clear();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementLoads(){

  storageState
  .diagnostics
  .loads++;

}



function incrementSaves(){

  storageState
  .diagnostics
  .saves++;

}



function incrementRemovals(){

  storageState
  .diagnostics
  .removals++;

}



function incrementClears(){

  storageState
  .diagnostics
  .clears++;

}



function incrementFailures(){

  storageState
  .diagnostics
  .failures++;

}



function incrementCacheHits(){

  storageState
  .diagnostics
  .cacheHits++;

}



function incrementCacheMisses(){

  storageState
  .diagnostics
  .cacheMisses++;

}



// =====================================
// SNAPSHOT
// =====================================

function getStorageSnapshot(){

  return Object.freeze(
    createSnapshot()
  );

}



// =====================================
// DIAGNOSTICS SNAPSHOT
// =====================================

function getStorageDiagnostics(){

  return Object.freeze({

    ...storageState
    .diagnostics

  });

}



// =====================================
// RESET
// =====================================

function resetStorageState(){

  storageState
  .initialized = false;

  storageState
  .loading = false;

  storageState
  .saving = false;

  storageState
  .flushing = false;

  storageState
  .healthy = true;

  storageState
  .activeOperations = 0;

  storageState
  .cache
  .clear();

  storageState
  .diagnostics
  .loads = 0;

  storageState
  .diagnostics
  .saves = 0;

  storageState
  .diagnostics
  .removals = 0;

  storageState
  .diagnostics
  .clears = 0;

  storageState
  .diagnostics
  .failures = 0;

  storageState
  .diagnostics
  .cacheHits = 0;

  storageState
  .diagnostics
  .cacheMisses = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const StorageState =
Object.freeze({

  setInitialized,

  setLoading,

  setSaving,

  setFlushing,

  setHealthy,

  incrementOperations,

  decrementOperations,

  setCacheItem,

  getCacheItem,

  removeCacheItem,

  clearCache,

  incrementLoads,

  incrementSaves,

  incrementRemovals,

  incrementClears,

  incrementFailures,

  incrementCacheHits,

  incrementCacheMisses,

  snapshot:
  getStorageSnapshot,

  diagnostics:
  getStorageDiagnostics,

  reset:
  resetStorageState

});



// =====================================
// EXPORTS
// =====================================

export {

  storageState,

  setInitialized,

  setLoading,

  setSaving,

  setFlushing,

  setHealthy,

  incrementOperations,

  decrementOperations,

  setCacheItem,

  getCacheItem,

  removeCacheItem,

  clearCache,

  incrementLoads,

  incrementSaves,

  incrementRemovals,

  incrementClears,

  incrementFailures,

  incrementCacheHits,

  incrementCacheMisses,

  getStorageSnapshot,

  getStorageDiagnostics,

  resetStorageState,

  StorageState

};

export default
StorageState;
