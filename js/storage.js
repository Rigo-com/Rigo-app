// =====================================
// STORAGE AVAILABILITY CACHE
// =====================================

let storageAvailableCache =
null;



// =====================================
// STORAGE SIZE LIMIT
// =====================================

const MAX_STORAGE_SIZE =
5 * 1024 * 1024;



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
// STORAGE AVAILABILITY
// =====================================

function isStorageAvailable(){

  if(
    storageAvailableCache !==
    null
  ){

    return storageAvailableCache;

  }

  try{

    if(
      typeof localStorage ===
      "undefined"
    ){

      storageAvailableCache =
      false;

      return false;

    }

    const testKey =
    "__rigo_test__";

    localStorage.setItem(
      testKey,
      "test"
    );

    localStorage.removeItem(
      testKey
    );

    storageAvailableCache =
    true;

    return true;

  }

  catch(error){

    storageAvailableCache =
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
// SAFE STORAGE SERIALIZE
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

      MAX_STORAGE_SIZE

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
// SAVE CHATS
// =====================================

function saveChats(chats){

  if(
    !isStorageAvailable()
  ){

    return false;

  }

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
    );

    const limitedChats =
    validatedChats.slice(
      0,
      STORAGE_CONFIG.MAX_CHATS
    );

    const serialized =
    safeStorageSerialize(
      limitedChats
    );

    if(!serialized){

      return false;

    }

    localStorage.setItem(

      STORAGE_KEYS.CHATS,

      serialized

    );

    localStorage.setItem(

      STORAGE_KEYS.VERSION,

      STORAGE_CONFIG.VERSION

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
    !isStorageAvailable()
  ){

    return [];

  }

  try{

    migrateStorage();

    const data =
    localStorage.getItem(

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

      (chat) =>

      chat.id ===
      safeChat.id

    );

    if(
      existingIndex !== -1
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

function getChatById(chatId){

  if(!chatId){

    return null;

  }

  try{

    const chats =
    loadChats();

    const chat =
    chats.find(

      (item) =>

      item.id === chatId

    );

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

    const serialized =
    safeStorageSerialize(
      safeMemory
    );

    if(!serialized){

      return false;

    }

    localStorage.setItem(

      STORAGE_KEYS.MEMORY,

      serialized

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
    !isStorageAvailable()
  ){

    return {};

  }

  try{

    const data =
    localStorage.getItem(

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
// VALIDATE CHAT OBJECT
// =====================================

function validateChatObject(chat){

  if(
    !chat ||
    typeof chat !== "object" ||
    Array.isArray(chat)
  ){

    return false;

  }

  if(
    !chat.id ||
    typeof chat.id !== "string"
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

  const currentTime =
  Date.now();

  const maximumTimestamp =

    currentTime +

    1000 * 60 * 60 * 24;

  if(

    chat.createdAt < 0 ||

    chat.updatedAt < 0 ||

    chat.createdAt >
    maximumTimestamp ||

    chat.updatedAt >
    maximumTimestamp

  ){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE MEMORY OBJECT
// =====================================

function validateMemoryObject(memory){

  if(
    !memory ||
    typeof memory !== "object" ||
    Array.isArray(memory)
  ){

    return false;

  }

  const keys =
  Object.keys(memory);

  if(
    keys.length > 1000
  ){

    return false;

  }

  return true;

}
