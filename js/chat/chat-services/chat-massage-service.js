// =====================================
// RIGO AI
// CHAT MESSAGE SERVICE
// =====================================

import {
  updateChatState,
  getChatState
}
from "../chat-state/chat-state.js";

import {
  emit
}
from "../chat-events/chat-events.js";

import {
  CHAT_EVENTS
}
from "../chat-config.js";



// =====================================
// MESSAGE STORAGE
// =====================================

const messages =
new Map();



// =====================================
// MESSAGE COUNTER
// =====================================

let messageCounter = 0;



// =====================================
// CREATE MESSAGE ID
// =====================================

function createMessageId(){

  messageCounter++;

  return `msg_${Date.now()}_${messageCounter}`;

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

    createdAt:
    Date.now(),

    updatedAt:
    Date.now()

  };

  messages.set(
    message.id,
    message
  );

  const state =
  getChatState();

  updateChatState({

    lastMessageId:
    message.id

  });

  state.diagnostics
  .messagesCreated++;

  emit(
    CHAT_EVENTS
    .MESSAGE_CREATED,
    message
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

  const message =
  messages.get(
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

  emit(
    CHAT_EVENTS
    .MESSAGE_UPDATED,
    message
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
  messages.get(
    messageId
  );

  if(
    !message
  ){
    return false;
  }

  messages.delete(
    messageId
  );

  emit(
    CHAT_EVENTS
    .MESSAGE_DELETED,
    message
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
  messages.get(
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

  return Array.from(
    messages.values()
  ).map(
    structuredClone
  );

}



// =====================================
// CLEAR MESSAGES
// =====================================

function clearMessages(){

  messages.clear();

  return true;

}



// =====================================
// MESSAGE COUNT
// =====================================

function getMessageCount(){

  return messages.size;

}



// =====================================
// PUBLIC API
// =====================================

const ChatMessageService =
Object.freeze({

  create:
  createMessage,

  update:
  updateMessage,

  delete:
  deleteMessage,

  get:
  getMessage,

  getAll:
  getMessages,

  clear:
  clearMessages,

  count:
  getMessageCount

});



// =====================================
// EXPORTS
// =====================================

export {

  createMessage,

  updateMessage,

  deleteMessage,

  getMessage,

  getMessages,

  clearMessages,

  getMessageCount,

  ChatMessageService

};

export default
ChatMessageService;
