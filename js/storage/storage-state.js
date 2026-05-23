// =====================================
// STORAGE STATE
// =====================================

const storageState =
Object.seal({

  initialized:false,

  available:null,

  hydrated:false,

  writing:false,

  destroyed:false,

  lastSyncAt:null,

  writeQueue:[],

  writeTimer:null,

  cache:{

    chats:[],

    memory:{}

  }

});
