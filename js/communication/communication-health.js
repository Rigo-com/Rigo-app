// =====================================
// RIGO AI
// COMMUNICATION HEALTH
// =====================================


// =====================================
// INTERNAL HELPERS
// =====================================

function cleanupProcessedHashes(){

  const now =
  Date.now();

  communicationRuntimeState
  .processedHashes
  .forEach((timestamp,hash) => {

    const expired =

      now - timestamp >

      COMMUNICATION_RUNTIME_CONFIG
      .HASH_TTL;

    if(expired){

      communicationRuntimeState
      .processedHashes
      .delete(hash);

    }

  });

  return true;

}



function trimConversationHistory(){

  const limit =

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_CONVERSATIONS;

  if(

    communicationRuntimeState
    .conversations
    .size <= limit

  ){

    return true;

  }

  const overflow =

    communicationRuntimeState
    .conversations
    .size - limit;

  const keys = [

    ...communicationRuntimeState
    .conversations
    .keys()

  ];

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

  return true;

}



async function stopTypingIndicator(){

  communicationRuntimeState
  .typing =
  false;

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .TYPING_STOPPED

  );

  return true;

}



async function processCommunicationQueue(){

  if(
    communicationRuntimeState
    .processing
  ){

    return false;

  }

  communicationRuntimeState
  .processing =
  true;

  try{

    while(

      communicationRuntimeState
      .messageQueue
      .length > 0

    ){

      communicationRuntimeState
      .messageQueue
      .shift();

    }

    return true;

  }

  finally{

    communicationRuntimeState
    .processing =
    false;

  }

}

// =====================================
// HEALTH CHECK
// =====================================

async function monitorCommunicationHealth(){

  try{

    if(
      communicationRuntimeState
      .destroyed
    ){

      throw new Error(
        "COMMUNICATION_DESTROYED"
      );

    }

    if(

      communicationRuntimeState
      .state ===

      COMMUNICATION_RUNTIME_STATES
      .FAILED

    ){

      throw new Error(
        "COMMUNICATION_FAILED"
      );

    }

    cleanupProcessedHashes();

    trimConversationHistory();

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "COMMUNICATION_HEALTH_ERROR:",
        error
      );

    }

    if(

      COMMUNICATION_RUNTIME_CONFIG
      .ENABLE_RECOVERY

    ){

      await recoverCommunicationRuntime();

    }

    return false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverCommunicationRuntime(){

  if(
    communicationRuntimeState
    .recovering
  ){

    return false;

  }

  communicationRuntimeState
  .recovering =
  true;

  communicationRuntimeState
  .diagnostics
  .recoveries++;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .RECOVERING

  );

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .RECOVERY_STARTED

  );

  try{

    await stopTypingIndicator();

    abortAllCommunicationMessages();

    communicationRuntimeState
    .processing =
    false;

    communicationRuntimeState
    .streaming =
    false;

    communicationRuntimeState
    .typing =
    false;

    communicationRuntimeState
    .activeStreams
    .clear();

    communicationRuntimeState
    .activeRequests
    .clear();

    communicationRuntimeState
    .abortControllers
    .clear();

    if(

      communicationRuntimeState
      .messageQueue
      .length > 0

    ){

      await processCommunicationQueue();

    }

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .RECOVERY_COMPLETED

    );

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "COMMUNICATION_RECOVERY_ERROR:",
        error
      );

    }

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .FAILED

    );

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .MESSAGE_FAILED,

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    communicationRuntimeState
    .recovering =
    false;

  }

}


// =====================================
// PUBLIC API
// =====================================

const CommunicationHealth =
Object.freeze({

  monitor:
  monitorCommunicationHealth,

  recover:
  recoverCommunicationRuntime

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.CommunicationHealth =
  CommunicationHealth;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis
  .CommunicationHealth =
  CommunicationHealth;

}
