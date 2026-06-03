// =====================================
// RIGO AI
// CHAT EVENTS
// =====================================

import {
  CHAT_RUNTIME_CONFIG
}
from "./chat-config.js";



// =====================================
// EMIT CHAT EVENT
// =====================================

async function emitChatRuntimeEvent(
  emitter,
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
    typeof emitter !==
    "function"
  ){
    return false;
  }

  if(
    typeof eventName !==
    "string"
  ){
    return false;
  }

  const normalizedEvent =
  eventName.trim();

  if(
    normalizedEvent.length <= 0
  ){
    return false;
  }

  const safePayload =

    payload &&

    typeof payload ===
    "object"

    &&

    !Array.isArray(
      payload
    )

    ?

    payload

    :

    {};

  try{

    await emitter(

      normalizedEvent,

      {

        source:
        "chat-runtime",

        timestamp:
        Date.now(),

        ...safePayload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const ChatEvents =
Object.freeze({

  emit:
  emitChatRuntimeEvent

});



// =====================================
// EXPORTS
// =====================================

export {

  emitChatRuntimeEvent,

  ChatEvents

};

export default
ChatEvents;
