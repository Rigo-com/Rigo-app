// =====================================
// RIGO AI
// MEMORY INDEX
// FINAL ROOT EXPORT
// HARDENED INTEGRATED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./memory-core.js";
import "./memory-state.js";
import "./memory-types.js";
import "./memory-constants.js";
import "./memory-utils.js";

import "./memory-storage.js";

import "./memory-context.js";

import "./memory-search.js";
import "./memory-ranking.js";
import "./memory-indexing.js";

import "./memory-security.js";

import "./memory-events.js";

import "./memory-validation.js";

import "./memory-summary.js";

import "./memory-embeddings.js";

import "./memory-cleanup.js";

import "./memory-sync-cloud.js";

import "./memory-export.js";

import "./memory-debug.js";

import "./memory-manager.js";

import "./memory-subsystem.js";



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

import RIGOMemory
from "./memory-subsystem.js";



// =====================================
// EXPORTS
// =====================================

export {

  RIGOMemory

};



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis ===
  "object"
){

  Object.defineProperty(

    globalThis,

    "RIGOMemory",

    {

      value:
      RIGOMemory,

      writable:false,

      configurable:false

    }

  );

}



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGOMemory;
