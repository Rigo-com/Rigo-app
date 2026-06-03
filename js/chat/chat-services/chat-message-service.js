// =====================================
// RIGO AI
// CHAT MESSAGE SERVICE
// =====================================

import {

  addMessage,

  updateMessageRecord,

  removeMessage,

  getMessage as getStoredMessage,

  getMessages as getStoredMessages,

  hasMessage,

  getMessageCount,

  incrementCreated,

  incrementUpdated,

  incrementDeleted,

  getChatMessageSnapshot,

  resetChatMessageState

}
from "../chat-state/chat-message-state.js";

import {
  emit
}
from "../chat-events/chat-events.js";

import {
  CHAT_EVENTS
}
from "../chat-config.js";



// =====================================
// SERVICE STATE
// =====================================

const serviceState =
Object.seal({

  initialized:false

});



let messageCounter = 0;



// =====================================
// HELPERS
// =====================================

function createMessageId(){

  messageCounter++;

  return (
    "msg_" +
    Date.now() +
    "_" +
    messageCounter
  );

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    serviceState.initialized
  ){
    return true;
  }

  serviceState.initialized =
  true;

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  reset();

  serviceState.initialized =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  messageCounter = 0;

  resetChatMessageState();

  return true;

}



// =====================================
// CREATE MESSAGE
// =====================================

function createMessage(
  payload = {}
){

  const message = {

    id:
    createMessageId(),

    role:
    String(
      payload.role ||
      "assistant"
    ),

    content:
    String(
      payload.content ||
      ""
    ),

    metadata:
    payload.metadata ||
    {},

    createdAt:
    Date.now(),

    updatedAt:
    Date.now()

  };

  addMessage(
    message
  );

  incrementCreated();

  emit(
    CHAT_EVENTS
    .MESSAGE_CREATED,
    structuredClone(
      message
    )
  );

  return structuredClone(
    message
  );

}



// =====================================
// UPDATE MESSAGE
// =====================================

function updateMessage(
  messageId,
  updates = {}
){

  if(
    !hasMessage(
      messageId
    )
  ){
    return null;
  }

  updateMessageRecord(

    messageId,

    {

      ...updates,

      updatedAt:
      Date.now()

    }

  );

  const message =
  getStoredMessage(
    messageId
  );

  incrementUpdated();

  emit(
    CHAT_EVENTS
    .MESSAGE_UPDATED,
    structuredClone(
      message
    )
  );

  return structuredClone(
    message
  );

}



// =====================================
// DELETE MESSAGE
// =====================================

function deleteMessage(
  messageId
){

  const message =
  getStoredMessage(
    messageId
  );

  if(
    !message
  ){
    return false;
  }

  removeMessage(
    messageId
  );

  incrementDeleted();

  emit(
    CHAT_EVENTS
    .MESSAGE_DELETED,
    structuredClone(
      message
    )
  );

  return true;

}



// =====================================
// GET MESSAGE
// =====================================

function getMessage(
  messageId
){

  const message =
  getStoredMessage(
    messageId
  );

  if(
    !message
  ){
    return null;
  }

  return structuredClone(
    message
  );

}



// =====================================
// GET ALL MESSAGES
// =====================================

function getMessages(){

  return getStoredMessages()
  .map(

    message =>

    structuredClone(
      message
    )

  );

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    messages:
    getMessageCount()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return getChatMessageSnapshot();

}



// =====================================
// PUBLIC API
// =====================================

const ChatMessageService =
Object.freeze({

  initialize,

  destroy,

  reset,

  status:
  getStatus,

  snapshot:
  getSnapshot,

  create:
  createMessage,

  update:
  updateMessage,

  delete:
  deleteMessage,

  get:
  getMessage,

  getAll:
  getMessages

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  reset,

  createMessage,

  updateMessage,

  deleteMessage,

  getMessage,

  getMessages,

  getStatus,

  getSnapshot,

  ChatMessageService

};

export default
ChatMessageService;
