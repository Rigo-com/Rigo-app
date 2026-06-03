// =====================================
// RIGO AI
// CHAT ACTIONS
// ORCHESTRATION LAYER
// =====================================

import {
  CHAT_EVENTS
}
from "../chat-config.js";

import {
  emit
}
from "../chat-events/chat-events.js";

import ChatRuntime
from "../chat-runtime/chat-runtime.js";

import ChatMessageService
from "../chat-services/chat-message-service.js";

import ChatQueueService
from "../chat-services/chat-queue-service.js";

import ChatStreamService
from "../chat-services/chat-stream-service.js";



// =====================================
// SEND MESSAGE
// =====================================

function sendMessage(
  payload = {}
){

  const message =

    ChatMessageService
    .create(
      payload
    );

  emit(
    CHAT_EVENTS
    .MESSAGE_SENT,
    structuredClone(
      message
    )
  );

  return message;

}



// =====================================
// DELETE MESSAGE
// =====================================

function deleteMessage(
  messageId
){

  return ChatMessageService
  .delete(
    messageId
  );

}



// =====================================
// RETRY MESSAGE
// =====================================

function retryMessage(
  messageId
){

  emit(
    CHAT_EVENTS
    .MESSAGE_RETRY,
    {
      messageId
    }
  );

  return true;

}



// =====================================
// GENERATION
// =====================================

function startGeneration(
  payload = null
){

  emit(
    CHAT_EVENTS
    .GENERATION_STARTED,
    payload
  );

  return true;

}



function completeGeneration(
  payload = null
){

  emit(
    CHAT_EVENTS
    .GENERATION_COMPLETED,
    payload
  );

  return true;

}



function abortGeneration(
  payload = null
){

  emit(
    CHAT_EVENTS
    .GENERATION_ABORTED,
    payload
  );

  return true;

}



// =====================================
// STREAM
// =====================================

function startStream(
  messageId
){

  return ChatStreamService
  .start(
    messageId
  );

}



function pushChunk(
  chunk
){

  return ChatStreamService
  .pushChunk(
    chunk
  );

}



function completeStream(){

  return ChatStreamService
  .complete();

}



function abortStream(){

  return ChatStreamService
  .abort();

}



// =====================================
// CLEAR CHAT
// =====================================

function clearChat(){

  ChatRuntime
  .reset();

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    runtime:
    ChatRuntime
    .status(),

    messages:

    ChatMessageService
    .status(),

    queue:

    ChatQueueService
    .status(),

    stream:

    ChatStreamService
    .status()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatActions =
Object.freeze({

  sendMessage,

  deleteMessage,

  retryMessage,

  startGeneration,
  completeGeneration,
  abortGeneration,

  startStream,
  pushChunk,
  completeStream,
  abortStream,

  clearChat,

  status:
  getStatus

});



// =====================================
// EXPORTS
// =====================================

export {

  sendMessage,

  deleteMessage,

  retryMessage,

  startGeneration,
  completeGeneration,
  abortGeneration,

  startStream,
  pushChunk,
  completeStream,
  abortStream,

  clearChat,

  getStatus,

  ChatActions

};

export default
ChatActions;
