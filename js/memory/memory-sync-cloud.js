// =====================================
// RIGO AI
// MEMORY CLOUD SYNC
// FINAL OPTIMIZED BUILD
// =====================================



// =====================================
// CONFIG
// =====================================

const MEMORY_SYNC_CONFIG =
Object.freeze({

  ENABLE_SYNC:true,

  ENABLE_AUTO_SYNC:true,

  AUTO_SYNC_INTERVAL:
  30000,

  MAX_SYNC_RETRIES:
  5,

  MAX_QUEUE_SIZE:
  500,

  MAX_BATCH_SIZE:
  100,

  SYNC_TIMEOUT:
  15000

});



// =====================================
// DEVICE ID
// =====================================

const MEMORY_DEVICE_ID =

  typeof createMemoryId ===
  "function"

  ? createMemoryId()

  : `device_${Date.now()}`;



// =====================================
// STATE
// =====================================

const memorySyncState =
Object.seal({

  initialized:false,

  syncing:false,

  connected:false,

  offlineMode:false,

  lastSyncAt:null,

  lastSuccessfulSyncAt:null,

  lastFailedSyncAt:null,

  syncRetries:0,

  totalSyncs:0,

  successfulSyncs:0,

  failedSyncs:0,

  queuedOperations:[],

  syncedMemoryIds:
  new Set(),

  remoteMemoryHashes:
  new Map(),

  syncTimer:null

});



// =====================================
// PROVIDER
// =====================================

const memoryCloudProvider =
Object.seal({

  endpoint:null,

  apiKey:null,

  connected:false

});



// =====================================
// HELPERS
// =====================================

function isNetworkAvailable(){

  if(
    typeof navigator ===
    "undefined"
  ){

    return true;

  }

  return navigator.onLine !==
  false;

}



function isCloudSyncEnabled(){

  return (

    MEMORY_SYNC_CONFIG
    .ENABLE_SYNC === true

  );

}



function chunkSyncMemories(
  memories = []
){

  const chunks = [];

  for(

    let i = 0;

    i < memories.length;

    i +=
    MEMORY_SYNC_CONFIG
    .MAX_BATCH_SIZE

  ){

    chunks.push(

      memories.slice(

        i,

        i +

        MEMORY_SYNC_CONFIG
        .MAX_BATCH_SIZE

      )

    );

  }

  return chunks;

}



// =====================================
// VECTOR CLOCK
// =====================================

function incrementMemoryVectorClock(
  memory
){

  const counter =
  Number(
    memory?.vectorClock
    ?.counter || 0
  );

  return Object.freeze({

    deviceId:
    MEMORY_DEVICE_ID,

    counter:
    counter + 1,

    updatedAt:
    Date.now()

  });

}



function compareVectorClocks(
  localClock,
  remoteClock
){

  if(
    !localClock &&
    !remoteClock
  ){

    return 0;

  }

  if(
    !localClock
  ){

    return -1;

  }

  if(
    !remoteClock
  ){

    return 1;

  }

  const localCounter =
  Number(
    localClock.counter || 0
  );

  const remoteCounter =
  Number(
    remoteClock.counter || 0
  );

  if(
    remoteCounter >
    localCounter
  ){

    return -1;

  }

  if(
    remoteCounter <
    localCounter
  ){

    return 1;

  }

  const localUpdatedAt =
  Number(
    localClock.updatedAt || 0
  );

  const remoteUpdatedAt =
  Number(
    remoteClock.updatedAt || 0
  );

  if(
    remoteUpdatedAt >
    localUpdatedAt
  ){

    return -1;

  }

  if(
    remoteUpdatedAt <
    localUpdatedAt
  ){

    return 1;

  }

  return 0;

}



// =====================================
// CLOUD REQUEST
// =====================================

async function executeCloudRequest(
  endpoint,
  options = {}
){

  if(
    typeof fetch !==
    "function"
  ){

    return null;

  }

  if(
    !memoryCloudProvider
    .connected
  ){

    return null;

  }

  try{

    const controller =
    new AbortController();

    const timeout =
    setTimeout(() => {

      controller.abort();

    },

    MEMORY_SYNC_CONFIG
    .SYNC_TIMEOUT);

    const response =
    await fetch(endpoint, {

      ...options,

      headers:{

        "Content-Type":
        "application/json",

        "Authorization":

          `Bearer ${memoryCloudProvider.apiKey}`,

        ...(options.headers || {})

      },

      signal:
      controller.signal

    });

    clearTimeout(
      timeout
    );

    if(
      !response.ok
    ){

      return null;

    }

    return await response.json();

  }

  catch(error){

    return null;

  }

}



// =====================================
// HASH
// =====================================

async function createCloudMemoryHash(
  memory
){

  if(!memory){

    return null;

  }

  const rawData =
  JSON.stringify({

    id:
    memory.id,

    updatedAt:
    memory.updatedAt,

    content:
    memory.content,

    vectorClock:
    memory.vectorClock

  });

  if(
    typeof createMemoryHash ===
    "function"
  ){

    return createMemoryHash(
      rawData
    );

  }

  return btoa(
    rawData
  );

}



// =====================================
// PAYLOAD
// =====================================

async function createCloudPayload(
  memories = []
){

  const payload = [];

  for(
    const memory
    of memories
  ){

    const validation =

      validateMemoryObject?.(
        memory,
        {
          strict:true
        }
      );

    if(
      !validation?.valid
    ){

      continue;

    }

    const clonedMemory =

      deepClone?.(
        memory
      )

      ||

      { ...memory };



    if(
      !clonedMemory.vectorClock
    ){

      clonedMemory.vectorClock =
      incrementMemoryVectorClock(
        clonedMemory
      );

    }

    const sanitizedMemory =

      sanitizeMemoryObject?.(
        clonedMemory
      )

      ||

      clonedMemory;

    const hash =
    await createCloudMemoryHash(
      sanitizedMemory
    );

    payload.push({

      memory:
      sanitizedMemory,

      hash,

      syncedAt:
      Date.now()

    });

  }

  return {

    exportedAt:
    Date.now(),

    deviceId:
    MEMORY_DEVICE_ID,

    memoryCount:
    payload.length,

    payload

  };

}



// =====================================
// OFFLINE QUEUE
// =====================================

function enqueueSyncOperation(
  memories = []
){

  memorySyncState
  .queuedOperations
  .push({

    id:

      typeof createMemoryId ===
      "function"

      ? createMemoryId()

      : `queue_${Date.now()}`,

    createdAt:
    Date.now(),

    memories:

      Array.isArray(
        memories
      )

      ? memories

      : []

  });

  if(

    memorySyncState
    .queuedOperations
    .length >

    MEMORY_SYNC_CONFIG
    .MAX_QUEUE_SIZE

  ){

    memorySyncState
    .queuedOperations
    .shift();

  }

  return true;

}



function clearSyncQueue(){

  memorySyncState
  .queuedOperations =
  [];

  return true;

}



// =====================================
// CONNECTION
// =====================================

async function connectCloudProvider(
  config = {}
){

  try{

    if(
      !config.endpoint ||
      !config.apiKey
    ){

      return false;

    }

    memoryCloudProvider
    .endpoint =
    config.endpoint;

    memoryCloudProvider
    .apiKey =
    config.apiKey;

    memoryCloudProvider
    .connected = true;

    memorySyncState
    .connected = true;

    memorySyncState
    .initialized = true;

    return true;

  }

  catch(error){

    memorySyncState
    .connected = false;

    return false;

  }

}



function disconnectCloudProvider(){

  memoryCloudProvider
  .endpoint = null;

  memoryCloudProvider
  .apiKey = null;

  memoryCloudProvider
  .connected = false;

  memorySyncState
  .connected = false;

  return true;

}



// =====================================
// RETRY
// =====================================

async function executeSyncWithRetry(
  operation
){

  let attempt = 0;

  while(

    attempt <

    MEMORY_SYNC_CONFIG
    .MAX_SYNC_RETRIES

  ){

    try{

      const result =
      await operation();

      if(result){

        memorySyncState
        .syncRetries = 0;

        return true;

      }

    }

    catch(error){}

    attempt++;

    memorySyncState
    .syncRetries =
    attempt;

    await new Promise((resolve) => {

      setTimeout(
        resolve,
        Math.min(
          1000 * attempt,
          5000
        )
      );

    });

  }

  return false;

}



// =====================================
// CONFLICT RESOLUTION
// =====================================

function resolveMemoryConflict(
  localMemory,
  remoteMemory
){

  if(
    !localMemory
  ){

    return remoteMemory;

  }

  if(
    !remoteMemory
  ){

    return localMemory;

  }

  const comparison =
  compareVectorClocks(

    localMemory.vectorClock,

    remoteMemory.vectorClock

  );

  if(
    comparison < 0
  ){

    return remoteMemory;

  }

  if(
    comparison > 0
  ){

    return localMemory;

  }

  return (

    remoteMemory.updatedAt >

    localMemory.updatedAt

  )

  ? remoteMemory

  : localMemory;

}



// =====================================
// DELTA MEMORIES
// =====================================

async function getDeltaSyncMemories(){

  const changedMemories = [];

  const memories =

    Array.isArray(
      memoryState?.memories
    )

    ? memoryState.memories

    : [];

  for(
    const memory
    of memories
  ){

    const currentHash =
    await createCloudMemoryHash(
      memory
    );

    const remoteHash =

      memorySyncState
      .remoteMemoryHashes
      .get(
        memory.id
      );

    if(
      currentHash !==
      remoteHash
    ){

      changedMemories.push(
        memory
      );

    }

  }

  return changedMemories;

}



// =====================================
// PUSH
// =====================================

async function pushMemoriesToCloud(
  memories = []
){

  try{

    if(
      !isNetworkAvailable()
    ){

      memorySyncState
      .offlineMode = true;

      enqueueSyncOperation(
        memories
      );

      return false;

    }

    const batches =
    chunkSyncMemories(
      memories
    );

    for(
      const batch
      of batches
    ){

      const payload =
      await createCloudPayload(
        batch
      );

      const success =
      await executeSyncWithRetry(
        async() => {

          const response =
          await executeCloudRequest(

            `${memoryCloudProvider.endpoint}/push`,

            {
              method:"POST",

              body:JSON.stringify(
                payload
              )
            }

          );

          return !!response;

        }
      );

      if(!success){

        return false;

      }

      for(
        const memory
        of batch
      ){

        const hash =
        await createCloudMemoryHash(
          memory
        );

        memorySyncState
        .remoteMemoryHashes
        .set(
          memory.id,
          hash
        );

        memorySyncState
        .syncedMemoryIds
        .add(
          memory.id
        );

      }

    }

    return true;

  }

  catch(error){

    memorySyncState
    .failedSyncs++;

    return false;

  }

}



// =====================================
// PULL
// =====================================

async function pullMemoriesFromCloud(){

  try{

    if(
      !isNetworkAvailable()
    ){

      memorySyncState
      .offlineMode = true;

      return [];

    }

    const response =
    await executeCloudRequest(

      `${memoryCloudProvider.endpoint}/pull`,

      {
        method:"GET"
      }

    );

    if(
      !response ||
      !Array.isArray(
        response.memories
      )
    ){

      return [];
    }

    return response.memories
    .filter((memory) => {

      const validation =

        validateMemoryObject?.(
          memory,
          {
            strict:true
          }
        );

      return validation?.valid ===
      true;

    });

  }

  catch(error){

    memorySyncState
    .failedSyncs++;

    return [];

  }

}



// =====================================
// PROCESS REMOTE
// =====================================

async function processRemoteMemories(
  remoteMemories = []
){

  if(
    !Array.isArray(
      remoteMemories
    )
  ){

    return false;

  }

  for(
    const remoteMemory
    of remoteMemories
  ){

    const localMemory =

      getMemoryById?.(
        remoteMemory.id
      )

      ||

      null;

    const resolvedMemory =
    resolveMemoryConflict(

      localMemory,
      remoteMemory

    );

    if(!resolvedMemory){

      continue;

    }

    if(!localMemory){

      memoryState.memories
      .push(
        resolvedMemory
      );

      indexMemory?.(
        resolvedMemory
      );

      continue;

    }

    await updateMemory?.(

      resolvedMemory.id,

      resolvedMemory

    );

  }

  updateMemoryMetrics?.();

  return true;

}



// =====================================
// MAIN SYNC
// =====================================

async function syncMemoryCloud(){

  if(
    memorySyncState
    .syncing
  ){

    return false;

  }

  if(
    !isCloudSyncEnabled()
  ){

    return false;

  }

  memorySyncState
  .syncing = true;

  try{

    if(
      !isNetworkAvailable()
    ){

      memorySyncState
      .offlineMode = true;

      enqueueSyncOperation(
        memoryState.memories
      );

      return false;

    }

    const deltaMemories =
    await getDeltaSyncMemories();

    const pushSuccess =
    await pushMemoriesToCloud(
      deltaMemories
    );

    const remoteMemories =
    await pullMemoriesFromCloud();

    await processRemoteMemories(
      remoteMemories
    );

    memorySyncState
    .totalSyncs++;

    memorySyncState
    .lastSyncAt =
    Date.now();

    if(pushSuccess){

      memorySyncState
      .successfulSyncs++;

      memorySyncState
      .lastSuccessfulSyncAt =
      Date.now();

      memorySyncState
      .offlineMode = false;

      await processOfflineQueue();

    }

    else{

      memorySyncState
      .failedSyncs++;

      memorySyncState
      .lastFailedSyncAt =
      Date.now();

    }

    return pushSuccess;

  }

  catch(error){

    memorySyncState
    .failedSyncs++;

    memorySyncState
    .lastFailedSyncAt =
    Date.now();

    return false;

  }

  finally{

    memorySyncState
    .syncing = false;

  }

}



// =====================================
// OFFLINE RECOVERY
// =====================================

async function processOfflineQueue(){

  if(
    !isNetworkAvailable()
  ){

    return false;

  }

  const operations = [

    ...memorySyncState
    .queuedOperations

  ];

  clearSyncQueue();

  for(
    const queued
    of operations
  ){

    await pushMemoriesToCloud(
      queued.memories
    );

  }

  memorySyncState
  .offlineMode = false;

  return true;

}



// =====================================
// AUTO SYNC
// =====================================

function startAutoMemorySync(){

  stopAutoMemorySync();

  if(

    !MEMORY_SYNC_CONFIG
    .ENABLE_AUTO_SYNC

  ){

    return false;

  }

  memorySyncState
  .syncTimer =
  setInterval(() => {

    if(
      memorySyncState
      .syncing
    ){

      return;
    }

    syncMemoryCloud();

  },

  MEMORY_SYNC_CONFIG
  .AUTO_SYNC_INTERVAL);

  return true;

}



function stopAutoMemorySync(){

  if(
    memorySyncState
    .syncTimer
  ){

    clearInterval(

      memorySyncState
      .syncTimer

    );

    memorySyncState
    .syncTimer = null;

  }

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemorySyncDiagnostics(){

  return Object.freeze({

    initialized:
    memorySyncState
    .initialized,

    enabled:
    MEMORY_SYNC_CONFIG
    .ENABLE_SYNC,

    connected:
    memorySyncState
    .connected,

    syncing:
    memorySyncState
    .syncing,

    offlineMode:
    memorySyncState
    .offlineMode,

    totalSyncs:
    memorySyncState
    .totalSyncs,

    successfulSyncs:
    memorySyncState
    .successfulSyncs,

    failedSyncs:
    memorySyncState
    .failedSyncs,

    queuedOperations:

      memorySyncState
      .queuedOperations
      .length,

    syncedMemories:

      memorySyncState
      .syncedMemoryIds
      .size,

    lastSyncAt:
    memorySyncState
    .lastSyncAt,

    lastSuccessfulSyncAt:

      memorySyncState
      .lastSuccessfulSyncAt,

    lastFailedSyncAt:

      memorySyncState
      .lastFailedSyncAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryCloudSync =
Object.freeze({

  connect:
  connectCloudProvider,

  disconnect:
  disconnectCloudProvider,

  sync:
  syncMemoryCloud,

  push:
  pushMemoriesToCloud,

  pull:
  pullMemoriesFromCloud,

  processRemote:
  processRemoteMemories,

  processQueue:
  processOfflineQueue,

  startAutoSync:
  startAutoMemorySync,

  stopAutoSync:
  stopAutoMemorySync,

  diagnostics:
  getMemorySyncDiagnostics

});



// =====================================
// EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryCloudSync =
  MemoryCloudSync;

}



export default
MemoryCloudSync;
