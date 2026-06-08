// =====================================
// RIGO AI
// CHAT RUNTIME
// CORE LIFECYCLE MANAGER
// =====================================

import {

  updateChatState,

  getChatSnapshot,

  resetChatState

}
from "../chat-state/chat-state.js";

import ChatEvents
from "../chat-events/chat-events.js";

import ChatMessageService
from "../chat-services/chat-message-service.js";

import ChatQueueService
from "../chat-services/chat-queue-service.js";

import ChatStreamService
from "../chat-services/chat-stream-service.js";

import ChatRenderService
from "../chat-services/chat-render-service.js";



// =====================================
// RUNTIME STATE
// =====================================

const runtimeState =
Object.seal({

  initialized:false,

  startedAt:null

});



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  alert(
  "CHAT INITIALIZED"
  );
  
  if(
    runtimeState.initialized
  ){
    return true;
  }

  updateChatState({

    initializing:true,

    destroyed:false

  });

  ChatEvents.initialize();

  ChatMessageService.initialize();

  ChatQueueService.initialize();

  ChatStreamService.initialize();

  ChatRenderService.initialize();

  runtimeState.initialized =
  true;

  runtimeState.startedAt =
  Date.now();

  updateChatState({

    initialized:true,

    initializing:false

  });

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  if(
    !runtimeState.initialized
  ){
    return true;
  }

  ChatRenderService.destroy();

  ChatStreamService.destroy();

  ChatQueueService.destroy();

  ChatMessageService.destroy();

  ChatEvents.destroy();

  updateChatState({

    initialized:false,

    destroyed:true

  });

  runtimeState.initialized =
  false;

  runtimeState.startedAt =
  null;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  ChatRenderService.reset();

  ChatStreamService.reset();

  ChatQueueService.reset();

  ChatMessageService.reset();

  resetChatState();

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    initialized:
    runtimeState
    .initialized,

    startedAt:
    runtimeState
    .startedAt

  });

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return Object.freeze({

    runtime:
    structuredClone(
      runtimeState
    ),

    chat:
    getChatSnapshot(),

    messages:
    ChatMessageService
    .snapshot(),

    queue:
    ChatQueueService
    .snapshot(),

    stream:
    ChatStreamService
    .snapshot(),

    render:
    ChatRenderService
    .snapshot()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatRuntime =
Object.freeze({

  initialize,

  destroy,

  reset,

  status:
  getStatus,

  snapshot:
  getSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  reset,

  getStatus,

  getSnapshot,

  ChatRuntime

};

export default
ChatRuntime;
