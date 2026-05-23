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

  lastSyncAt:null,

  lastWriteAt:null,

  writeQueue:[],

  writeTimer:null,

  quotaRecoveries:0,

  failedWrites:0,

  cache:Object.seal({

    chats:[],

    memory:Object.seal({})

  })

});
