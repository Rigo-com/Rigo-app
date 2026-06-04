// =====================================
// RIGO AI
// STORAGE CHAT
// CHAT STORAGE LAYER
// =====================================

import {

  getMemoryItem,

  setMemoryItem,

  removeMemoryItem,

  getMemoryEntries

}
from "./storage-memory.js";

import {
  STORAGE_KEYS
}
from "./storage-config.js";

import {
  deepClone
}
from "./storage-utils.js";



// =====================================
// CHAT ROOT
// =====================================

function getChats(){

  return (

    getMemoryItem(

      STORAGE_KEYS
      .CHATS

    )

    ??

    []

  );

}



function saveChats(
  chats
){

  return setMemoryItem(

    STORAGE_KEYS
    .CHATS,

    chats

  );

}



// =====================================
// CREATE
// =====================================

function addChat(
  chat
){

  const chats =
  getChats();

  chats.push(

    deepClone(
      chat
    )

  );

  saveChats(
    chats
  );

  return true;

}



// =====================================
// READ
// =====================================

function getChat(
  chatId
){

  const chats =
  getChats();

  return (

    chats.find(

      chat =>

      chat?.id ===
      chatId

    )

    ??

    null

  );

}



// =====================================
// UPDATE
// =====================================

function updateChat(

  chatId,

  updates = {}

){

  const chats =
  getChats();

  const index =

    chats.findIndex(

      chat =>

      chat?.id ===
      chatId

    );

  if(
    index < 0
  ){
    return false;
  }

  chats[index] = {

    ...chats[index],

    ...deepClone(
      updates
    )

  };

  saveChats(
    chats
  );

  return true;

}



// =====================================
// DELETE
// =====================================

function removeChat(
  chatId
){

  const chats =
  getChats();

  const filtered =

    chats.filter(

      chat =>

      chat?.id !==
      chatId

    );

  saveChats(
    filtered
  );

  return true;

}



// =====================================
// EXISTS
// =====================================

function hasChat(
  chatId
){

  return Boolean(

    getChat(
      chatId
    )

  );

}



// =====================================
// CLEAR
// =====================================

function clearChats(){

  return removeMemoryItem(

    STORAGE_KEYS
    .CHATS

  );

}



// =====================================
// COUNT
// =====================================

function getChatCount(){

  return getChats()
  .length;

}



// =====================================
// LIST
// =====================================

function getAllChats(){

  return deepClone(
    getChats()
  );

}



// =====================================
// STATS
// =====================================

function getChatStats(){

  return Object.freeze({

    chats:
    getChatCount()

  });

}



// =====================================
// PUBLIC API
// =====================================

const StorageChat =
Object.freeze({

  addChat,

  getChat,

  updateChat,

  removeChat,

  hasChat,

  clearChats,

  getChatCount,

  getAllChats,

  getChatStats

});



// =====================================
// EXPORTS
// =====================================

export {

  addChat,

  getChat,

  updateChat,

  removeChat,

  hasChat,

  clearChats,

  getChatCount,

  getAllChats,

  getChatStats,

  StorageChat

};

export default
StorageChat;
