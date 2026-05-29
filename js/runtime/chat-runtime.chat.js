// =====================================
// RIGO AI
// CHAT RUNTIME
// SAFE ENTERPRISE ORCHESTRATOR
// FINAL STABLE EDITION
// =====================================



// =====================================
// SERVICE ACCESS
// =====================================

function getChatRuntimeService(
  serviceName
){

  try{

    if(
      typeof ServiceRegistry ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof ServiceRegistry.get !==
      "function"
    ){

      return null;

    }

    return ServiceRegistry.get(
      serviceName
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE LOGGER
// =====================================

function safeChatRuntimeLogError(
  ...args
){

  try{

    const diagnostics =
    getChatRuntimeService(
      "diagnostics"
    );

    if(
      diagnostics &&
      typeof diagnostics.error ===
      "function"
    ){

      diagnostics.error(
        ...args
      );

      return;

    }

    console.error(...args);

  }

  catch(error){

    console.error(error);

  }

}



function safeChatRuntimeLogInfo(
  ...args
){

  try{

    const diagnostics =
    getChatRuntimeService(
      "diagnostics"
    );

    if(
      diagnostics &&
      typeof diagnostics.info ===
      "function"
    ){

      diagnostics.info(
        ...args
      );

      return;

    }

    console.info(...args);

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// RUNTIME READY
// =====================================

function isChatRuntimeReady(){

  return (

    chatRuntimeState
    ?.initialized === true

    &&

    chatRuntimeState
    ?.destroyed !== true

  );

}



// =====================================
// VALIDATE RUNTIME DEPENDENCIES
// =====================================

function validateChatRuntimeDependencies(){

  return (

    typeof ChatElements !==
    "undefined"

    &&

    typeof ChatElements.initialize ===
    "function"

  );

}



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

    const dependenciesReady =
    validateChatRuntimeDependencies();

    if(
      !dependenciesReady
    ){

      safeChatRuntimeLogError(
        "CHAT_RUNTIME_DEPENDENCIES_MISSING"
      );

      return false;

    }

    chatRuntimeState.initializing =
    true;



    // ============================
    // CHAT ELEMENTS
    // ============================

    const elementsReady =
    await Promise.resolve(

      ChatElements.initialize()

    );

    if(!elementsReady){

      safeChatRuntimeLogError(
        "CHAT_ELEMENTS_INIT_FAILED"
      );

      await resetChatRuntime();

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

        await ChatMarkdownRenderer
        .initialize();

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "MARKDOWN_INIT_WARNING",

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

        await ChatStreamManager
        .initialize();

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "STREAM_MANAGER_WARNING",

        error

      );

    }



    // ============================
    // REGISTER SERVICE
    // ============================

    try{

      if(

        typeof ServiceRegistry !==
        "undefined"

        &&

        typeof ServiceRegistry.register ===
        "function"

        &&

        !ServiceRegistry.has(
          "chat-runtime"
        )

      ){

        ServiceRegistry.register(

          "chat-runtime",

          ChatRuntime,

          {

            immutable:true,

            version:"1.0.0"

          }

        );

        ServiceRegistry.activate(
          "chat-runtime"
        );

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "CHAT_RUNTIME_REGISTER_FAILED",

        error

      );

    }



    // ============================
    // READY
    // ============================

    chatRuntimeState.initialized =
    true;

    chatRuntimeState.destroyed =
    false;

    safeChatRuntimeLogInfo(
      "CHAT_RUNTIME_READY"
    );

    return true;

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_INIT_ERROR",

      error

    );

    await resetChatRuntime();

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



    // ============================
    // STREAM MANAGER
    // ============================

    try{

      if(

        typeof ChatStreamManager !==
        "undefined"

        &&

        typeof ChatStreamManager.destroy ===
        "function"

      ){

        await Promise.resolve(
          ChatStreamManager.destroy()
        );

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "STREAM_DESTROY_ERROR",

        error

      );

    }



    // ============================
    // STREAM STATE
    // ============================

    try{

      if(
        typeof resetStreamingMessageState ===
        "function"
      ){

        resetStreamingMessageState();

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "STREAM_RESET_ERROR",

        error

      );

    }



    // ============================
    // MARKDOWN
    // ============================

    try{

      if(

        typeof ChatMarkdownRenderer !==
        "undefined"

        &&

        typeof ChatMarkdownRenderer.reset ===
        "function"

      ){

        ChatMarkdownRenderer.reset();

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "MARKDOWN_RESET_ERROR",

        error

      );

    }



    // ============================
    // ELEMENTS
    // ============================

    try{

      if(

        typeof ChatElements !==
        "undefined"

        &&

        typeof ChatElements.cleanup ===
        "function"

      ){

        ChatElements.cleanup();

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "ELEMENTS_CLEANUP_ERROR",

        error

      );

    }



    // ============================
    // CHAT STATE
    // ============================

    try{

      if(
        typeof resetChatState ===
        "function"
      ){

        resetChatState();

      }

    }

    catch(error){

      safeChatRuntimeLogError(

        "CHAT_STATE_RESET_ERROR",

        error

      );

    }

    chatRuntimeState.initialized =
    false;

    chatRuntimeState.initializing =
    false;

    chatRuntimeState.generating =
    false;

    chatRuntimeState.processing =
    false;

    chatRuntimeState.streaming =
    false;

    chatRuntimeState.destroyed =
    true;

    return true;

  }

  catch(error){

    safeChatRuntimeLogError(

      "RESET_CHAT_RUNTIME_ERROR",

      error

    );

    return false;

  }

}



// =====================================
// SEND
// =====================================

async function runtimeSendMessage(){

  try{

    if(
      !isChatRuntimeReady()
    ){

      return false;

    }

    if(
      typeof sendMessage !==
      "function"
    ){

      safeChatRuntimeLogError(
        "SEND_MESSAGE_MISSING"
      );

      return false;

    }

    return await sendMessage();

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_SEND_ERROR",

      error

    );

    return false;

  }

}



// =====================================
// PROCESS
// =====================================

async function runtimeProcessQueue(){

  try{

    if(
      !isChatRuntimeReady()
    ){

      return false;

    }

    if(
      chatRuntimeState.processing
    ){

      return false;

    }

    if(
      typeof processAIQueue !==
      "function"
    ){

      return false;

    }

    return await processAIQueue();

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_PROCESS_ERROR",

      error

    );

    return false;

  }

}



// =====================================
// ADD
// =====================================

function runtimeAddMessage(
  message
){

  try{

    if(
      !isChatRuntimeReady()
    ){

      return false;

    }

    if(
      typeof addMessage !==
      "function"
    ){

      return false;

    }

    return addMessage(
      message
    );

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_ADD_ERROR",

      error

    );

    return false;

  }

}



// =====================================
// RESET
// =====================================

async function runtimeResetChat(){

  try{

    if(
      typeof resetCurrentChat !==
      "function"
    ){

      return false;

    }

    return await resetCurrentChat();

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_RESET_ERROR",

      error

    );

    return false;

  }

}



// =====================================
// ABORT
// =====================================

async function runtimeAbortGeneration(){

  try{

    if(
      typeof abortMessageGeneration !==
      "function"
    ){

      return false;

    }

    return await abortMessageGeneration();

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_ABORT_ERROR",

      error

    );

    return false;

  }

}



// =====================================
// STATUS
// =====================================

function runtimeGetStatus(){

  try{

    if(
      typeof getChatRuntimeStatus !==
      "function"
    ){

      return null;

    }

    return getChatRuntimeStatus();

  }

  catch(error){

    safeChatRuntimeLogError(

      "CHAT_RUNTIME_STATUS_ERROR",

      error

    );

    return null;

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getChatRuntimeDiagnostics(){

  return runtimeGetStatus();

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

  add:
  runtimeAddMessage,

  reset:
  runtimeResetChat,

  abort:
  runtimeAbortGeneration,

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
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ChatRuntime",

    {

      value:
      ChatRuntime,

      writable:false,

      configurable:false

    }

  );

}
