// =====================================
// RIGO AI
// CHAT ACTIONS
// =====================================

import {
  CHAT_RUNTIME_CONFIG,
  CHAT_RUNTIME_EVENTS
}
from "./chat-config.js";

import {
  chatRuntimeState
}
from "./chat-state.js";

import {
  emitChatRuntimeEvent
}
from "./chat-events.js";

import {
  createQueueItem
}
from "./chat-utils.js";

import {
  ChatQueue
}
from "./chat-queue.js";

import {
  ChatStreamManager
}
from "./chat-stream-manager.js";



// =====================================
// MESSAGE ID
// =====================================

function createMessageId(){

  try{

    if(
      typeof crypto !==
      "undefined"
      &&
      typeof crypto.randomUUID ===
      "function"
    ){

      return (
        "msg_" +
        crypto.randomUUID()
      );

    }

  }

  catch(error){}

  return [

    "msg",

    Date.now(),

    Math.random()
    .toString(36)
    .slice(2,10)

  ].join("_");

}



// =====================================
// VALIDATE MESSAGE
// =====================================

function validateOutgoingMessage(
  text
){

  if(
    typeof text !==
    "string"
  ){
    return false;
  }

  const trimmed =
  text.trim();

  if(
    trimmed.length <= 0
  ){
    return false;
  }

  return (
    trimmed.length <=
    4000
  );

}



// =====================================
// SEND MESSAGE
// =====================================

async function sendMessage(
  text,
  generator
){

  try{

    if(
      chatRuntimeState.generating
    ){
      return false;
    }

    if(
      !validateOutgoingMessage(
        text
      )
    ){
      return false;
    }

    if(

      chatRuntimeState.queue
      .length >=

      CHAT_RUNTIME_CONFIG
      .MAX_QUEUE_SIZE

    ){
      return false;
    }

    const messageId =
    createMessageId();

    const queueItem =
    createQueueItem(
      messageId
    );

    if(
      !queueItem
    ){
      return false;
    }

    ChatQueue.enqueue(
      queueItem
    );

    chatRuntimeState
    .diagnostics
    .messages++;

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .MESSAGE_SENT,

      {

        messageId,

        text

      }

    );

    return await ChatQueue.process(
      generator
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// ABORT GENERATION
// =====================================

async function abortMessageGeneration(){

  try{

    const controller =

      chatRuntimeState
      .generationController;

    if(
      controller &&
      !controller.signal.aborted
    ){

      controller.abort();

    }

    ChatStreamManager
    .abort();

    chatRuntimeState
    .processing =
    false;

    chatRuntimeState
    .generating =
    false;

    chatRuntimeState
    .streaming =
    false;

    chatRuntimeState
    .activeMessageId =
    null;

    chatRuntimeState
    .generationController =
    null;

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .GENERATION_ABORTED,

      {

        timestamp:
        Date.now()

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// RESET CHAT
// =====================================

async function resetCurrentChat(){

  try{

    await abortMessageGeneration();

    chatRuntimeState
    .queue =
    [];

    chatRuntimeState
    .renderQueue =
    [];

    chatRuntimeState
    .processing =
    false;

    chatRuntimeState
    .generating =
    false;

    chatRuntimeState
    .streaming =
    false;

    chatRuntimeState
    .activeMessageId =
    null;

    ChatStreamManager
    .destroy();

    chatRuntimeState
    .diagnostics
    .resets++;

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .CHAT_RESET,

      {

        timestamp:
        Date.now()

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// ACTION STATUS
// =====================================

function getChatActionStatus(){

  return Object.freeze({

    processing:
    chatRuntimeState
    .processing,

    generating:
    chatRuntimeState
    .generating,

    streaming:
    chatRuntimeState
    .streaming,

    activeMessageId:
    chatRuntimeState
    .activeMessageId

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatActions =
Object.freeze({

  send:
  sendMessage,

  abort:
  abortMessageGeneration,

  reset:
  resetCurrentChat,

  status:
  getChatActionStatus,

  snapshot:
  getChatActionStatus

});



// =====================================
// EXPORTS
// =====================================

export {

  ChatActions,

  createMessageId,

  validateOutgoingMessage,

  sendMessage,

  abortMessageGeneration,

  resetCurrentChat,

  getChatActionStatus

};

export default
ChatActions;
