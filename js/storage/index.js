// =====================================
// STORAGE DIAGNOSTICS
// =====================================

function getStorageDiagnostics(){

  return Object.freeze({

    initialized:
    storageState
    .initialized,

    available:
    storageState
    .available,

    hydrated:
    storageState
    .hydrated,

    pendingHydration:
    storageState
    .pendingHydration,

    writing:
    storageState
    .writing,

    destroyed:
    storageState
    .destroyed,



    // ===================================
    // TIMESTAMPS
    // ===================================

    lastSyncAt:
    storageState
    .lastSyncAt,

    lastWriteAt:
    storageState
    .lastWriteAt,

    lastHydrationAt:
    storageState
    .lastHydrationAt,

    lastMemoryWriteVersion:
    storageState
    .lastMemoryWriteVersion,



    // ===================================
    // QUEUE
    // ===================================

    queueSize:

      Array.isArray(

        storageState
        .writeQueue

      )

      ?

      storageState
      .writeQueue
      .length

      :

      0,



    // ===================================
    // METRICS
    // ===================================

    failedWrites:
    storageState
    .failedWrites,

    quotaRecoveries:
    storageState
    .quotaRecoveries,



    // ===================================
    // CACHE
    // ===================================

    cachedChats:

      Array.isArray(

        storageState
        .cache
        .chats

      )

      ?

      storageState
      .cache
      .chats
      .length

      :

      0,

    cachedMemoryKeys:

      storageState
      .cache
      .memory

      &&

      typeof storageState
      .cache
      .memory ===
      "object"

      ?

      Object.keys(

        storageState
        .cache
        .memory

      ).length

      :

      0

  });

}



// =====================================
// STORAGE AVAILABILITY STATUS
// =====================================

function isStorageReady(){

  return (

    storageState
    .initialized ===
    true

    &&

    storageState
    .available ===
    true

    &&

    storageState
    .hydrated ===
    true

    &&

    storageState
    .destroyed ===
    false

  );

}



// =====================================
// SAFE STATE SNAPSHOT
// =====================================

function getStorageStateSnapshot(){

  return deepClone({

    initialized:
    storageState
    .initialized,

    available:
    storageState
    .available,

    hydrated:
    storageState
    .hydrated,

    pendingHydration:
    storageState
    .pendingHydration,

    writing:
    storageState
    .writing,

    destroyed:
    storageState
    .destroyed

  });

}



// =====================================
// STORAGE PUBLIC API
// =====================================

const StorageRuntime =
Object.freeze({

  initialize:
  initializeStorageRuntime,

  destroy:
  destroyStorageRuntime,



  // ===================================
  // CHAT
  // ===================================

  saveChats,
  loadChats,

  saveCurrentChat,
  getChatById,



  // ===================================
  // MEMORY
  // ===================================

  saveMemory,
  loadMemory,



  // ===================================
  // STATUS
  // ===================================

  diagnostics:
  getStorageDiagnostics,

  isReady:
  isStorageReady,

  getState:
  getStorageStateSnapshot

});
