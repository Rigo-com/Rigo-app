// =====================================
// RIGO AI
// CHAT RUNTIME
// SAFE ENTERPRISE ORCHESTRATOR
// =====================================



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

  chatRuntimeState.initializing = true;

  try{

    const elementsReady =

      typeof ChatElements !== "undefined"

      &&

      typeof ChatElements.initialize === "function"

      &&

      ChatElements.initialize();

    if(!elementsReady){

      return false;

    }

    const markdownReady =

      typeof ChatMarkdownRenderer !== "undefined"

      &&

      typeof ChatMarkdownRenderer.initialize === "function"

      &&

      ChatMarkdownRenderer.initialize();

    if(!markdownReady){

      return false;

    }

    const streamReady =

      typeof ChatStreamManager !== "undefined"

      &&

      typeof ChatStreamManager.initialize === "function"

      &&

      ChatStreamManager.initialize();

    if(!streamReady){

      return false;

    }

    chatRuntimeState.initialized = true;

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

    chatRuntimeState.initializing = false;

  }

}



// =====================================
// SAFE HELPERS
// =====================================

function safeFunction(
  callback
){

  return typeof callback === "function"

    ? callback

    : function(){

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

    await safeFunction(
      window.abortMessageGeneration
    )();

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
// PUBLIC API
// =====================================

const ChatRuntime =
Object.freeze({

  initialize:
  initializeChatRuntime,



  send:
  safeFunction(
    window.sendMessage
  ),



  process:
  safeFunction(
    window.processAIQueue
  ),



  add:
  safeFunction(
    window.addMessage
  ),



  reset:
  safeFunction(
    window.resetCurrentChat
  ),



  abort:
  safeFunction(
    window.abortMessageGeneration
  ),



  status:
  safeFunction(
    window.getChatRuntimeStatus
  ),



  resetRuntime:
  resetChatRuntime

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !== "undefined"
){

  window.ChatRuntime =
  ChatRuntime;

}
