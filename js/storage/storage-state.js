// =====================================
// STORAGE STATE
// =====================================

const storageState =
Object.seal({

  initialized:false,

  available:null,

  hydrated:false,

  pendingHydration:false,

  writing:false,

  destroyed:false,



  // ===================================
  // TIMESTAMPS
  // ===================================

  lastSyncAt:null,

  lastWriteAt:null,

  lastHydrationAt:null,

  lastMemoryWriteVersion:null,



  // ===================================
  // QUEUE
  // ===================================

  writeQueue:[],

  writeTimer:null,



  // ===================================
  // METRICS
  // ===================================

  quotaRecoveries:0,

  failedWrites:0,



  // ===================================
  // CACHE
  // ===================================

  cache:Object.seal({

    chats:
    deepFreeze([]),

    memory:
    deepFreezeMemory({})

  })

});
