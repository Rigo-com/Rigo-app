// =====================================
// RIGO AI
// CHAT RUNTIME
// SAFE ENTERPRISE ORCHESTRATOR
// =====================================



// =====================================
// INITIALIZE
// =====================================

async function initializeChatRuntime(){

  try{

    if(
      chatRuntimeState?.initialized
    ){

      return true;

    }

    if(
      chatRuntimeState?.initializing
    ){

      return false;

    }

    chatRuntimeState.initializing =
    true;



    // ============================
    // CHAT ELEMENTS
    // ============================

    if(

      typeof ChatElements !==
      "undefined"

      &&

      typeof ChatElements.initialize ===
      "function"

    ){

      const elementsReady =
      ChatElements.initialize();

      if(!elementsReady){

        console.error(
          "CHAT_ELEMENTS_INIT_FAILED"
        );

        return false;

      }

    }

    else{

      console.error(
        "CHAT_ELEMENTS_MISSING"
      );

      return false;

    }



    // ============================
    // MARKDOWN
    // ============================

    try{

      if(

        typeof ChatMarkdownRenderer !==
        "undefined"

        &&

        typeof ChatMarkdownRenderer.initialize ===
        "function"

      ){

        ChatMarkdownRenderer.initialize();

      }

      else{

        console.warn(
          "MARKDOWN_RENDERER_NOT_AVAILABLE"
        );

      }

    }

    catch(error){

      console.warn(
        "MARKDOWN_INIT_WARNING:",
        error
      );

    }



    // ============================
    // STREAM MANAGER
    // ============================

    try{

      if(

        typeof ChatStreamManager !==
        "undefined"

        &&

        typeof ChatStreamManager.initialize ===
        "function"

      ){

        ChatStreamManager.initialize();

      }

      else{

        console.warn(
          "STREAM_MANAGER_NOT_AVAILABLE"
        );

      }

    }

    catch(error){

      console.warn(
        "STREAM_MANAGER_WARNING:",
        error
      );

    }



    // ============================
    // READY
    // ============================

    chatRuntimeState.initialized =
    true;

    console.log(
      "CHAT_RUNTIME_READY"
    );

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
// RESET RUNTIME
// =====================================

async function resetChatRuntime(){

  try{

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



  send:async function(){

    try{

      if(
        typeof sendMessage ===
        "function"
      ){

        return await sendMessage();

      }

      console.error(
        "SEND_MESSAGE_MISSING"
      );

      return false;

    }

    catch(error){

      console.error(
        "CHAT_RUNTIME_SEND_ERROR:",
        error
      );

      return false;

    }

  },



  process:function(){

    try{

      if(
        typeof processAIQueue ===
        "function"
      ){

        return processAIQueue();

      }

      return false;

    }

    catch(error){

      console.error(error);

      return false;

    }

  },



  add:function(message){

    try{

      if(
        typeof addMessage ===
        "function"
      ){

        return addMessage(
          message
        );

      }

      return false;

    }

    catch(error){

      console.error(error);

      return false;

    }

  },



  reset:function(){

    try{

      if(
        typeof resetCurrentChat ===
        "function"
      ){

        return resetCurrentChat();

      }

      return false;

    }

    catch(error){

      console.error(error);

      return false;

    }

  },



  abort:function(){

    try{

      if(
        typeof abortMessageGeneration ===
        "function"
      ){

        return abortMessageGeneration();

      }

      return false;

    }

    catch(error){

      console.error(error);

      return false;

    }

  },



  status:function(){

    try{

      if(
        typeof getChatRuntimeStatus ===
        "function"
      ){

        return getChatRuntimeStatus();

      }

      return null;

    }

    catch(error){

      console.error(error);

      return null;

    }

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
