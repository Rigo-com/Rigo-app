// =====================================
// RIGO AI
// COMMUNICATION HELPERS
// =====================================



// =====================================
// SAFE CLONE
// =====================================

function safeCommunicationClone(
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
// MESSAGE HASH
// =====================================

function createMessageHash(
  message
){

  try{

    const normalized =

      JSON.stringify({

        content:
        message?.content,

        metadata:
        message?.metadata

      });

    if(
      typeof btoa ===
      "function"
    ){

      return btoa(

        encodeURIComponent(
          normalized
        )

      );

    }

    return createCommunicationId(
      "hash"
    );

  }

  catch(error){

    return createCommunicationId(
      "hash"
    );

  }

}



// =====================================
// CLEANUP HASHES
// =====================================

function cleanupProcessedHashes(){

  const now =
  Date.now();

  communicationRuntimeState
  .processedHashes
  .forEach((timestamp,key) => {

    if(

      now - timestamp >

      COMMUNICATION_RUNTIME_CONFIG
      .HASH_TTL

    ){

      communicationRuntimeState
      .processedHashes
      .delete(key);

    }

  });

  if(

    communicationRuntimeState
    .processedHashes
    .size <=

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_HASH_CACHE

  ){

    return;
  }

  const keys = [

    ...communicationRuntimeState
    .processedHashes
    .keys()

  ];

  const overflow =

    keys.length -

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_HASH_CACHE;

  for(
    let index = 0;
    index < overflow;
    index++
  ){

    communicationRuntimeState
    .processedHashes
    .delete(
      keys[index]
    );

  }

}



// =====================================
// CLEANUP CONVERSATIONS
// =====================================

function trimConversationHistory(){

  const now =
  Date.now();

  communicationRuntimeState
  .conversations
  .forEach((conversation,key) => {

    if(

      now -

      (
        conversation?.createdAt ||
        0
      )

      >

      COMMUNICATION_RUNTIME_CONFIG
      .CONVERSATION_TTL

    ){

      communicationRuntimeState
      .conversations
      .delete(key);

    }

  });

  if(

    communicationRuntimeState
    .conversations
    .size <=

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_CONVERSATIONS

  ){

    return;
  }

  const keys = [

    ...communicationRuntimeState
    .conversations
    .keys()

  ];

  const overflow =

    keys.length -

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_CONVERSATIONS;

  for(
    let index = 0;
    index < overflow;
    index++
  ){

    communicationRuntimeState
    .conversations
    .delete(
      keys[index]
    );

  }

}



// =====================================
// EVENTS
// =====================================

async function emitCommunicationEvent(
  eventName,
  payload = {}
){

  if(

    !COMMUNICATION_RUNTIME_CONFIG
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
        "communication-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "COMMUNICATION_EVENT_ERROR:",
        error
      );

    }

    return false;

  }

}



// =====================================
// FREEZE OBJECT
// =====================================

function freezeCommunicationObject(
  value,
  visited = new WeakSet()
){

  try{

    if(

      !value ||

      typeof value !==
      "object"

    ){

      return value;

    }

    if(

      value instanceof AbortController ||

      value instanceof AbortSignal ||

      value instanceof Map ||

      value instanceof Set ||

      value instanceof WeakMap ||

      value instanceof WeakSet

    ){

      return value;

    }

    if(
      visited.has(value)
    ){

      return value;

    }

    visited.add(
      value
    );

    Object.freeze(
      value
    );

    Object.values(value)
    .forEach((nestedValue) => {

      if(

        nestedValue &&

        typeof nestedValue ===
        "object"

      ){

        freezeCommunicationObject(
          nestedValue,
          visited
        );

      }

    });

    return value;

  }

  catch(error){

    return value;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateCommunicationMessage(
  message
){

  if(

    !message ||

    typeof message !==
    "object"

  ){

    return false;

  }

  if(

    typeof message.content !==
    "string"

  ){

    return false;

  }

  if(

    message.content
    .trim()
    .length === 0

  ){

    return false;

  }

  const maxLength =

    Number.isFinite(

      APP_CONFIG
      ?.CHAT
      ?.MAX_MESSAGE_LENGTH

    )

    ?

    APP_CONFIG
    .CHAT
    .MAX_MESSAGE_LENGTH

    :

    10000;

  if(

    message.content
    .length >

    maxLength

  ){

    return false;

  }

  if(

    message.metadata !==
    undefined

    &&

    (

      typeof message.metadata !==
      "object"

      ||

      Array.isArray(
        message.metadata
      )

    )

  ){

    return false;

  }

  return true;

}
