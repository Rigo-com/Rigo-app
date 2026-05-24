// =====================================
// EMIT CHAT EVENT
// =====================================

async function emitChatRuntimeEvent(
  eventName,
  payload = {}
){

  if(

    !CHAT_RUNTIME_CONFIG
    .ENABLE_EVENTS

  ){

    return false;

  }

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "chat-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    safeLogError?.(
      "CHAT EVENT ERROR:",
      error
    );

    return false;

  }

}
