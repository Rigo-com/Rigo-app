// =====================================
// RIGO AI
// CHAT RUNTIME
// SAFE ENTERPRISE ORCHESTRATOR
// =====================================



// =====================================
// RUNTIME STATE
// =====================================

const runtimeLifecycleState =
Object.seal({

  started:false,

  destroyed:false,

  binding:false,

  processing:false,

  streaming:false,

  ready:false,

  listenersBound:false

});



// =====================================
// SCROLL TO BOTTOM
// =====================================

function scrollChatToBottom(){

  try{

    const container =

      ChatElements
      ?.getContainer?.();

    if(!container){

      return false;

    }

    requestAnimationFrame(() => {

      container.scrollTop =
      container.scrollHeight;

    });

    return true;

  }

  catch(error){

    console.error(
      "SCROLL_BOTTOM_ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// BIND EVENTS
// =====================================

function bindRuntimeEvents(){

  if(
    runtimeLifecycleState
    .listenersBound
  ){

    return true;

  }

  const sendButton =

    ChatElements
    ?.getSendButton?.();

  const input =

    ChatElements
    ?.getInput?.();

  if(
    !sendButton ||
    !input
  ){

    return false;

  }

  runtimeLifecycleState
  .binding =
  true;

  try{

    sendButton.addEventListener(
      "click",
      async () => {

        if(
          runtimeLifecycleState
          .processing
        ){

          return;
        }

        runtimeLifecycleState
        .processing =
        true;

        try{

          await ChatRuntime.send();

        }

        finally{

          runtimeLifecycleState
          .processing =
          false;

        }

      }
    );

    input.addEventListener(
      "keydown",
      async (event) => {

        if(
          event.key !== "Enter"
        ){

          return;

        }

        event.preventDefault();

        if(
          runtimeLifecycleState
          .processing
        ){

          return;
        }

        runtimeLifecycleState
        .processing =
        true;

        try{

          await ChatRuntime.send();

        }

        finally{

          runtimeLifecycleState
          .processing =
          false;

        }

      }
    );

    runtimeLifecycleState
    .listenersBound =
    true;

    return true;

  }

  catch(error){

    console.error(
      "RUNTIME_BIND_ERROR:",
      error
    );

    return false;

  }

  finally{

    runtimeLifecycleState
    .binding =
    false;

  }

}



// =====================================
// START RUNTIME
// =====================================

function startChatRuntime(){

  if(
    runtimeLifecycleState
    .started
  ){

    return true;

  }

  const initialized =
  initializeChatRuntime();

  if(!initialized){

    return false;

  }

  const eventsBound =
  bindRuntimeEvents();

  if(!eventsBound){

    return false;

  }

  runtimeLifecycleState
  .started =
  true;

  runtimeLifecycleState
  .destroyed =
  false;

  runtimeLifecycleState
  .ready =
  true;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initializeChatRuntime(){

  if(
    chatRuntimeState?.initialized
  ){

    return true;

  }

  if(
    chatRuntimeState?.initializing === true
  ){

    return false;

  }

  chatRuntimeState.initializing =
  true;

  try{

    const elementsReady =

      typeof ChatElements !==
      "undefined"

      &&

      typeof ChatElements.initialize ===
      "function"

      &&

      ChatElements.initialize();

    if(!elementsReady){

      return false;

    }

    const markdownReady =

      typeof ChatMarkdownRenderer !==
      "undefined"

      &&

      typeof ChatMarkdownRenderer.initialize ===
      "function"

      &&

      ChatMarkdownRenderer.initialize();

    if(!markdownReady){

      return false;

    }

    const streamReady =

      typeof ChatStreamManager !==
      "undefined"

      &&

      typeof ChatStreamManager.initialize ===
      "function"

      &&

      ChatStreamManager.initialize();

    if(!streamReady){

      return false;

    }

    runtimeLifecycleState
    .streaming =
    false;

    chatRuntimeState.initialized =
    true;

    return true;

  }

  catch(error){

    console.error(
      "CHAT_RUNTIME_INIT_ERROR:",
      error
    );

    return false;

  }

  finally{

    chatRuntimeState.initializing =
    false;

  }

}



// =====================================
// SAFE HELPERS
// =====================================

function safeFunction(
  callback
){

  return typeof callback ===
  "function"

    ?

    callback

    :

    function(){

      console.warn(
        "MISSING_FUNCTION"
      );

      return false;

    };

}



// =====================================
// RESET RUNTIME
// =====================================

async function resetChatRuntime(){

  try{

    runtimeLifecycleState
    .processing =
    false;

    runtimeLifecycleState
    .streaming =
    false;

    if(
      typeof abortMessageGeneration ===
      "function"
    ){

      await abortMessageGeneration();

    }

    if(
      typeof ChatStreamManager !==
      "undefined"

      &&

      typeof ChatStreamManager.destroy ===
      "function"
    ){

      ChatStreamManager.destroy();

    }

    if(
      typeof resetStreamingMessageState ===
      "function"
    ){

      resetStreamingMessageState();

    }

    if(
      typeof ChatMarkdownRenderer !==
      "undefined"

      &&

      typeof ChatMarkdownRenderer.reset ===
      "function"
    ){

      ChatMarkdownRenderer.reset();

    }

    if(
      typeof ChatElements !==
      "undefined"

      &&

      typeof ChatElements.cleanup ===
      "function"
    ){

      ChatElements.cleanup();

    }

    if(
      typeof resetChatState ===
      "function"
    ){

      resetChatState();

    }

    runtimeLifecycleState
    .ready =
    false;

    runtimeLifecycleState
    .started =
    false;

    runtimeLifecycleState
    .destroyed =
    true;

    return true;

  }

  catch(error){

    console.error(
      "RESET_CHAT_RUNTIME_ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// GET RUNTIME STATUS
// =====================================

function getRuntimeLifecycleStatus(){

  return Object.freeze({

    started:

      runtimeLifecycleState
      .started,

    destroyed:

      runtimeLifecycleState
      .destroyed,

    processing:

      runtimeLifecycleState
      .processing,

    streaming:

      runtimeLifecycleState
      .streaming,

    ready:

      runtimeLifecycleState
      .ready,

    listenersBound:

      runtimeLifecycleState
      .listenersBound

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatRuntime =
Object.freeze({

  initialize:
  initializeChatRuntime,

  start:
  startChatRuntime,

  scrollBottom:
  scrollChatToBottom,

  lifecycleStatus:
  getRuntimeLifecycleStatus,



  // ===================================
  // SAFE LIVE FUNCTION REFERENCES
  // ===================================

  send:function(){

    if(
      typeof sendMessage ===
      "function"
    ){

      return sendMessage();

    }

    console.error(
      "SEND_MESSAGE_MISSING"
    );

    return false;

  },



  process:function(){

    if(
      typeof processAIQueue ===
      "function"
    ){

      return processAIQueue();

    }

    console.error(
      "PROCESS_QUEUE_MISSING"
    );

    return false;

  },



  add:function(message){

    if(
      typeof addMessage ===
      "function"
    ){

      return addMessage(
        message
      );

    }

    console.error(
      "ADD_MESSAGE_MISSING"
    );

    return false;

  },



  reset:function(){

    if(
      typeof resetCurrentChat ===
      "function"
    ){

      return resetCurrentChat();

    }

    console.error(
      "RESET_CHAT_MISSING"
    );

    return false;

  },



  abort:function(){

    if(
      typeof abortMessageGeneration ===
      "function"
    ){

      return abortMessageGeneration();

    }

    console.error(
      "ABORT_GENERATION_MISSING"
    );

    return false;

  },



  status:function(){

    if(
      typeof getChatRuntimeStatus ===
      "function"
    ){

      return getChatRuntimeStatus();

    }

    console.error(
      "STATUS_FUNCTION_MISSING"
    );

    return null;

  },



  resetRuntime:
  resetChatRuntime

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ChatRuntime =
  ChatRuntime;

}
