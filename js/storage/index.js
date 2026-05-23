// =====================================
// STORAGE DIAGNOSTICS
// =====================================

function getStorageDiagnostics(){

  return Object.freeze({

    initialized:
    storageState.initialized,

    available:
    storageState.available,

    hydrated:
    storageState.hydrated,

    pendingHydration:
    storageState.pendingHydration,

    writing:
    storageState.writing,

    destroyed:
    storageState.destroyed,

    lastSyncAt:
    storageState.lastSyncAt,

    lastWriteAt:
    storageState.lastWriteAt,

    queueSize:

      storageState
      .writeQueue
      .length,

    failedWrites:
    storageState.failedWrites,

    quotaRecoveries:
    storageState.quotaRecoveries,

    cachedChats:

      storageState
      .cache
      .chats
      .length,

    cachedMemoryKeys:

      Object.keys(

        storageState
        .cache
        .memory

      ).length

  });

}



// =====================================
// STORAGE AVAILABILITY STATUS
// =====================================

function isStorageReady(){

  return (

    storageState.initialized

    &&

    storageState.available ===
    true

    &&

    storageState.destroyed ===
    false

  );

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

  saveChats,
  loadChats,

  saveMemory,
  loadMemory,

  saveCurrentChat,
  getChatById,

  diagnostics:
  getStorageDiagnostics,

  isReady:
  isStorageReady,

  state:
  storageState

});
