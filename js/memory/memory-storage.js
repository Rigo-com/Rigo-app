// =====================================
// RIGO AI
// MEMORY STORAGE
// ENTERPRISE INFINITY FINAL
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

    return null;

  }

}



function deserializeMemoryData(
  serialized
){

  try{

    return JSON.parse(
      serialized
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// STORAGE SNAPSHOT
// =====================================

function createStorageSnapshot(
  memories = []
){

  return {

    snapshotId:
    createMemoryId(),

    createdAt:
    Date.now(),

    memoryCount:
    memories.length,

    memories:
    deepClone(memories)

  };

}



// =====================================
// STORAGE PAYLOAD
// =====================================

function createMemoryStoragePayload(
  memories = []
){

  return {

    version:
    MEMORY_VERSION,

    exportedAt:
    Date.now(),

    memoryCount:
    memories.length,

    memories:
    deepClone(memories)

  };

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
    payload.version !==
    MEMORY_VERSION
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
// STORAGE QUOTA
// =====================================

function isQuotaExceededError(
  error
){

  if(!error){

    return false;

  }

  return (

    error.name ===
    "QuotaExceededError"

    ||

    error.name ===
    "NS_ERROR_DOM_QUOTA_REACHED"

  );

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

    if(
      uniqueIds.has(
        memory.id
      )
    ){

      return false;

    }

    uniqueIds.add(
      memory.id
    );

    return true;

  });

}



// =====================================
// SAVE ALL MEMORIES
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

    return false;

  }

  const locked =
  lockMemoryStorage();

  if(!locked){

    return false;

  }

  const startedAt =
  performance.now();

  try{

    const sanitizedMemories =

      Array.isArray(
        memories
      )

      ? deepClone(memories)

      : [];

    const uniqueMemories =
    removeDuplicateMemories(
      sanitizedMemories
    );

    const validMemories =

      uniqueMemories
      .filter((memory) => {

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

          markMemoryCorrupted(
            memory?.id ||
            createMemoryId()
          );

        }

        return validation.valid;

      });

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

    localStorage.setItem(

      MEMORY_STORAGE_KEYS
      .MEMORIES,

      serialized

    );

    memoryState.metrics
    .lastSaveAt =
    Date.now();

    memoryState.metrics
    .saveDuration =
    Math.round(

      performance.now() -
      startedAt

    );

    memoryState.metrics
    .averageSaveDuration =

      Math.round(

        (
          memoryState.metrics
          .averageSaveDuration +

          memoryState.metrics
          .saveDuration

        ) / 2

      );

    memoryState.metrics
    .successfulOperations++;

    updateMemoryMetrics();

    return true;

  }

  catch(error){

    memoryState.metrics
    .failedOperations++;

    memoryState.metrics
    .lastErrorAt =
    Date.now();

    if(
      isQuotaExceededError(
        error
      )
    ){

      console.error(
        "MEMORY STORAGE QUOTA EXCEEDED"
      );

    }

    else{

      console.error(
        "SAVE MEMORIES ERROR:",
        error
      );

    }

    return false;

  }

  finally{

    unlockMemoryStorage();

  }

}



// =====================================
// SAVE SINGLE MEMORY
// =====================================

async function saveMemory(
  memory
){

  if(!memory){

    return false;

  }

  if(
    memoryStorageLocked
  ){

    return false;
  }

  const latestMemories =
  await loadAllMemories();

  const memories = [

    ...latestMemories

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
// LOAD ALL MEMORIES
// =====================================

async function loadAllMemories(){

  if(
    !isMemoryStorageAvailable()
  ){

    return [];
  }

  const startedAt =
  performance.now();

  try{

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

    const validPayload =
    validateStoragePayload(
      payload
    );

    if(!validPayload){

      markMemoryCorrupted(
        "storage_payload"
      );

      return [];
    }

    const memories =

      payload.memories
      .filter((memory) => {

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

          markMemoryCorrupted(
            memory?.id ||
            createMemoryId()
          );

        }

        return validation.valid;

      });

    memoryState.metrics
    .lastLoadAt =
    Date.now();

    memoryState.metrics
    .loadDuration =
    Math.round(

      performance.now() -
      startedAt

    );

    memoryState.metrics
    .averageLoadDuration =

      Math.round(

        (
          memoryState.metrics
          .averageLoadDuration +

          memoryState.metrics
          .loadDuration

        ) / 2

      );

    memoryState.metrics
    .successfulOperations++;

    return deepClone(
      memories
    );

  }

  catch(error){

    memoryState.metrics
    .failedOperations++;

    memoryState.metrics
    .lastErrorAt =
    Date.now();

    console.error(
      "LOAD MEMORIES ERROR:",
      error
    );

    return [];

  }

}



// =====================================
// LOAD SINGLE MEMORY
// =====================================

async function loadMemory(
  memoryId
){

  const normalizedMemoryId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedMemoryId){

    return null;

  }

  const memories =
  await loadAllMemories();

  const memory =

    memories.find((memory) => {

      return (
        memory.id ===
        normalizedMemoryId
      );

    })

    ||

    null;

  return memory
    ? deepClone(memory)
    : null;

}



// =====================================
// UPDATE MEMORY
// =====================================

async function updateMemory(
  memoryId,
  updates = {}
){

  if(
    memoryStorageLocked
  ){

    return false;
  }

  const memory =
  await loadMemory(
    memoryId
  );

  if(!memory){

    return false;

  }

  const safeUpdates =
  sanitizeMemoryInput(
    updates
  );

  const updatedMemory =
  sanitizeMemoryObject({

    ...memory,

    ...safeUpdates,

    updatedAt:
    Date.now()

  });

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

  if(
    memoryStorageLocked
  ){

    return false;
  }

  const normalizedMemoryId =
  normalizeMemoryString(
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

  markMemoryDeleted(
    normalizedMemoryId
  );

  memoryState.stats
  .deletions++;

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

    resetMemoryState();

    return true;

  }

  catch(error){

    console.error(
      "CLEAR STORAGE ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// BACKUP STORAGE
// =====================================

async function backupMemoryStorage(){

  if(
    !isMemoryStorageAvailable()
  ){

    return false;

  }

  try{

    const serialized =

      localStorage.getItem(

        MEMORY_STORAGE_KEYS
        .MEMORIES

      );

    if(!serialized){

      return false;

    }

    localStorage.setItem(

      MEMORY_STORAGE_KEYS
      .BACKUP,

      serialized

    );

    return true;

  }

  catch(error){

    console.error(
      "BACKUP STORAGE ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// RESTORE BACKUP
// =====================================

async function restoreMemoryBackup(){

  if(
    !isMemoryStorageAvailable()
  ){

    return false;

  }

  try{

    const backup =

      localStorage.getItem(

        MEMORY_STORAGE_KEYS
        .BACKUP

      );

    if(!backup){

      return false;

    }

    const payload =
    deserializeMemoryData(
      backup
    );

    if(
      !validateStoragePayload(
        payload
      )
    ){

      console.error(
        "INVALID MEMORY BACKUP"
      );

      return false;

    }

    localStorage.setItem(

      MEMORY_STORAGE_KEYS
      .MEMORIES,

      backup

    );

    clearSearchCache();

    updateMemoryMetrics();

    return true;

  }

  catch(error){

    console.error(
      "RESTORE BACKUP ERROR:",
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
// VALIDATE IMPORT DATA
// =====================================

function validateImportData(
  importedData
){

  if(
    typeof importedData !==
    "string"
  ){

    return false;

  }

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

  if(

    payload.memories.length >

    MEMORY_LIMITS
    .MAX_IMPORT_ITEMS

  ){

    return false;

  }

  return payload.memories
  .every((memory) => {

    const validation =

      validateMemoryObject(
        memory,
        {
          strict:true
        }
      );

    return validation.valid;

  });

}



// =====================================
// IMPORT MEMORY DATA
// =====================================

async function importMemoryData(
  importedData,
  options = {}
){

  const validImport =
  validateImportData(
    importedData
  );

  if(!validImport){

    return false;

  }

  const payload =
  deserializeMemoryData(
    importedData
  );

  if(
    !payload
  ){

    return false;

  }

  const mergeMode =
  options.merge !== false;

  if(!mergeMode){

    return saveMemories(
      payload.memories
    );

  }

  const existingMemories =
  await loadAllMemories();

  const mergedMemories =

    removeDuplicateMemories([

      ...existingMemories,

      ...payload.memories

    ]);

  return saveMemories(
    mergedMemories
  );

}



// =====================================
// EMERGENCY RECOVERY
// =====================================

async function recoverMemoryStorage(){

  const restored =
  await restoreMemoryBackup();

  if(
    restored
  ){

    memoryState.health
    .recoveryCount++;

    memoryState.health
    .lastRecoveryAt =
    Date.now();

    return true;

  }

  await clearMemoryStorage();

  return false;

}
