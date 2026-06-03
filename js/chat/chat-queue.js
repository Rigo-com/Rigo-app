// =====================================
// RIGO AI
// CHAT QUEUE
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
  wait,
  continueQueueProcessing
}
from "./chat-utils.js";

import {
  ChatStreamManager
}
from "./chat-stream-manager.js";



// =====================================
// QUEUE STATE
// =====================================

const chatQueueState =
Object.seal({

  initialized:false,

  processing:false,

  activeQueueId:null,

  lastProcessedAt:null,

  lastError:null,

  diagnostics:Object.seal({

    processed:0,

    failed:0,

    retries:0,

    aborted:0

  })

});



// =====================================
// ABORT ERROR
// =====================================

function createAbortError(){

  const error =
  new Error(
    "Aborted"
  );

  error.name =
  "AbortError";

  return error;

}



// =====================================
// ENQUEUE
// =====================================

function enqueueChatItem(
  item
){

  if(
    !item ||
    !item.id
  ){
    return false;
  }

  chatRuntimeState
  .queue
  .push(item);

  return true;

}



// =====================================
// DEQUEUE
// =====================================

function dequeueChatItem(){

  if(
    chatRuntimeState
    .queue
    .length <= 0
  ){
    return null;
  }

  return chatRuntimeState
  .queue
  .shift();

}



// =====================================
// PROCESS QUEUE
// =====================================

async function processAIQueue(
  generator
){

  if(
    chatQueueState.processing
  ){
    return false;
  }

  if(
    typeof generator !==
    "function"
  ){
    return false;
  }

  if(
    chatRuntimeState.queue
    .length <= 0
  ){
    return false;
  }

  const queueItem =
  chatRuntimeState
  .queue[0];

  if(
    !queueItem
  ){
    return false;
  }

  chatQueueState.processing =
  true;

  chatQueueState.activeQueueId =
  queueItem.id;

  chatRuntimeState.processing =
  true;

  chatRuntimeState.generating =
  true;

  chatRuntimeState.streaming =
  true;

  chatRuntimeState.activeMessageId =
  queueItem.id;

  let shouldRemove =
  true;

  try{

    const controller =
    new AbortController();

    chatRuntimeState
    .generationController =
    controller;

    if(
      controller.signal.aborted
    ){
      throw createAbortError();
    }

    ChatStreamManager.start(
      queueItem.id
    );

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .GENERATION_STARTED,

      {
        messageId:
        queueItem.id
      }

    );

    const result =
    await generator({

      queueItem,

      signal:
      controller.signal

    });

    if(
      !result
    ){

      throw new Error(
        "GENERATION_FAILED"
      );

    }

    ChatStreamManager
    .complete();

    chatRuntimeState
    .diagnostics
    .successful++;

    chatQueueState
    .diagnostics
    .processed++;

    chatQueueState
    .lastProcessedAt =
    Date.now();

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .GENERATION_COMPLETED,

      {
        messageId:
        queueItem.id
      }

    );

    return true;

  }

  catch(error){

    chatQueueState
    .lastError =
    error;

    if(
      error?.name ===
      "AbortError"
    ){

      ChatStreamManager
      .abort();

      chatQueueState
      .diagnostics
      .aborted++;

      await emitChatRuntimeEvent(

        CHAT_RUNTIME_EVENTS
        .GENERATION_ABORTED,

        {
          messageId:
          queueItem.id
        }

      );

    }

    else{

      ChatStreamManager
      .fail(error);

      chatRuntimeState
      .diagnostics
      .failed++;

      chatQueueState
      .diagnostics
      .failed++;

      if(

        queueItem.retries <

        CHAT_RUNTIME_CONFIG
        .MAX_RETRIES

      ){

        queueItem.retries++;

        shouldRemove =
        false;

        chatRuntimeState
        .diagnostics
        .retries++;

        chatQueueState
        .diagnostics
        .retries++;

        await emitChatRuntimeEvent(

          CHAT_RUNTIME_EVENTS
          .MESSAGE_RETRY,

          {

            messageId:
            queueItem.id,

            retries:
            queueItem.retries

          }

        );

        await wait(

          CHAT_RUNTIME_CONFIG
          .RETRY_DELAY

        );

      }

      else{

        await emitChatRuntimeEvent(

          CHAT_RUNTIME_EVENTS
          .MESSAGE_FAILED,

          {

            messageId:
            queueItem.id,

            error:
            String(error)

          }

        );

      }

    }

    return false;

  }

  finally{

    if(

      shouldRemove

      &&

      chatRuntimeState
      .queue[0]?.id ===
      queueItem.id

    ){

      chatRuntimeState
      .queue.shift();

    }

    chatRuntimeState.processing =
    false;

    chatRuntimeState.generating =
    false;

    chatRuntimeState.streaming =
    false;

    chatRuntimeState.activeMessageId =
    null;

    chatRuntimeState.generationController =
    null;

    chatQueueState.processing =
    false;

    chatQueueState.activeQueueId =
    null;

    continueQueueProcessing(
      () => processAIQueue(generator),
      chatRuntimeState
    );

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getQueueDiagnostics(){

  return Object.freeze({

    initialized:
    chatQueueState
    .initialized,

    processing:
    chatQueueState
    .processing,

    activeQueueId:
    chatQueueState
    .activeQueueId,

    lastProcessedAt:
    chatQueueState
    .lastProcessedAt,

    diagnostics:{

      ...chatQueueState
      .diagnostics

    }

  });

}



// =====================================
// INITIALIZE
// =====================================

function initializeChatQueue(){

  chatQueueState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatQueue =
Object.freeze({

  initialize:
  initializeChatQueue,

  enqueue:
  enqueueChatItem,

  dequeue:
  dequeueChatItem,

  process:
  processAIQueue,

  diagnostics:
  getQueueDiagnostics,

  snapshot:
  getQueueDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  ChatQueue,

  initializeChatQueue,

  enqueueChatItem,

  dequeueChatItem,

  processAIQueue,

  getQueueDiagnostics

};

export default
ChatQueue;
