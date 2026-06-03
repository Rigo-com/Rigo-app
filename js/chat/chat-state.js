// =====================================
// RIGO AI
// CHAT STATE
// =====================================

import {
  safeChatClone
}
from "./chat-utils.js";



// =====================================
// CHAT RUNTIME STATE
// =====================================

export const chatRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  destroyed:false,

  generating:false,

  streaming:false,

  syncing:false,

  processing:false,

  rendering:false,

  activeMessageId:null,

  generationController:null,

  queue:[],

  pendingOperations:
  new Map(),

  renderQueue:[],

  cache:Object.seal({

    messages:
    new Map(),

    rendered:
    new Map()

  }),

  diagnostics:Object.seal({

    messages:0,

    successful:0,

    failed:0,

    retries:0,

    resets:0,

    renders:0

  })

});



// =====================================
// RESET DIAGNOSTICS
// =====================================

export function resetChatDiagnostics(){

  chatRuntimeState
  .diagnostics
  .messages = 0;

  chatRuntimeState
  .diagnostics
  .successful = 0;

  chatRuntimeState
  .diagnostics
  .failed = 0;

  chatRuntimeState
  .diagnostics
  .retries = 0;

  chatRuntimeState
  .diagnostics
  .resets = 0;

  chatRuntimeState
  .diagnostics
  .renders = 0;

  return true;

}



// =====================================
// RESET CHAT STATE
// =====================================

export function resetChatState(){

  chatRuntimeState
  .initialized =
  false;

  chatRuntimeState
  .initializing =
  false;

  chatRuntimeState
  .destroyed =
  false;

  chatRuntimeState
  .generating =
  false;

  chatRuntimeState
  .streaming =
  false;

  chatRuntimeState
  .syncing =
  false;

  chatRuntimeState
  .processing =
  false;

  chatRuntimeState
  .rendering =
  false;

  chatRuntimeState
  .activeMessageId =
  null;

  chatRuntimeState
  .generationController =
  null;

  chatRuntimeState
  .queue.length = 0;

  chatRuntimeState
  .renderQueue.length = 0;

  chatRuntimeState
  .pendingOperations
  .clear();

  chatRuntimeState
  .cache
  .messages
  .clear();

  chatRuntimeState
  .cache
  .rendered
  .clear();

  resetChatDiagnostics();

  return true;

}



// =====================================
// CHAT STATUS
// =====================================

export function getChatRuntimeStatus(){

  return Object.freeze({

    initialized:
    chatRuntimeState
    .initialized,

    initializing:
    chatRuntimeState
    .initializing,

    destroyed:
    chatRuntimeState
    .destroyed,

    generating:
    chatRuntimeState
    .generating,

    streaming:
    chatRuntimeState
    .streaming,

    syncing:
    chatRuntimeState
    .syncing,

    processing:
    chatRuntimeState
    .processing,

    rendering:
    chatRuntimeState
    .rendering,

    queueSize:

      chatRuntimeState
      .queue
      .length,

    renderQueueSize:

      chatRuntimeState
      .renderQueue
      .length,

    activeMessageId:
    chatRuntimeState
    .activeMessageId,

    pendingOperations:

      chatRuntimeState
      .pendingOperations
      .size,

    diagnostics:

      safeChatClone(

        chatRuntimeState
        .diagnostics

      )

  });

}
