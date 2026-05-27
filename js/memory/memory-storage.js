// =====================================
// RIGO AI
// MEMORY STORAGE
// OPTIMIZED FINAL
// =====================================



// =====================================
// STORAGE LOCK
// =====================================

let memoryStorageLocked =
false;



// =====================================
// HELPERS
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



function getStorageNow(){

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
// PAYLOAD
// =====================================

function createMemoryStoragePayload(
  memories = []
){

  return {

    version:
    MEMORY_VERSION,

    exportedAt:
    Date.now(),

    memories:

      Array.isArray(
        memories
      )

      ? memories

      : []

  };

}



// =====================================
// VALIDATION
// =====================================

function validateStoragePayload(
  payload
){

  return Boolean(

    payload &&

    typeof payload ===
    "object"

    &&

    Array.isArray(
      payload.memories
    )

    &&

    typeof payload.version ===
    "string"

  );

}



// =====================================
// MEMORY FILTERING
// =====================================

function filterValidMemories(
  memories = []
){

  const uniqueIds =
  new Set();

  return memories.filter((memory) => {

    if(
      !memory?.id
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
        normalizedId
      );

      return false;

    }

    uniqueIds.add(
      normalizedId
    );

    return true;

  });

}



// =====================================
// STORAGE WRITE
// =====================================

function writeStorage(
  key,
  value
){

  try{

    localStorage.setItem(
      key,
      value
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
// SAVE ALL
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
  getStorageNow();

  try{

    const validMemories =
    filterValidMemories(
      Array.isArray(memories)
      ? memories
      : []
    );

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

    const saved =
    writeStorage(

      MEMORY_STORAGE_KEYS
      .MEMORIES,

      serialized

    );

    if(!saved){

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

        getStorageNow() -
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

    return false;

  }

  finally{

    unlockMemoryStorage();

  }

}



// =====================================
// LOAD ALL
// =====================================

async function loadAllMemories(){

  if(
    !isMemoryStorageAvailable()
  ){

    return [];

  }

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

    if(
      !validateStoragePayload(
        payload
      )
    ){

      return [];

    }

    return filterValidMemories(
      payload.memories
    );

  }

  catch(error){

    registerMemoryRuntimeError?.(
      error
    );

    return [];

  }

}



// =====================================
// LOAD
// =====================================

async function loadMemory(
  memoryId
){

  const normalizedId =
  normalizeMemoryString?.(
    memoryId
  );

  if(!normalizedId){

    return null;

  }

  const memories =
  await loadAllMemories();

  return (

    memories.find((memory) => {

      return (
        memory.id ===
        normalizedId
      );

    })

    ||

    null

  );

}



// =====================================
// SAVE
// =====================================

async function saveMemory(
  memory
){

  if(
    !memory?.id
  ){

    return false;

  }

  const memories =
  await loadAllMemories();

  const index =

    memories.findIndex((item) => {

      return (
        item.id ===
        memory.id
      );

    });

  if(
    index >= 0
  ){

    memories[index] =
    memory;

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
// UPDATE
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

  const updatedMemory = {

    ...memory,

    ...sanitizeMemoryInput?.(
      updates
    ),

    updatedAt:
    Date.now()

  };

  return saveMemory(
    updatedMemory
  );

}



// =====================================
// DELETE
// =====================================

async function deleteMemory(
  memoryId
){

  const normalizedId =
  normalizeMemoryString?.(
    memoryId
  );

  if(!normalizedId){

    return false;

  }

  const memories =
  await loadAllMemories();

  const filtered =

    memories.filter((memory) => {

      return (
        memory.id !==
        normalizedId
      );

    });

  markMemoryDeleted?.(
    normalizedId
  );

  return saveMemories(
    filtered
  );

}



// =====================================
// CLEAR
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

    resetMemoryState?.();

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
// EXPORT
// =====================================

async function exportMemoryData(){

  const memories =
  await loadAllMemories();

  return serializeMemoryData(

    createMemoryStoragePayload(
      memories
    )

  );

}



// =====================================
// IMPORT
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

  export:
  exportMemoryData,

  import:
  importMemoryData

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



// =====================================
// MODULE EXPORT
// =====================================

export default MemoryStorage;

export {

  saveMemory,

  saveMemories,

  loadMemory,

  loadAllMemories,

  updateMemory,

  deleteMemory,

  clearMemoryStorage,

  exportMemoryData,

  importMemoryData

};
