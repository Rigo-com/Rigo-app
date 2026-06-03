// =====================================
// RIGO AI
// CHAT RUNTIME
// =====================================

import {
  chatRuntimeState,
  getChatRuntimeStatus,
  resetChatState
}
from "./chat-state.js";

import {
  ChatActions
}
from "./chat-actions.js";

import {
  ChatQueue
}
from "./chat-queue.js";

import {
  ChatStreamManager
}
from "./chat-stream-manager.js";



// =====================================
// RUNTIME READY
// =====================================

function isChatRuntimeReady(){

  return (

    chatRuntimeState
    .initialized === true

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeChatRuntime(){

  try{

    if(
      chatRuntimeState
      .initialized
    ){
      return true;
    }

    if(
      chatRuntimeState
      .initializing
    ){
      return false;
    }

    chatRuntimeState
    .initializing =
    true;

    ChatQueue
    .initialize();

    ChatStreamManager
    .initialize();

    chatRuntimeState
    .initialized =
    true;

    return true;

  }

  catch(error){

    return false;

  }

  finally{

    chatRuntimeState
    .initializing =
    false;

  }

}



// =====================================
// RESET RUNTIME
// =====================================

async function resetChatRuntime(){

  try{

    await ChatActions
    .abort();

    ChatStreamManager
    .destroy();

    resetChatState();

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SEND
// =====================================

async function runtimeSendMessage(
  text,
  generator
){

  try{

    if(
      !isChatRuntimeReady()
    ){
      return false;
    }

    return await ChatActions
    .send(
      text,
      generator
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// PROCESS
// =====================================

async function runtimeProcessQueue(
  generator
){

  try{

    if(
      !isChatRuntimeReady()
    ){
      return false;
    }

    if(
      chatRuntimeState
      .processing
    ){
      return false;
    }

    return await ChatQueue
    .process(
      generator
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// ABORT
// =====================================

async function runtimeAbortGeneration(){

  try{

    return await ChatActions
    .abort();

  }

  catch(error){

    return false;

  }

}



// =====================================
// RESET
// =====================================

async function runtimeResetChat(){

  try{

    return await ChatActions
    .reset();

  }

  catch(error){

    return false;

  }

}



// =====================================
// STATUS
// =====================================

function runtimeGetStatus(){

  return getChatRuntimeStatus();

}



// =====================================
// DIAGNOSTICS
// =====================================

function getChatRuntimeDiagnostics(){

  return getChatRuntimeStatus();

}



// =====================================
// PUBLIC API
// =====================================

const ChatRuntime =
Object.freeze({

  initialize:
  initializeChatRuntime,

  send:
  runtimeSendMessage,

  process:
  runtimeProcessQueue,

  abort:
  runtimeAbortGeneration,

  reset:
  runtimeResetChat,

  status:
  runtimeGetStatus,

  diagnostics:
  getChatRuntimeDiagnostics,

  snapshot:
  getChatRuntimeDiagnostics,

  resetRuntime:
  resetChatRuntime

});



// =====================================
// EXPORTS
// =====================================

export {

  ChatRuntime,

  initializeChatRuntime,

  resetChatRuntime,

  runtimeSendMessage,

  runtimeProcessQueue,

  runtimeAbortGeneration,

  runtimeResetChat,

  runtimeGetStatus,

  getChatRuntimeDiagnostics

};

export default
ChatRuntime;
