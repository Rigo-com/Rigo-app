// =====================================
// RIGO AI
// CHAT RUNTIME
// ENTERPRISE CHAT ORCHESTRATOR
// =====================================



// =====================================
// INITIALIZE
// =====================================

function initializeChatRuntime(){

  if(
    chatRuntimeState
    .initialized
  ){

    return true;

  }

  const elementsReady =

    typeof ChatElements !==
    "undefined"

    &&

    ChatElements
    .initialize();

  if(!elementsReady){

    return false;

  }

  const markdownReady =

    typeof ChatMarkdownRenderer !==
    "undefined"

    &&

    ChatMarkdownRenderer
    .initialize();

  if(!markdownReady){

    return false;

  }

  const streamReady =

    typeof ChatStreamManager !==
    "undefined"

    &&

    ChatStreamManager
    .initialize();

  if(!streamReady){

    return false;

  }

  chatRuntimeState
  .initialized =
  true;

  return true;

}



// =====================================
// RESET RUNTIME
// =====================================

async function resetChatRuntime(){

  await abortMessageGeneration();

  if(
    typeof ChatStreamManager !==
    "undefined"
  ){

    ChatStreamManager
    .destroy();

  }

  if(
    typeof ChatMarkdownRenderer !==
    "undefined"
  ){

    ChatMarkdownRenderer
    .reset();

  }

  if(
    typeof ChatElements !==
    "undefined"
  ){

    ChatElements
    .reset();

  }

  resetChatState();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatRuntime =
Object.freeze({

  initialize:
  initializeChatRuntime,

  send:
  sendMessage,

  process:
  processAIQueue,

  add:
  addMessage,

  reset:
  resetCurrentChat,

  abort:
  abortMessageGeneration,

  status:
  getChatRuntimeStatus,

  resetRuntime:
  resetChatRuntime

});
