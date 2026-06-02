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

export async function emitChatRuntimeEvent(
  eventName,
  payload = {}
){

  if(
    !CHAT_RUNTIME_CONFIG
    ?.ENABLE_EVENTS
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

  if(
    typeof emitSystemEvent !==
    "function"
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

    await emitSystemEvent(

      normalizedEvent,

      Object.freeze({

        source:
        "chat-runtime",

        timestamp:
        Date.now(),

        ...safePayload

      })

    );

    return true;

  }

  catch(error){

    console.error(
      "CHAT EVENT ERROR:",
      error
    );

    return false;

  }

}
