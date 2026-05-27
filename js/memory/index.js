// =====================================
// RIGO AI
// MEMORY INDEX
// FINAL ROOT EXPORT
// =====================================



// =====================================
// CORE
// =====================================

export * from "./memory-core.js";
export * from "./memory-state.js";
export * from "./memory-types.js";
export * from "./memory-constants.js";
export * from "./memory-utils.js";



// =====================================
// STORAGE
// =====================================

export * from "./memory-storage.js";



// =====================================
// CONTEXT
// =====================================

export * from "./memory-context.js";



// =====================================
// SEARCH
// =====================================

export * from "./memory-search.js";
export * from "./memory-ranking.js";
export * from "./memory-indexing.js";



// =====================================
// SECURITY
// =====================================

export * from "./memory-security.js";



// =====================================
// EVENTS
// =====================================

export * from "./memory-events.js";



// =====================================
// VALIDATION
// =====================================

export * from "./memory-validation.js";



// =====================================
// SUMMARY
// =====================================

export * from "./memory-summary.js";



// =====================================
// EMBEDDINGS
// =====================================

export * from "./memory-embeddings.js";



// =====================================
// CLEANUP
// =====================================

export * from "./memory-cleanup.js";



// =====================================
// CLOUD SYNC
// =====================================

export * from "./memory-sync-cloud.js";



// =====================================
// EXPORT
// =====================================

export * from "./memory-export.js";



// =====================================
// DEBUG
// =====================================

export * from "./memory-debug.js";



// =====================================
// MANAGER
// =====================================

export * from "./memory-manager.js";



// =====================================
// SUBSYSTEM
// =====================================

export * from "./memory-subsystem.js";



// =====================================
// MEMORY API
// =====================================

import MemoryAPI
from "./memory-subsystem.js";



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof globalThis === "object"){

  globalThis.MemoryAPI =
  MemoryAPI;

}



// =====================================
// DEFAULT EXPORT
// =====================================

export default MemoryAPI;
