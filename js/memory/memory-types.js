// =====================================
// RIGO AI
// MEMORY TYPES
// TYPE DEFINITIONS LAYER
// =====================================



// =====================================
// MEMORY STATES
// =====================================

const MEMORY_STATES =
Object.freeze({

  IDLE:
  "idle",

  INITIALIZING:
  "initializing",

  READY:
  "ready",

  PROCESSING:
  "processing",

  SEARCHING:
  "searching",

  INDEXING:
  "indexing",

  SYNCING:
  "syncing",

  ERROR:
  "error"

});



// =====================================
// MEMORY TYPES
// =====================================

const MEMORY_TYPES =
Object.freeze({

  SHORT_TERM:
  "short_term",

  LONG_TERM:
  "long_term",

  CONTEXT:
  "context",

  SUMMARY:
  "summary",

  FACT:
  "fact",

  CONVERSATION:
  "conversation",

  SYSTEM:
  "system"

});



// =====================================
// MEMORY PRIORITIES
// =====================================

const MEMORY_PRIORITIES =
Object.freeze({

  LOW:
  "low",

  NORMAL:
  "normal",

  HIGH:
  "high",

  CRITICAL:
  "critical"

});



// =====================================
// MEMORY STATUS
// =====================================

const MEMORY_STATUS =
Object.freeze({

  ACTIVE:
  "active",

  ARCHIVED:
  "archived",

  DELETED:
  "deleted",

  EXPIRED:
  "expired"

});



// =====================================
// MEMORY SEARCH MODES
// =====================================

const MEMORY_SEARCH_MODES =
Object.freeze({

  EXACT:
  "exact",

  FUZZY:
  "fuzzy",

  SEMANTIC:
  "semantic",

  HYBRID:
  "hybrid"

});



// =====================================
// MEMORY INDEX STATUS
// =====================================

const MEMORY_INDEX_STATUS =
Object.freeze({

  PENDING:
  "pending",

  INDEXED:
  "indexed",

  FAILED:
  "failed"

});



// =====================================
// PUBLIC API
// =====================================

const MemoryTypes =
Object.freeze({

  states:
  MEMORY_STATES,

  types:
  MEMORY_TYPES,

  priorities:
  MEMORY_PRIORITIES,

  status:
  MEMORY_STATUS,

  searchModes:
  MEMORY_SEARCH_MODES,

  indexStatus:
  MEMORY_INDEX_STATUS

});



// =====================================
// EXPORTS
// =====================================

export {

  MEMORY_STATES,

  MEMORY_TYPES,

  MEMORY_PRIORITIES,

  MEMORY_STATUS,

  MEMORY_SEARCH_MODES,

  MEMORY_INDEX_STATUS,

  MemoryTypes

};

export default
MemoryTypes;
