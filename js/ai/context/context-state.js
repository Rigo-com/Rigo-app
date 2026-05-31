// =====================================
// RIGO AI
// CONTEXT STATE
// =====================================

export const contextManagerState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  operationLock:false,

  contexts:
  new Map(),

  sessions:
  new Map(),

  runtimeContexts:
  new Map(),

  sharedContexts:
  new Map(),

  indexes:
  new Map(),

  contextTokens:
  new Map(),

  retrievalCache:
  new Map(),

  contentHashes:
  new Map(),

  evictionTimer:null,

  diagnostics:
  Object.seal({

    created:0,

    updated:0,

    removed:0,

    compressed:0,

    ranked:0,

    synchronized:0,

    cacheHits:0,

    cacheMisses:0,

    indexed:0,

    evicted:0,

    rejected:0,

    duplicates:0

  }),

  lastUpdatedAt:null

});
