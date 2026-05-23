// =====================================
// RIGO AI
// CHAT INDEX
// ENTERPRISE CHAT EXPORTS
// =====================================



// =====================================
// VALIDATE DEPENDENCIES
// =====================================

function validateChatDependencies(){

  return (

    typeof ChatRuntime !==
    "undefined"

  );

}



// =====================================
// CHAT EXPORTS
// =====================================

const ChatModule =
Object.freeze({

  runtime:
  ChatRuntime,

  initialize:
  ChatRuntime
  ?.initialize,

  send:
  ChatRuntime
  ?.send,

  process:
  ChatRuntime
  ?.process,

  add:
  ChatRuntime
  ?.add,

  reset:
  ChatRuntime
  ?.reset,

  abort:
  ChatRuntime
  ?.abort,

  status:
  ChatRuntime
  ?.status,

  resetRuntime:
  ChatRuntime
  ?.resetRuntime

});



// =====================================
// SAFE GLOBAL EXPORT
// =====================================

if(
  validateChatDependencies()
){

  try{

    globalThis.ChatModule =
    ChatModule;

  }

  catch(error){

    console.error(
      "[CHAT INDEX EXPORT ERROR]:",
      error
    );

  }

}
