// =====================================
// RIGO AI
// MEMORY CLOUD SYNC
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// CLOUD CONFIG
// =====================================

const MEMORY_SYNC_CONFIG =
Object.freeze({

  ENABLE_SYNC:true,

  ENABLE_AUTO_SYNC:true,

  ENABLE_CONFLICT_RESOLUTION:true,

  ENABLE_OFFLINE_QUEUE:true,

  ENABLE_SYNC_COMPRESSION:true,

  ENABLE_DELTA_SYNC:true,

  AUTO_SYNC_INTERVAL:
  30000,

  MAX_SYNC_RETRIES:5,

  MAX_QUEUE_SIZE:1000,

  MAX_BATCH_SIZE:100,

  SYNC_TIMEOUT:
  15000,

  MAX_SYNC_SESSION_AGE:
  1000 * 60 * 60,

  SYNC_TRANSPORT:
  "rest",

  CLOUD_VERSION:"1.0.0"

});



// =====================================
// DEVICE IDENTITY
// =====================================

const MEMORY_DEVICE_ID =
createMemoryId();



// =====================================
// SYNC LOCK
// =====================================

let memorySyncLock =
false;



function acquireMemorySyncLock(){

  if(
    memorySyncLock
  ){

    return false;

  }

  memorySyncLock =
  true;

  return true;

}



function releaseMemorySyncLock(){

  memorySyncLock =
  false;

  return true;

}



// =====================================
// CLOUD STATE
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

  pendingUploads:
  new Set(),

  pendingDownloads:
  new Set(),

  syncedMemoryIds:
  new Set(),

  failedMemoryIds:
  new Set(),

  remoteMemoryHashes:
  new Map(),

  syncSessions:
  new Map(),

  syncTimer:null

});



// =====================================
// CLOUD PROVIDER
// =====================================

const memoryCloudProvider =
Object.seal({

  endpoint:null,

  apiKey:null,

  connected:false,

  authenticated:false

});



// =====================================
// NETWORK HELPERS
// =====================================

function isNetworkAvailable(){

  if(
    typeof navigator ===
    "undefined"
  ){

    return false;
  }

  return navigator.onLine !== false;

}



function isCloudSyncEnabled(){

  return (

    MEMORY_SYNC_CONFIG
    .ENABLE_SYNC === true

  );

}



// =====================================
// SAFE BATCHING
// =====================================

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
// SESSION CLEANUP
// =====================================

function cleanupSyncSessions(){

  const now =
  Date.now();

  memorySyncState
  .syncSessions
  .forEach((session,id) => {

    if(

      now -
      session.startedAt >

      MEMORY_SYNC_CONFIG
      .MAX_SYNC_SESSION_AGE

    ){

      memorySyncState
      .syncSessions
      .delete(id);

    }

  });

}



// =====================================
// SYNC SESSION
// =====================================

function createSyncSession(){

  cleanupSyncSessions();

  const session = {

    id:createMemoryId(),

    startedAt:
    Date.now(),

    completed:false,

    uploaded:0,

    downloaded:0,

    failed:0

  };

  memorySyncState
  .syncSessions
  .set(
    session.id,
    session
  );

  return session;

}



// =====================================
// VECTOR CLOCK
// =====================================

function incrementMemoryVectorClock(
  memory
){

  const currentCounter =
  safeMemoryNumber(
    memory?.vectorClock
    ?.counter,
    0
  );

  return deepFreeze({

    deviceId:
    MEMORY_DEVICE_ID,

    counter:
    Math.max(
      0,
      currentCounter
    ) + 1,

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
  safeMemoryNumber(
    localClock.counter,
    0
  );

  const remoteCounter =
  safeMemoryNumber(
    remoteClock.counter,
    0
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
  safeMemoryNumber(
    localClock.updatedAt,
    0
  );

  const remoteUpdatedAt =
  safeMemoryNumber(
    remoteClock.updatedAt,
    0
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
// CLOUD REQUEST WRAPPER
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

  if(
    !endpoint ||
    typeof endpoint !==
    "string"
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

    const contentType =
    response.headers.get(
      "content-type"
    ) || "";

    if(

      !contentType.includes(
        "application/json"
      )

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
// CLOUD HASH
// =====================================

async function createCloudMemoryHash(
  memory
){

  if(!memory){

    return null;
  }

  return createMemoryHash(
    JSON.stringify({

      id:memory.id,

      updatedAt:
      memory.updatedAt,

      content:
      memory.content,

      version:
      memory.version,

      vectorClock:
      memory.vectorClock

    })
  );

}



// =====================================
// CLOUD PAYLOAD
// =====================================

async function createCloudPayload(
  memories = []
){

  const safeMemories =

    Array.isArray(
      memories
    )

    ? memories

    : [];

  const payload = [];

  for(
    const memory
    of safeMemories
  ){

    const validation =
    validateMemoryObject(
      memory,
      {
        strict:true
      }
    );

    if(
      !validation.valid
    ){

      continue;

    }

    const vectorClock =
    incrementMemoryVectorClock(
      memory
    );

    const sanitizedMemory =
    deepFreeze(
      sanitizeMemoryObject({

        ...deepClone(
          memory
        ),

        vectorClock

      })
    );

    const hash =
    await createCloudMemoryHash(
      sanitizedMemory
    );

    payload.push(
      deepFreeze({

        memory:
        sanitizedMemory,

        hash,

        syncedAt:
        Date.now()

      })
    );

  }

  return deepFreeze({

    version:
    MEMORY_SYNC_CONFIG
    .CLOUD_VERSION,

    exportedAt:
    Date.now(),

    deviceId:
    MEMORY_DEVICE_ID,

    memoryCount:
    payload.length,

    payload

  });

}



// =====================================
// OFFLINE QUEUE
// =====================================

function enqueueSyncOperation(
  operation
){

  if(
    !operation ||
    typeof operation !==
    "object"
  ){

    return false;
  }

  const safeOperation = {

    type:
    normalizeMemoryString(
      operation.type
    ),

    memories:

      Array.isArray(
        operation.memories
      )

      ? removeDuplicateMemories(

          operation.memories
          .map((memory) => {

            return sanitizeMemoryObject(
              memory
            );

          })

        )

      : []

  };

  const exists =

    memorySyncState
    .queuedOperations
    .some((queued) => {

      return (

        queued.operation
        .type ===

        safeOperation.type

      );

    });

  if(exists){

    return true;

  }

  memorySyncState
  .queuedOperations
  .push({

    id:createMemoryId(),

    createdAt:
    Date.now(),

    operation:
    deepFreeze(
      safeOperation
    )

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
    normalizeMemoryString(
      config.endpoint
    );

    memoryCloudProvider
    .apiKey =
    normalizeMemoryString(
      config.apiKey
    );

    memoryCloudProvider
    .connected = true;

    memoryCloudProvider
    .authenticated = true;

    memorySyncState
    .connected = true;

    return true;

  }

  catch(error){

    memorySyncState
    .connected = false;

    return false;

  }

}



// =====================================
// DISCONNECT
// =====================================

function disconnectCloudProvider(){

  memoryCloudProvider
  .endpoint = null;

  memoryCloudProvider
  .apiKey = null;

  memoryCloudProvider
  .connected = false;

  memoryCloudProvider
  .authenticated = false;

  memorySyncState
  .connected = false;

  return true;

}



// =====================================
// RETRY SYSTEM
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
      await Promise.race([

        Promise.resolve(
          operation()
        ),

        new Promise((resolve) => {

          setTimeout(() => {

            resolve(false);

          },

          MEMORY_SYNC_CONFIG
          .SYNC_TIMEOUT);

        })

      ]);

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

  const clockResult =
  compareVectorClocks(

    localMemory.vectorClock,

    remoteMemory.vectorClock

  );

  if(
    clockResult < 0
  ){

    return remoteMemory;

  }

  if(
    clockResult > 0
  ){

    return localMemory;

  }

  if(

    localMemory.content !==
    remoteMemory.content

  ){

    return {

      ...remoteMemory,

      conflicted:true

    };

  }

  const localUpdatedAt =
  Number(
    localMemory.updatedAt
  );

  const remoteUpdatedAt =
  Number(
    remoteMemory.updatedAt
  );

  if(
    remoteUpdatedAt >
    localUpdatedAt
  ){

    return remoteMemory;
  }

  return localMemory;

}



// =====================================
// DELTA SYNC
// =====================================

async function getDeltaSyncMemories(){

  const changedMemories = [];

  for(
    const memory
    of memoryState.memories
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
        sanitizeMemoryObject({
          ...memory,
          vectorClock:
          incrementMemoryVectorClock(
            memory
          )
        })
      );

    }

  }

  return changedMemories;

}



// =====================================
// PUSH TO CLOUD
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

      enqueueSyncOperation({

        type:"push",

        memories

      });

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

      if(!payload){

        return false;
      }

      const success =
      await executeSyncWithRetry(
        async () => {

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

        memorySyncState
        .failedMemoryIds
        .delete(
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
// PULL FROM CLOUD
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

    return response.memories;

  }

  catch(error){

    memorySyncState
    .failedSyncs++;

    return [];

  }

}



// =====================================
// PROCESS REMOTE MEMORIES
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

  const sanitizedRemoteMemories =
  removeDuplicateMemories(
    remoteMemories
  );

  for(
    const remoteMemory
    of sanitizedRemoteMemories
  ){

    const validation =
    validateMemoryObject(
      remoteMemory,
      {
        strict:true
      }
    );

    if(
      !validation.valid
    ){

      memorySyncState
      .failedMemoryIds
      .add(

        remoteMemory?.id ||

        createMemoryId()

      );

      continue;

    }

    const sanitizedMemory =
    sanitizeMemoryObject(
      deepClone(
        remoteMemory
      )
    );

    const localMemory =
    getMemoryById(
      sanitizedMemory.id
    );

    const resolvedMemory =
    resolveMemoryConflict(

      localMemory,
      sanitizedMemory

    );

    if(!resolvedMemory){

      continue;

    }

    if(!localMemory){

      memoryState.memories =
      deepFreeze([

        ...memoryState.memories,

        resolvedMemory

      ]);

      continue;

    }

    await updateMemory(

      resolvedMemory.id,

      resolvedMemory

    );

  }

  updateMemoryMetrics();

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
    !acquireMemorySyncLock()
  ){

    return false;

  }

  if(
    !isCloudSyncEnabled()
  ){

    releaseMemorySyncLock();

    return false;

  }

  memorySyncState
  .syncing = true;

  const session =
  createSyncSession();

  try{

    if(
      !isNetworkAvailable()
    ){

      memorySyncState
      .offlineMode = true;

      enqueueSyncOperation({

        type:"push",

        memories:
        memoryState.memories

      });

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

      if(

        typeof emitMemoryEvent ===
        "function"

      ){

        emitMemoryEvent(
          MEMORY_EVENT_TYPES
          .MEMORY_SYNCED,
          {
            syncedAt:
            Date.now()
          }
        )
        .catch(() => {});

      }

    }

    else{

      memorySyncState
      .failedSyncs++;

      memorySyncState
      .lastFailedSyncAt =
      Date.now();

    }

    session.completed =
    true;

    session.completedAt =
    Date.now();

    return pushSuccess;

  }

  catch(error){

    memorySyncState
    .failedSyncs++;

    memorySyncState
    .lastFailedSyncAt =
    Date.now();

    session.failed = true;

    return false;

  }

  finally{

    memorySyncState
    .syncing = false;

    releaseMemorySyncLock();

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

    const operation =
    queued.operation;

    if(
      operation.type ===
      "push"
    ){

      await pushMemoriesToCloud(
        operation.memories
      );

    }

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
// SYNC DIAGNOSTICS
// =====================================

function getMemorySyncDiagnostics(){

  return {

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

    transport:
    MEMORY_SYNC_CONFIG
    .SYNC_TRANSPORT,

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

    failedMemories:

      memorySyncState
      .failedMemoryIds
      .size,

    activeSessions:

      memorySyncState
      .syncSessions
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

  };

}
