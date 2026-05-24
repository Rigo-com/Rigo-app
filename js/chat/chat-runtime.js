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
