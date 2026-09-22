const STORAGE_LIMITS=Object.freeze({
  MAX_STORAGE_SIZE:5*1024*1024,
  MAX_CACHE_ITEMS:1000,
  MAX_QUEUE_SIZE:500
});

const STORAGE_KEYS=Object.freeze({
  MEMORY:"rigo.storage.memory"
});

const STORAGE_EVENTS=Object.freeze({
  INITIALIZED:"storage.initialized",
  DESTROYED:"storage.destroyed",
  SAVED:"storage.saved",
  LOADED:"storage.loaded",
  REMOVED:"storage.removed",
  CLEARED:"storage.cleared",
  FAILED:"storage.failed"
});

const StorageConfig=Object.freeze({
  limits:STORAGE_LIMITS,
  keys:STORAGE_KEYS,
  events:STORAGE_EVENTS
});

export {STORAGE_LIMITS,STORAGE_KEYS,STORAGE_EVENTS,StorageConfig};
export default StorageConfig;