// =====================================
// RIGO AI
// STORAGE SYSTEM
// =====================================



// =====================================
// VALID ROLES
// =====================================

const VALID_ROLES =
Object.freeze([

  "user",

  "assistant"

]);



// =====================================
// STORAGE CONFIG
// =====================================

const STORAGE_CONFIG =
Object.freeze({

  VERSION:"1.0.0",

  MAX_CHATS:100

});



// =====================================
// STORAGE KEYS
// =====================================

const STORAGE_KEYS =
Object.freeze({

  CHATS:"rigo_chats",

  MEMORY:"rigo_memory",

  SETTINGS:"rigo_settings",

  VERSION:"rigo_version"

});



// =====================================
// STORAGE AVAILABILITY
// =====================================

function isStorageAvailable(){

  try{

    const testKey =
    "__rigo_test__";

    localStorage.setItem(
      testKey,
      "test"
    );

    localStorage.removeItem(
      testKey
    );

    return true;

  }

  catch(error){

    console.error(
      "STORAGE NOT AVAILABLE",
      error
    );

    return false;

  }

}



// =====================================
// STORAGE MIGRATION
// =====================================

function migrateStorage(){

  try{

    const currentVersion =
    localStorage.getItem(

      STORAGE_KEYS.VERSION

    );

    if(
      currentVersion ===
      STORAGE_CONFIG.VERSION
    ){

      return true;

    }

    // FUTURE MIGRATIONS PLACE

    localStorage.setItem(

      STORAGE_KEYS.VERSION,

      STORAGE_CONFIG.VERSION

    );

    return true;

  }

  catch(error){

    handleStorageError(
      "MIGRATION ERROR",
      error
    );

    return false;

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

    localStorage.setItem(

      STORAGE_KEYS.CHATS,

      JSON.stringify(
        limitedChats
      )

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
    JSON.parse(data);

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

    currentChat.updatedAt =
    Date.now();

    const chats =
    loadChats();

    const safeChat =
    deepClone(
      currentChat
    );

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
// DELETE CHAT
// =====================================

function deleteChat(chatId){

  if(!chatId){

    return false;

  }

  try{

    const chats =
    loadChats();

    const filteredChats =
    chats.filter(

      (chat) =>

      chat.id !== chatId

    );

    return saveChats(
      filteredChats
    );

  }

  catch(error){

    handleStorageError(
      "DELETE CHAT ERROR",
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

    return deepClone(chat);

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

    localStorage.setItem(

      STORAGE_KEYS.MEMORY,

      JSON.stringify(memory)

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
    JSON.parse(data);

    if(
      !validateMemoryObject(
        parsedData
      )
    ){

      return {};

    }

    return parsedData;

  }

  catch(error){

    handleStorageError(
      "LOAD MEMORY ERROR",
      error
    );

    return {};

  }

}



// =====================================
// CLEAR STORAGE
// =====================================

function clearStorage(){

  if(
    !isStorageAvailable()
  ){

    return false;

  }

  try{

    localStorage.removeItem(
      STORAGE_KEYS.CHATS
    );

    localStorage.removeItem(
      STORAGE_KEYS.MEMORY
    );

    localStorage.removeItem(
      STORAGE_KEYS.SETTINGS
    );

    localStorage.removeItem(
      STORAGE_KEYS.VERSION
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "CLEAR STORAGE ERROR",
      error
    );

    return false;

  }

}



// =====================================
// CLEAR CORRUPTED CHATS
// =====================================

function clearCorruptedChats(){

  try{

    localStorage.removeItem(
      STORAGE_KEYS.CHATS
    );

  }

  catch(error){

    handleStorageError(
      "CLEAR CORRUPTED CHATS ERROR",
      error
    );

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
    typeof chat.createdAt !==
    "number"
  ){

    return false;

  }

  if(
    typeof chat.updatedAt !==
    "number"
  ){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE MESSAGE OBJECT
// =====================================

function validateMessageObject(message){

  if(
    !message ||
    typeof message !== "object" ||
    Array.isArray(message)
  ){

    return false;

  }

  if(
    typeof message.id !==
    "string"
  ){

    return false;

  }

  if(
    typeof message.role !==
    "string"
  ){

    return false;

  }

  if(
    !VALID_ROLES.includes(
      message.role
    )
  ){

    return false;

  }

  if(
    typeof message.content !==
    "string"
  ){

    return false;

  }

  if(
    !message.content.trim()
  ){

    return false;

  }

  if(
    typeof message.timestamp !==
    "number"
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

  return true;

}



// =====================================
// DEDUPLICATE CHATS
// =====================================

function deduplicateChats(chats){

  const seen =
  new Set();

  return chats.filter(
    (chat) => {

      if(
        !chat ||
        !chat.id
      ){

        return false;

      }

      if(
        seen.has(chat.id)
      ){

        return false;

      }

      seen.add(chat.id);

      return true;

    }
  );

}



// =====================================
// DEEP CLONE
// =====================================

function deepClone(data){

  try{

    return structuredClone(
      data
    );

  }

  catch(error){

    return JSON.parse(
      JSON.stringify(data)
    );

  }

}



// =====================================
// STORAGE ERROR HANDLER
// =====================================

function handleStorageError(
  label,
  error
){

  if(
    error &&
    error.name ===
    "QuotaExceededError"
  ){

    console.error(

      label,

      "Storage limit exceeded"

    );

    return;

  }

  console.error(
    label,
    error
  );

}
