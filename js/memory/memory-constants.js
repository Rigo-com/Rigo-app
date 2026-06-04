// =====================================
// RIGO AI
// MEMORY CONSTANTS
// MEMORY FOUNDATION CONFIG
// =====================================



// =====================================
// MEMORY LIMITS
// =====================================

const MEMORY_LIMITS =
Object.freeze({

  MAX_MEMORIES:
  10000,

  MAX_CONTEXT_ITEMS:
  50,

  MAX_SUMMARY_LENGTH:
  5000,

  MAX_SEARCH_RESULTS:
  100,

  MAX_EMBEDDINGS:
  10000,

  MAX_TAGS:
  25,

  MAX_IMPORT_SIZE:
  5 * 1024 * 1024

});



// =====================================
// MEMORY TIMERS
// =====================================

const MEMORY_TIMERS =
Object.freeze({

  AUTO_SAVE_INTERVAL:
  30000,

  AUTO_SUMMARY_INTERVAL:
  300000,

  CLEANUP_INTERVAL:
  600000,

  INDEXING_INTERVAL:
  60000,

  CLOUD_SYNC_INTERVAL:
  300000

});



// =====================================
// MEMORY FEATURES
// =====================================

const MEMORY_FEATURES =
Object.freeze({

  ENABLE_SEARCH:
  true,

  ENABLE_EMBEDDINGS:
  true,

  ENABLE_SUMMARIES:
  true,

  ENABLE_INDEXING:
  true,

  ENABLE_CLOUD_SYNC:
  true,

  ENABLE_EXPORT:
  true,

  ENABLE_DIAGNOSTICS:
  true

});



// =====================================
// MEMORY EVENTS
// =====================================

const MEMORY_EVENTS =
Object.freeze({

  INITIALIZED:
  "memory.initialized",

  DESTROYED:
  "memory.destroyed",

  CREATED:
  "memory.created",

  UPDATED:
  "memory.updated",

  REMOVED:
  "memory.removed",

  SEARCHED:
  "memory.searched",

  INDEXED:
  "memory.indexed",

  SUMMARIZED:
  "memory.summarized",

  SYNCED:
  "memory.synced",

  IMPORTED:
  "memory.imported",

  EXPORTED:
  "memory.exported",

  FAILED:
  "memory.failed"

});



// =====================================
// MEMORY NAMESPACES
// =====================================

const MEMORY_NAMESPACES =
Object.freeze({

  SHORT_TERM:
  "short_term",

  LONG_TERM:
  "long_term",

  CONTEXT:
  "context",

  SUMMARY:
  "summary",

  EMBEDDINGS:
  "embeddings",

  INDEX:
  "index"

});



// =====================================
// PUBLIC API
// =====================================

const MemoryConstants =
Object.freeze({

  limits:
  MEMORY_LIMITS,

  timers:
  MEMORY_TIMERS,

  features:
  MEMORY_FEATURES,

  events:
  MEMORY_EVENTS,

  namespaces:
  MEMORY_NAMESPACES

});



// =====================================
// EXPORTS
// =====================================

export {

  MEMORY_LIMITS,

  MEMORY_TIMERS,

  MEMORY_FEATURES,

  MEMORY_EVENTS,

  MEMORY_NAMESPACES,

  MemoryConstants

};

export default
MemoryConstants;
