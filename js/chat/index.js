// =====================================
// RIGO AI
// CHAT INDEX
// ENTERPRISE CHAT PUBLIC API
// FINAL CONNECTED EDITION
// =====================================



// =====================================
// CHAT FILE REGISTRY
// =====================================

const CHAT_MODULES =
Object.freeze({



  // ===================================
  // CORE STATE
  // ===================================

  state:

    typeof chatRuntimeState !==
    "undefined"

    ?

    chatRuntimeState

    :

    null,



  streamState:

    typeof chatStreamState !==
    "undefined"

    ?

    chatStreamState

    :

    null,



  streamingState:

    typeof streamingMessageState !==
    "undefined"

    ?

    streamingMessageState

    :

    null,



  // ===================================
  // ELEMENTS
  // ===================================

  elements:

    typeof ChatElements !==
    "undefined"

    ?

    ChatElements

    :

    null,



  // ===================================
  // MARKDOWN
  // ===================================

  markdown:

    typeof ChatMarkdownRenderer !==
    "undefined"

    ?

    ChatMarkdownRenderer

    :

    null,



  // ===================================
  // STREAM
  // ===================================

  stream:

    typeof ChatStreamManager !==
    "undefined"

    ?

    ChatStreamManager

    :

    null,



  // ===================================
  // RUNTIME
  // ===================================

  runtime:

    typeof ChatRuntime !==
    "undefined"

    ?

    ChatRuntime

    :

    null,



  // ===================================
  // ACTIONS
  // ===================================

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



  // ===================================
  // QUEUE
  // ===================================

  queue:Object.freeze({

    process:

      typeof processAIQueue ===
      "function"

      ?

      processAIQueue

      :

      null,



    continue:

      typeof continueQueueProcessing ===
      "function"

      ?

      continueQueueProcessing

      :

      null,



    createItem:

      typeof createQueueItem ===
      "function"

      ?

      createQueueItem

      :

      null

  }),



  // ===================================
  // EVENTS
  // ===================================

  events:Object.freeze({

    emit:

      typeof emitChatRuntimeEvent ===
      "function"

      ?

      emitChatRuntimeEvent

      :

      null

  }),



  // ===================================
  // RENDERER
  // ===================================

  renderer:Object.freeze({

    typing:

      typeof showTypingIndicator ===
      "function"

      ?

      showTypingIndicator

      :

      null,



    renderStream:

      typeof renderStreamingMessage ===
      "function"

      ?

      renderStreamingMessage

      :

      null,



    finalizeStream:

      typeof finalizeStreamingMessage ===
      "function"

      ?

      finalizeStreamingMessage

      :

      null,



    abortStream:

      typeof abortStreamingMessage ===
      "function"

      ?

      abortStreamingMessage

      :

      null

  }),



  // ===================================
  // MESSAGE ELEMENTS
  // ===================================

  messageElements:Object.freeze({

    create:

      typeof createMessageElement ===
      "function"

      ?

      createMessageElement

      :

      null,



    update:

      typeof updateMessageElement ===
      "function"

      ?

      updateMessageElement

      :

      null,



    createContent:

      typeof createMessageContentElement ===
      "function"

      ?

      createMessageContentElement

      :

      null,



    createMeta:

      typeof createMessageMetaElement ===
      "function"

      ?

      createMessageMetaElement

      :

      null

  }),



  // ===================================
  // UTILS
  // ===================================

  utils:Object.freeze({

    clone:

      typeof safeChatClone ===
      "function"

      ?

      safeChatClone

      :

      null,



    freeze:

      typeof freezeChatObject ===
      "function"

      ?

      freezeChatObject

      :

      null,



    wait:

      typeof wait ===
      "function"

      ?

      wait

      :

      null

  })

});



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



    stream:

      typeof getChatStreamStatus ===
      "function"

      ?

      getChatStreamStatus()

      :

      null,



    markdown:

      typeof ChatMarkdownRenderer !==
      "undefined"

      &&

      typeof ChatMarkdownRenderer
      .diagnostics ===
      "function"

      ?

      ChatMarkdownRenderer
      .diagnostics()

      :

      null,



    elements:

      typeof ChatElements !==
      "undefined"

      &&

      typeof ChatElements
      .diagnostics ===
      "function"

      ?

      ChatElements
      .diagnostics()

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
  // CONNECTED MODULES
  // ===================================

  modules:
  CHAT_MODULES,



  runtime:
  CHAT_MODULES.runtime,



  state:
  CHAT_MODULES.state,



  streamState:
  CHAT_MODULES.streamState,



  streamingState:
  CHAT_MODULES.streamingState,



  elements:
  CHAT_MODULES.elements,



  markdown:
  CHAT_MODULES.markdown,



  stream:
  CHAT_MODULES.stream,



  actions:
  CHAT_MODULES.actions,



  queue:
  CHAT_MODULES.queue,



  events:
  CHAT_MODULES.events,



  renderer:
  CHAT_MODULES.renderer,



  messageElements:
  CHAT_MODULES.messageElements,



  utils:
  CHAT_MODULES.utils

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



  window.CHAT_MODULES =
  CHAT_MODULES;



  window.ChatRuntime =
  ChatRuntime;



  window.ChatStreamManager =
  ChatStreamManager;



  window.ChatElements =
  ChatElements;



  window.ChatMarkdownRenderer =
  ChatMarkdownRenderer;



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
