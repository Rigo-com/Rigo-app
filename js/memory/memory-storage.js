// =====================================
// RIGO AI
// MEMORY STORAGE
// ENTERPRISE STORAGE SYSTEM
// FINAL STABLE BUILD
// =====================================



// =====================================
// STORAGE LOCK
// =====================================

let memoryStorageLocked =
false;



// =====================================
// STORAGE HELPERS
// =====================================

function isMemoryStorageAvailable(){

  try{

    if(
      typeof localStorage ===
      "undefined"
    ){

      return false;

    }

    const testKey =
    "__rigo_memory_test__";

    localStorage.setItem(
      testKey,
      "1"
    );

    localStorage.removeItem(
      testKey
    );

    return true;

  }

  catch(error){

    return false;

  }

}



function getPerformanceNow(){

  try{

    if(

      typeof performance !==
      "undefined"

      &&

      typeof performance.now ===
      "function"

    ){

      return performance.now();

    }

    return Date.now();

  }

  catch(error){

    return Date.now();

  }

}



async function waitForStorageUnlock(
  timeout = 10000
){

  return new Promise((resolve) => {

    const startedAt =
    Date.now();

    const interval =
    setInterval(() => {

      const expired =

        (
          Date.now() -
          startedAt
        ) >= timeout;

      if(
        !memoryStorageLocked
      ){

        clearInterval(
          interval
        );

        resolve(true);

        return;

      }

      if(expired){

        clearInterval(
          interval
        );

        memoryStorageLocked =
        false;

        resolve(false);

      }

    },25);

  });

}



function lockMemoryStorage(){

  if(
    memoryStorageLocked
  ){

    return false;

  }

  memoryStorageLocked =
  true;

  return true;

}



function unlockMemoryStorage(){

  memoryStorageLocked =
  false;

  return true;

}



// =====================================
// SERIALIZATION
// =====================================

function serializeMemoryData(
  data
){

  try{

    return JSON.stringify(
      data
    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    return null;

  }

}



function deserializeMemoryData(
  serialized
){

  try{

    if(
      typeof serialized !==
      "string"
    ){

      return null;

    }

    return JSON.parse(
      serialized
    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    return null;

  }

}



// =====================================
// IMMUTABLE HELPERS
// =====================================

function freezeStorageObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet ||

    value instanceof Date ||

    value instanceof RegExp ||

    value instanceof Error ||

    value instanceof Promise

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeStorageObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// STORAGE PAYLOAD
// =====================================

function createMemoryStoragePayload(
  memories = []
){

  const safeMemories =

    Array.isArray(
      memories
    )

    ? memories

    : [];

  return freezeStorageObject({

    version:
    MEMORY_VERSION,

    exportedAt:
    Date.now(),

    memoryCount:
    safeMemories.length,

    memories:
    deepClone(
      safeMemories
    )

  });

}



// =====================================
// STORAGE VALIDATION
// =====================================

function validateStoragePayload(
  payload
){

  if(

    !payload ||

    typeof payload !==
    "object"

  ){

    return false;

  }

  if(
    !Array.isArray(
      payload.memories
    )
  ){

    return false;

  }

  if(
    typeof payload.version !==
    "string"
  ){

    return false;

  }

  if(

    payload.memoryCount !==
    payload.memories.length

  ){

    return false;

  }

  return true;

}



// =====================================
// REMOVE DUPLICATES
// =====================================

function removeDuplicateMemories(
  memories = []
){

  const uniqueIds =
  new Set();

  return memories.filter((memory) => {

    if(
      !memory ||
      !memory.id
    ){

      return false;

    }

    const normalizedId =
    normalizeMemoryString?.(
      memory.id
    );

    if(!normalizedId){

      return false;

    }

    if(
      uniqueIds.has(
        normalizedId
      )
    ){

      return false;

    }

    uniqueIds.add(
      normalizedId
    );

    return true;

  });

}



// =====================================
// FILTER VALID MEMORIES
// =====================================

function filterValidMemories(
  memories = []
){

  return memories.filter((memory) => {

    const validation =

      validateMemoryObject?.(
        memory,
        {
          strict:true
        }
      );

    if(
      validation?.valid !==
      true
    ){

      markMemoryCorrupted?.(
        memory?.id
      );

      return false;

    }

    return true;

  });

}



// =====================================
// STORAGE WRITE
// =====================================

function atomicStorageWrite(
  key,
  serialized
){

  try{

    const temporaryKey =
    `${key}_temp`;

    localStorage.setItem(
      temporaryKey,
      serialized
    );

    localStorage.setItem(
      key,
      serialized
    );

    localStorage.removeItem(
      temporaryKey
    );

    return true;

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    return false;

  }

}



// =====================================
// SAVE MEMORIES
// =====================================

async function saveMemories(
  memories = []
){

  if(
    !isMemoryStorageAvailable()
  ){

    return false;

  }

  if(
    memoryStorageLocked
  ){

    await waitForStorageUnlock();

  }

  const locked =
  lockMemoryStorage();

  if(!locked){

    return false;

  }

  const startedAt =
  getPerformanceNow();

  try{

    const clonedMemories =

      Array.isArray(
        memories
      )

      ? deepClone(
          memories
        )

      : [];

    const uniqueMemories =
    removeDuplicateMemories(
      clonedMemories
    );

    const validMemories =
    filterValidMemories(
      uniqueMemories
    );

    const estimatedSize =

      JSON.stringify(
        validMemories
      ).length;

    if(

      MEMORY_LIMITS?.MAX_STORAGE_SIZE

      &&

      estimatedSize >

      MEMORY_LIMITS
      .MAX_STORAGE_SIZE

    ){

      console.error(
        "MEMORY STORAGE LIMIT EXCEEDED"
      );

      return false;

    }

    const payload =
    createMemoryStoragePayload(
      validMemories
    );

    const serialized =
    serializeMemoryData(
      payload
    );

    if(!serialized){

      return false;

    }

    const backupSuccess =
    await backupMemoryStorage();

    if(
      !backupSuccess
      &&
      localStorage.getItem(
        MEMORY_STORAGE_KEYS
        .MEMORIES
      )
    ){

      return false;

    }

    const writeSuccess =
    atomicStorageWrite(

      MEMORY_STORAGE_KEYS
      .MEMORIES,

      serialized

    );

    if(!writeSuccess){

      return false;

    }

    if(
      memoryState?.metrics
    ){

      memoryState.metrics
      .lastSaveAt =
      Date.now();

      memoryState.metrics
      .saveDuration =
      Math.round(

        getPerformanceNow() -
        startedAt

      );

      memoryState.metrics
      .successfulOperations++;

    }

    updateMemoryMetrics?.();

    return true;

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    console.error(
      "SAVE MEMORIES ERROR:",
      error
    );

    return false;

  }

  finally{

    unlockMemoryStorage();

  }

}



// =====================================
// LOAD MEMORIES
// =====================================

async function loadAllMemories(){

  if(
    !isMemoryStorageAvailable()
  ){

    return [];

  }

  try{

    localStorage.removeItem(
      `${MEMORY_STORAGE_KEYS.MEMORIES}_temp`
    );

    const serialized =

      localStorage.getItem(

        MEMORY_STORAGE_KEYS
        .MEMORIES

      );

    if(!serialized){

      return [];

    }

    const payload =
    deserializeMemoryData(
      serialized
    );

    if(
      !validateStoragePayload(
        payload
      )
    ){

      markMemoryCorrupted?.(
        "storage_payload"
      );

      return [];

    }

    const memories =
    filterValidMemories(
      payload.memories
    );

    return freezeStorageObject(
      deepClone(
        memories
      )
    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    console.error(
      "LOAD MEMORIES ERROR:",
      error
    );

    return [];

  }

}



// =====================================
// LOAD MEMORY
// =====================================

async function loadMemory(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString?.(
    memoryId
  );

  if(!normalizedMemoryId){

    return null;

  }

  const memories =
  await loadAllMemories();

  return (

    memories.find((memory) => {

      return (
        memory.id ===
        normalizedMemoryId
      );

    })

    ||

    null

  );

}



// =====================================
// SAVE MEMORY
// =====================================

async function saveMemory(
  memory
){

  if(!memory){

    return false;

  }

  await waitForStorageUnlock();

  const memories = [

    ...await loadAllMemories()

  ];

  const existingIndex =

    memories.findIndex((item) => {

      return (
        item.id ===
        memory.id
      );

    });

  if(
    existingIndex >= 0
  ){

    memories[
      existingIndex
    ] = memory;

  }

  else{

    memories.push(
      memory
    );

  }

  return saveMemories(
    memories
  );

}



// =====================================
// UPDATE MEMORY
// =====================================

async function updateMemory(
  memoryId,
  updates = {}
){

  const memory =
  await loadMemory(
    memoryId
  );

  if(!memory){

    return false;

  }

  const safeUpdates =
  sanitizeMemoryInput?.(
    updates
  )

  ||

  updates;

  const updatedMemory =

    sanitizeMemoryObject?.({

      ...memory,

      ...safeUpdates,

      updatedAt:
      Date.now()

    })

    ||

    {

      ...memory,

      ...safeUpdates,

      updatedAt:
      Date.now()

    };

  return saveMemory(
    updatedMemory
  );

}



// =====================================
// DELETE MEMORY
// =====================================

async function deleteMemory(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString?.(
    memoryId
  );

  if(!normalizedMemoryId){

    return false;

  }

  const memories =
  await loadAllMemories();

  const filteredMemories =

    memories.filter((memory) => {

      return (
        memory.id !==
        normalizedMemoryId
      );

    });

  markMemoryDeleted?.(
    normalizedMemoryId
  );

  return saveMemories(
    filteredMemories
  );

}



// =====================================
// CLEAR STORAGE
// =====================================

async function clearMemoryStorage(){

  if(
    !isMemoryStorageAvailable()
  ){

    return false;

  }

  try{

    localStorage.removeItem(

      MEMORY_STORAGE_KEYS
      .MEMORIES

    );

    localStorage.removeItem(

      MEMORY_STORAGE_KEYS
      .BACKUP

    );

    resetMemoryState?.();

    return true;

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    console.error(
      "CLEAR MEMORY STORAGE ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// BACKUP STORAGE
// =====================================

async function backupMemoryStorage(){

  try{

    const currentData =

      localStorage.getItem(

        MEMORY_STORAGE_KEYS
        .MEMORIES

      );

    if(!currentData){

      return true;

    }

    const payload =
    deserializeMemoryData(
      currentData
    );

    if(
      !validateStoragePayload(
        payload
      )
    ){

      return false;

    }

    localStorage.setItem(

      MEMORY_STORAGE_KEYS
      .BACKUP,

      currentData

    );

    return true;

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    return false;

  }

}



// =====================================
// RESTORE STORAGE
// =====================================

async function restoreMemoryBackup(){

  try{

    const backupData =

      localStorage.getItem(

        MEMORY_STORAGE_KEYS
        .BACKUP

      );

    if(!backupData){

      return false;

    }

    return atomicStorageWrite(

      MEMORY_STORAGE_KEYS
      .MEMORIES,

      backupData

    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    return false;

  }

}



// =====================================
// EXPORT MEMORY DATA
// =====================================

async function exportMemoryData(){

  const memories =
  await loadAllMemories();

  const payload =
  createMemoryStoragePayload(
    memories
  );

  const serialized =
  serializeMemoryData(
    payload
  );

  if(!serialized){

    return null;

  }

  if(

    MEMORY_LIMITS?.MAX_EXPORT_SIZE

    &&

    serialized.length >

    MEMORY_LIMITS
    .MAX_EXPORT_SIZE

  ){

    console.error(
      "EXPORT SIZE LIMIT EXCEEDED"
    );

    return null;

  }

  return serialized;

}



// =====================================
// IMPORT MEMORY DATA
// =====================================

async function importMemoryData(
  importedData
){

  const payload =
  deserializeMemoryData(
    importedData
  );

  if(
    !validateStoragePayload(
      payload
    )
  ){

    return false;

  }

  return saveMemories(
    payload.memories
  );

}



// =====================================
// RECOVER STORAGE
// =====================================

async function recoverMemoryStorage(){

  const restored =
  await restoreMemoryBackup();

  if(
    restored
  ){

    return true;

  }

  await clearMemoryStorage();

  return false;

}



// =====================================
// PUBLIC API
// =====================================

const MemoryStorage =
Object.freeze({

  save:
  saveMemory,

  saveAll:
  saveMemories,

  load:
  loadMemory,

  loadAll:
  loadAllMemories,

  update:
  updateMemory,

  delete:
  deleteMemory,

  clear:
  clearMemoryStorage,

  backup:
  backupMemoryStorage,

  restore:
  restoreMemoryBackup,

  export:
  exportMemoryData,

  import:
  importMemoryData,

  recover:
  recoverMemoryStorage

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryStorage =
  MemoryStorage;

}
