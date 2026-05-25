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
    typeof ChatRuntime ===
    "undefined"
  ){

    return false;

  }

  return ChatRuntime
  .send();

}



// =====================================
// ABORT CHAT GENERATION
// =====================================

function abortChatGeneration(){

  if(
    typeof ChatRuntime ===
    "undefined"
  ){

    return false;

  }

  return ChatRuntime
  .abort();

}



// =====================================
// PROCESS CHAT QUEUE
// =====================================

function processChatQueue(){

  if(
    typeof ChatRuntime ===
    "undefined"
  ){

    return false;

  }

  return ChatRuntime
  .process();

}



// =====================================
// CHAT STATUS
// =====================================

function getChatSystemStatus(){

  if(
    typeof ChatRuntime ===
    "undefined"
  ){

    return null;

  }

  return ChatRuntime
  .status();

}



// =====================================
// CHAT READY
// =====================================

function isChatReady(){

  return (

    typeof chatRuntimeState !==
    "undefined"

    &&

    typeof ChatStreamManager !==
    "undefined"

    &&

    typeof ChatStreamManager.status ===
    "function"

    &&

    chatRuntimeState
    .initialized ===
    true

    &&

    chatRuntimeState
    .destroyed !==
    true

    &&

    ChatStreamManager
    .status()
    ?.initialized ===
    true

  );

}



// =====================================
// CHAT DIAGNOSTICS
// =====================================

function getChatDiagnostics(){

  let diagnostics =
  {};

  try{

    diagnostics =

      typeof safeChatClone ===
      "function"

      ?

      safeChatClone(

        chatRuntimeState
        ?.diagnostics || {}

      )

      :

      {
        ...(chatRuntimeState
        ?.diagnostics || {})
      };

  }

  catch(error){

    diagnostics = {};

  }

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

        Array.isArray(
          chatRuntimeState
          ?.queue
        )

        ?

        chatRuntimeState
        .queue
        .length

        :

        0,

      generating:

        chatRuntimeState
        ?.generating ===
        true

    }),



    diagnostics:
    diagnostics

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

    typeof ChatRuntime !==
    "undefined"

    ?

    ChatRuntime

    :

    null,



  actions:Object.freeze({

    send:

      typeof sendMessage ===
      "function"

      ?

      sendMessage

      :

      null,



    add:

      typeof addMessage ===
      "function"

      ?

      addMessage

      :

      null,



    reset:

      typeof resetCurrentChat ===
      "function"

      ?

      resetCurrentChat

      :

      null,



    abort:

      typeof abortMessageGeneration ===
      "function"

      ?

      abortMessageGeneration

      :

      null

  }),

  queue:Object.freeze({

    process:

      typeof processAIQueue ===
      "function"

      ?

      processAIQueue

      :

      null

  }),

  renderer:Object.freeze({

    typing:

      typeof showTypingIndicator ===
      "function"

      ?

      showTypingIndicator

      :

      null

  }),

  events:Object.freeze({

    emit:

      typeof emitChatRuntimeEvent ===
      "function"

      ?

      emitChatRuntimeEvent

      :

      null

  }),

  state:

    typeof chatRuntimeState !==
    "undefined"

    ?

    chatRuntimeState

    :

    null

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.Chat =
  Chat;

  window.initializeChatSystem =
  initializeChatSystem;

  window.resetChatSystem =
  resetChatSystem;

  window.sendChatMessage =
  sendChatMessage;

  window.abortChatGeneration =
  abortChatGeneration;

  window.processChatQueue =
  processChatQueue;

  window.getChatSystemStatus =
  getChatSystemStatus;

  window.getChatDiagnostics =
  getChatDiagnostics;

  window.isChatReady =
  isChatReady;

}
