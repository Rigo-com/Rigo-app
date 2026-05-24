// =====================================
// RIGO AI
// CHAT INDEX
// ENTERPRISE CHAT PUBLIC API
// =====================================



// =====================================
// INITIALIZE CHAT SYSTEM
// =====================================

function initializeChatSystem(){

  if(
    typeof ChatRuntime ===
    "undefined"
  ){

    return false;

  }

  return ChatRuntime
  .initialize();

}



// =====================================
// RESET CHAT SYSTEM
// =====================================

function resetChatSystem(){

  if(
    typeof ChatRuntime ===
    "undefined"
  ){

    return false;

  }

  return ChatRuntime
  .resetRuntime();

}



// =====================================
// SEND CHAT MESSAGE
// =====================================

function sendChatMessage(){

  if(
    typeof sendMessage !==
    "function"
  ){

    return false;

  }

  return sendMessage();

}



// =====================================
// ABORT CHAT GENERATION
// =====================================

function abortChatGeneration(){

  if(
    typeof abortMessageGeneration !==
    "function"
  ){

    return false;

  }

  return abortMessageGeneration();

}



// =====================================
// PROCESS CHAT QUEUE
// =====================================

function processChatQueue(){

  if(
    typeof processAIQueue !==
    "function"
  ){

    return false;

  }

  return processAIQueue();

}



// =====================================
// CHAT STATUS
// =====================================

function getChatSystemStatus(){

  if(
    typeof getChatRuntimeStatus !==
    "function"
  ){

    return null;

  }

  return getChatRuntimeStatus();

}



// =====================================
// CHAT READY
// =====================================

function isChatReady(){

  return (

    typeof chatRuntimeState !==
    "undefined"

    &&

    chatRuntimeState
    .initialized ===
    true

    &&

    chatRuntimeState
    .destroyed !==
    true

  );

}



// =====================================
// CHAT DIAGNOSTICS
// =====================================

function getChatDiagnostics(){

  return Object.freeze({

    runtime:

      typeof ChatRuntime !==
      "undefined"

      ?

      ChatRuntime
      .status()

      :

      null,



    state:

      typeof getChatRuntimeStatus ===
      "function"

      ?

      getChatRuntimeStatus()

      :

      null,



    queue:Object.freeze({

      active:

        chatRuntimeState
        ?.processing ===
        true,

      size:

        chatRuntimeState
        ?.queue
        ?.length || 0,

      generating:

        chatRuntimeState
        ?.generating ===
        true

    }),



    diagnostics:

      deepClone(

        chatRuntimeState
        ?.diagnostics || {}

      )

  });

}



// =====================================
// CHAT PUBLIC API
// =====================================

const Chat =
Object.freeze({

  initialize:
  initializeChatSystem,

  reset:
  resetChatSystem,

  send:
  sendChatMessage,

  abort:
  abortChatGeneration,

  process:
  processChatQueue,

  status:
  getChatSystemStatus,

  diagnostics:
  getChatDiagnostics,

  isReady:
  isChatReady,



  // ===================================
  // MODULES
  // ===================================

  runtime:
  ChatRuntime,

  actions:Object.freeze({

    send:
    sendMessage,

    add:
    addMessage,

    reset:
    resetCurrentChat,

    abort:
    abortMessageGeneration

  }),

  queue:Object.freeze({

    process:
    processAIQueue

  }),

  renderer:Object.freeze({

    typing:
    showTypingIndicator

  }),

  events:Object.freeze({

    emit:
    emitChatRuntimeEvent

  }),

  state:
  chatRuntimeState

});
