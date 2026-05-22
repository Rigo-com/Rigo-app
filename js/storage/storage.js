// =====================================
// RIGO AI
// STORAGE RUNTIME
// ENTERPRISE FINAL
// =====================================



// =====================================
// STORAGE CONFIG
// =====================================

const STORAGE_RUNTIME_CONFIG =
Object.freeze({

  MAX_STORAGE_SIZE:
  5 * 1024 * 1024,

  WRITE_DEBOUNCE_MS:
  120,

  MAX_CACHE_CHATS:
  200

});



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



// =====================================
// STORAGE KEYS
// =====================================

const STORAGE_KEYS =
Object.freeze({

  CHATS:
  APP_CONFIG
  ?.STORAGE
  ?.CHAT_KEY ||

  "rigo-ai:v1:chat-data",

  MEMORY:
  APP_CONFIG
  ?.STORAGE
  ?.APP_KEY ||

  "rigo-ai:v1:memory",

  SETTINGS:
  APP_CONFIG
  ?.STORAGE
  ?.SETTINGS_KEY ||

  "rigo-ai:v1:settings",

  VERSION:
  "rigo-ai:v1:version"

});



// =====================================
// STORAGE ENGINE
// =====================================

const storageEngine =
Object.freeze({

  get(key){

    try{

      return localStorage.getItem(
        key
      );

    }

    catch(error){

      handleStorageError(
        "STORAGE GET ERROR",
        error
      );

      return null;

    }

  },

  set(key,value){

    try{

      localStorage.setItem(
        key,
        value
      );

      return true;

    }

    catch(error){

      handleStorageError(
        "STORAGE SET ERROR",
        error
      );

      return false;

    }

  },

  remove(key){

    try{

      localStorage.removeItem(
        key
      );

      return true;

    }

    catch(error){

      handleStorageError(
        "STORAGE REMOVE ERROR",
        error
      );

      return false;

    }

  }

});



// =====================================
// STORAGE AVAILABILITY
// =====================================

function isStorageAvailable(){

  if(
    storageState.available !==
    null
  ){

    return storageState
    .available;

  }

  try{

    if(
      typeof localStorage ===
      "undefined"
    ){

      storageState.available =
      false;

      return false;

    }

    const testKey =
    "__rigo_storage_test__";

    localStorage.setItem(
      testKey,
      "1"
    );

    localStorage.removeItem(
      testKey
    );

    storageState.available =
    true;

    return true;

  }

  catch(error){

    storageState.available =
    false;

    safeLogError(

      "STORAGE NOT AVAILABLE",

      error

    );

    return false;

  }

}



// =====================================
// SAFE JSON PARSE
// =====================================

function safeJSONParse(
  value,
  fallback = null
){

  try{

    return JSON.parse(
      value
    );

  }

  catch(error){

    return fallback;

  }

}



// =====================================
// SAFE SERIALIZE
// =====================================

function safeStorageSerialize(
  value
){

  try{

    const serialized =
    JSON.stringify(
      value
    );

    if(
      typeof serialized !==
      "string"
    ){

      return null;

    }

    if(

      serialized.length >

      STORAGE_RUNTIME_CONFIG
      .MAX_STORAGE_SIZE

    ){

      return null;

    }

    return serialized;

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE DEEP CLONE
// =====================================

function deepClone(data){

  try{

    return structuredClone(
      data
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(data)
      );

    }

    catch(cloneError){

      return null;

    }

  }

}



// =====================================
// INITIALIZE STORAGE
// =====================================

function initializeStorageRuntime(){

  if(
    storageState.initialized
  ){

    return true;

  }

  const available =
  isStorageAvailable();

  if(!available){

    return false;

  }

  hydrateStorageCache();

  storageState.initialized =
  true;

  storageState.hydrated =
  true;

  storageState.lastSyncAt =
  Date.now();

  return true;

}



// =====================================
// DESTROY STORAGE
// =====================================

function destroyStorageRuntime(){

  clearTimeout(
    storageState.writeTimer
  );

  storageState.writeQueue =
  [];

  storageState.destroyed =
  true;

  storageState.initialized =
  false;

  storageState.hydrated =
  false;

  storageState.cache.chats =
  [];

  storageState.cache.memory =
  {};

  return true;

}



// =====================================
// HYDRATE CACHE
// =====================================

function hydrateStorageCache(){

  storageState.cache.chats =
  loadChatsFromStorage();

  storageState.cache.memory =
  loadMemoryFromStorage();

  return true;

}



// =====================================
// STORAGE WRITE QUEUE
// =====================================

function enqueueStorageWrite(
  callback
){

  storageState.writeQueue
  .push(callback);

  processStorageQueue();

  return true;

}



// =====================================
// PROCESS STORAGE QUEUE
// =====================================

function processStorageQueue(){

  if(
    storageState.writing
  ){

    return;
  }

  clearTimeout(
    storageState.writeTimer
  );

  storageState.writeTimer =
  setTimeout(async () => {

    storageState.writing =
    true;

    try{

      while(

        storageState
        .writeQueue
        .length > 0

      ){

        const callback =

          storageState
          .writeQueue
          .shift();

        await Promise.resolve(
          callback()
        );

      }

      storageState.lastSyncAt =
      Date.now();

    }

    finally{

      storageState.writing =
      false;

    }

  },

  STORAGE_RUNTIME_CONFIG
  .WRITE_DEBOUNCE_MS);

}



// =====================================
// SAVE CHATS
// =====================================

function saveChats(chats){

  if(
    !Array.isArray(chats)
  ){

    return false;

  }

  try{

    const uniqueChats =
    deduplicateChats(
      chats
    );

    const validatedChats =
    uniqueChats

    .filter(
      validateChatObject
    )

    .sort(
      (a,b) =>

      b.updatedAt -
      a.updatedAt

    )

    .slice(

      0,

      STORAGE_RUNTIME_CONFIG
      .MAX_CACHE_CHATS

    );

    storageState.cache.chats =
    deepClone(
      validatedChats
    ) || [];

    enqueueStorageWrite(
      () => {

        const serialized =
        safeStorageSerialize(
          validatedChats
        );

        if(!serialized){

          return false;

        }

        storageEngine.set(

          STORAGE_KEYS.CHATS,

          serialized

        );

        storageEngine.set(

          STORAGE_KEYS.VERSION,

          STORAGE_CONFIG
          .VERSION

        );

        return true;

      }
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "SAVE CHATS ERROR",
      error
    );

    return false;

  }

}



// =====================================
// LOAD CHATS
// =====================================

function loadChats(){

  if(

    storageState.cache.chats
    .length > 0

  ){

    return deepClone(

      storageState
      .cache
      .chats

    ) || [];

  }

  const chats =
  loadChatsFromStorage();

  storageState.cache.chats =
  deepClone(chats) || [];

  return chats;

}



// =====================================
// LOAD CHATS STORAGE
// =====================================

function loadChatsFromStorage(){

  if(
    !isStorageAvailable()
  ){

    return [];

  }

  try{

    migrateStorage();

    const data =
    storageEngine.get(

      STORAGE_KEYS.CHATS

    );

    if(!data){

      return [];

    }

    const parsedData =
    safeJSONParse(
      data,
      []
    );

    if(
      !Array.isArray(parsedData)
    ){

      clearCorruptedChats();

      return [];

    }

    return parsedData

    .filter(
      validateChatObject
    )

    .sort(
      (a,b) =>

      b.updatedAt -
      a.updatedAt

    );

  }

  catch(error){

    clearCorruptedChats();

    handleStorageError(
      "LOAD CHATS ERROR",
      error
    );

    return [];

  }

}



// =====================================
// SAVE CURRENT CHAT
// =====================================

function saveCurrentChat(){

  try{

    if(
      !validateChatObject(
        currentChat
      )
    ){

      return false;

    }

    const safeChat =
    deepClone(
      currentChat
    );

    if(!safeChat){

      return false;

    }

    safeChat.updatedAt =
    Date.now();

    const chats =
    loadChats();

    const existingIndex =
    chats.findIndex(
      (chat) => {

        return (
          chat.id ===
          safeChat.id
        );

      }
    );

    if(
      existingIndex >= 0
    ){

      chats[
        existingIndex
      ] = safeChat;

    }

    else{

      chats.unshift(
        safeChat
      );

    }

    return saveChats(
      chats
    );

  }

  catch(error){

    handleStorageError(
      "SAVE CURRENT CHAT ERROR",
      error
    );

    return false;

  }

}



// =====================================
// GET CHAT
// =====================================

function getChatById(
  chatId
){

  if(
    typeof chatId !==
    "string"
  ){

    return null;

  }

  try{

    const chats =
    loadChats();

    const chat =
    chats.find((item) => {

      return (
        item.id ===
        chatId
      );

    });

    if(
      !validateChatObject(
        chat
      )
    ){

      return null;

    }

    return deepClone(
      chat
    );

  }

  catch(error){

    handleStorageError(
      "GET CHAT ERROR",
      error
    );

    return null;

  }

}



// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(memory){

  if(
    !validateMemoryObject(
      memory
    )
  ){

    return false;

  }

  try{

    const safeMemory =
    deepClone(memory);

    if(!safeMemory){

      return false;

    }

    storageState.cache.memory =
    safeMemory;

    enqueueStorageWrite(
      () => {

        const serialized =
        safeStorageSerialize(
          safeMemory
        );

        if(!serialized){

          return false;

        }

        return storageEngine.set(

          STORAGE_KEYS.MEMORY,

          serialized

        );

      }
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "SAVE MEMORY ERROR",
      error
    );

    return false;

  }

}



// =====================================
// LOAD MEMORY
// =====================================

function loadMemory(){

  if(

    Object.keys(

      storageState
      .cache
      .memory

    ).length > 0

  ){

    return deepClone(

      storageState
      .cache
      .memory

    ) || {};

  }

  const memory =
  loadMemoryFromStorage();

  storageState.cache.memory =
  deepClone(memory) || {};

  return memory;

}



// =====================================
// LOAD MEMORY STORAGE
// =====================================

function loadMemoryFromStorage(){

  if(
    !isStorageAvailable()
  ){

    return {};

  }

  try{

    const data =
    storageEngine.get(

      STORAGE_KEYS.MEMORY

    );

    if(!data){

      return {};

    }

    const parsedData =
    safeJSONParse(
      data,
      {}
    );

    if(
      !validateMemoryObject(
        parsedData
      )
    ){

      clearCorruptedMemory();

      return {};

    }

    return parsedData;

  }

  catch(error){

    clearCorruptedMemory();

    handleStorageError(
      "LOAD MEMORY ERROR",
      error
    );

    return {};

  }

}



// =====================================
// VALIDATE CHAT
// =====================================

function validateChatObject(chat){

  if(
    !chat ||
    typeof chat !==
    "object" ||
    Array.isArray(chat)
  ){

    return false;

  }

  if(
    typeof chat.id !==
    "string"
  ){

    return false;

  }

  if(
    typeof chat.title !==
    "string"
  ){

    return false;

  }

  if(
    !Array.isArray(
      chat.messages
    )
  ){

    return false;

  }

  if(
    !chat.messages.every(
      validateMessageObject
    )
  ){

    return false;

  }

  if(
    !Number.isFinite(
      chat.createdAt
    )
  ){

    return false;

  }

  if(
    !Number.isFinite(
      chat.updatedAt
    )
  ){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE MEMORY
// =====================================

function validateMemoryObject(memory){

  if(
    !memory ||
    typeof memory !==
    "object" ||
    Array.isArray(memory)
  ){

    return false;

  }

  return (
    Object.keys(memory)
    .length <= 1000
  );

}
