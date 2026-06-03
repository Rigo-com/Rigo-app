// =====================================
// RIGO AI
// CHAT STATE
// FOUNDATION STATE LAYER
// =====================================

import {
  CHAT_FEATURES
}
from "../chat-config.js";



// =====================================
// CHAT STATE
// =====================================

const chatState =
Object.seal({

  initialized:false,

  initializing:false,

  destroyed:false,

  generating:false,

  processing:false,

  rendering:false,

  syncing:false,

  activeConversationId:null,

  activeMessageId:null,

  lastMessageId:null,

  diagnostics:Object.seal({

    messagesCreated:0,

    messagesSent:0,

    messagesFailed:0,

    retries:0,

    resets:0,

    renders:0

  })

});



// =====================================
// INTERNAL HELPERS
// =====================================

function createSnapshot(){

  return structuredClone(
    chatState
  );

}



// =====================================
// GET STATE
// =====================================

function getChatState(){

  return chatState;

}



// =====================================
// GET SNAPSHOT
// =====================================

function getChatSnapshot(){

  return Object.freeze(
    createSnapshot()
  );

}



// =====================================
// UPDATE STATE
// =====================================

function updateChatState(
  updates = {}
){

  if(
    !updates ||
    typeof updates !== "object"
  ){
    return false;
  }

  Object.assign(
    chatState,
    updates
  );

  return true;

}



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetChatDiagnostics(){

  chatState
  .diagnostics
  .messagesCreated = 0;

  chatState
  .diagnostics
  .messagesSent = 0;

  chatState
  .diagnostics
  .messagesFailed = 0;

  chatState
  .diagnostics
  .retries = 0;

  chatState
  .diagnostics
  .renders = 0;

  return true;

}



// =====================================
// RESET STATE
// =====================================

function resetChatState(){

  chatState
  .initialized =
  false;

  chatState
  .initializing =
  false;

  chatState
  .destroyed =
  false;

  chatState
  .generating =
  false;

  chatState
  .processing =
  false;

  chatState
  .rendering =
  false;

  chatState
  .syncing =
  false;

  chatState
  .activeConversationId =
  null;

  chatState
  .activeMessageId =
  null;

  chatState
  .lastMessageId =
  null;

  resetChatDiagnostics();

  if(
    CHAT_FEATURES
    .ENABLE_DIAGNOSTICS
  ){

    chatState
    .diagnostics
    .resets++;

  }

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatState =
Object.freeze({

  get:
  getChatState,

  snapshot:
  getChatSnapshot,

  update:
  updateChatState,

  reset:
  resetChatState,

  resetDiagnostics:
  resetChatDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  chatState,

  getChatState,

  getChatSnapshot,

  updateChatState,

  resetChatState,

  resetChatDiagnostics,

  ChatState

};

export default
ChatState;
