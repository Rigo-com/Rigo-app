// =====================================
// RIGO AI
// CHAT MESSAGE SERVICE
// =====================================

import {
  getChatMessageState,
  getChatMessageSnapshot,
  updateChatMessageState,
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



function getMessagesMap(){

  return getChatMessageState()
  .messages;

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

  const state =
  getChatMessageState();

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

  state.messages.set(
    message.id,
    message
  );

  state.messageOrder.push(
    message.id
  );

  updateChatMessageState({

    activeMessageId:
    message.id,

    lastMessageId:
    message.id

  });

  state.diagnostics
  .created++;

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

  const state =
  getChatMessageState();

  const message =
  state.messages.get(
    messageId
  );

  if(
    !message
  ){
    return null;
  }

  Object.assign(
    message,
    updates
  );

  message.updatedAt =
  Date.now();

  state.diagnostics
  .updated++;

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

  const state =
  getChatMessageState();

  const message =
  state.messages.get(
    messageId
  );

  if(
    !message
  ){
    return false;
  }

  state.messages.delete(
    messageId
  );

  state.messageOrder =

    state.messageOrder
    .filter(
      id =>
      id !== messageId
    );

  state.diagnostics
  .deleted++;

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

    getMessagesMap()
    .get(messageId);

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

  return Array.from(
    getMessagesMap()
    .values()
  ).map(
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

  const state =
  getChatMessageState();

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    messages:
    state.messages
    .size

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
