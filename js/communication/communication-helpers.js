// =====================================
// HELPERS
// =====================================

function setCommunicationState(
  state
){

  communicationRuntimeState
  .state =
  state;

  return true;

}



function createCommunicationId(
  prefix = "comm"
){

  return (

    String(prefix) +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function communicationWait(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



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



function createMessageHash(
  message
){

  try{

    return btoa(

      JSON.stringify({

        content:
        message?.content,

        metadata:
        message?.metadata

      })

    );

  }

  catch(error){

    return createCommunicationId(
      "hash"
    );

  }

}



function cleanupProcessedHashes(){

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



function trimConversationHistory(){

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

    return false;

  }

}



function freezeCommunicationObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(

    value instanceof AbortController ||

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
