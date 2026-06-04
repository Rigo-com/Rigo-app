// =====================================
// RIGO AI
// STORAGE CONFIG
// FOUNDATION CONFIG LAYER
// =====================================



// =====================================
// STORAGE LIMITS
// =====================================

const STORAGE_LIMITS =
Object.freeze({

  MAX_STORAGE_SIZE:
  5 * 1024 * 1024,

  MAX_CACHE_ITEMS:
  1000,

  MAX_QUEUE_SIZE:
  500,

  MAX_CHAT_RECORDS:
  5000,

  MAX_MEMORY_RECORDS:
  10000

});



// =====================================
// STORAGE TIMERS
// =====================================

const STORAGE_TIMERS =
Object.freeze({

  WRITE_DEBOUNCE:
  100,

  FLUSH_INTERVAL:
  5000,

  CLEANUP_INTERVAL:
  60000

});



// =====================================
// STORAGE FEATURES
// =====================================

const STORAGE_FEATURES =
Object.freeze({

  ENABLE_CACHE:
  true,

  ENABLE_QUEUE:
  true,

  ENABLE_RECOVERY:
  true,

  ENABLE_DIAGNOSTICS:
  true,

  ENABLE_BACKUPS:
  true

});



// =====================================
// STORAGE KEYS
// =====================================

const STORAGE_KEYS =
Object.freeze({

  CHATS:
  "rigo.storage.chats",

  MEMORY:
  "rigo.storage.memory",

  SETTINGS:
  "rigo.storage.settings",

  RUNTIME:
  "rigo.storage.runtime",

  BACKUP:
  "rigo.storage.backup"

});



// =====================================
// STORAGE EVENTS
// =====================================

const STORAGE_EVENTS =
Object.freeze({

  INITIALIZED:
  "storage.initialized",

  DESTROYED:
  "storage.destroyed",

  SAVED:
  "storage.saved",

  LOADED:
  "storage.loaded",

  REMOVED:
  "storage.removed",

  CLEARED:
  "storage.cleared",

  FAILED:
  "storage.failed"

});



// =====================================
// STORAGE NAMESPACES
// =====================================

const STORAGE_NAMESPACES =
Object.freeze({

  CHAT:
  "chat",

  MEMORY:
  "memory",

  SETTINGS:
  "settings",

  CACHE:
  "cache",

  RUNTIME:
  "runtime"

});



// =====================================
// PUBLIC API
// =====================================

const StorageConfig =
Object.freeze({

  limits:
  STORAGE_LIMITS,

  timers:
  STORAGE_TIMERS,

  features:
  STORAGE_FEATURES,

  keys:
  STORAGE_KEYS,

  events:
  STORAGE_EVENTS,

  namespaces:
  STORAGE_NAMESPACES

});



// =====================================
// EXPORTS
// =====================================

export {

  STORAGE_LIMITS,

  STORAGE_TIMERS,

  STORAGE_FEATURES,

  STORAGE_KEYS,

  STORAGE_EVENTS,

  STORAGE_NAMESPACES,

  StorageConfig

};

export default
StorageConfig;
