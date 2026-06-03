// =====================================
// RIGO AI
// CHAT UTILS
// =====================================

import {
  chatRuntimeState
}
from "./chat-state.js";



// =====================================
// SAFE CHAT CLONE
// =====================================

export function safeChatClone(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// WAIT
// =====================================

export function wait(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(

      resolve,

      Math.max(
        0,
        Number(duration) || 0
      )

    );

  });

}



// =====================================
// CREATE QUEUE ITEM
// =====================================

export function createQueueItem(
  messageId
){

  if(
    !messageId
  ){

    return null;

  }

  return Object.freeze({

    id:
    String(messageId),

    createdAt:
    Date.now(),

    retries:0

  });

}
