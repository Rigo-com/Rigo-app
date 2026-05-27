// =====================================
// RIGO AI
// COMMUNICATION QUEUE
// =====================================



// =====================================
// ENQUEUE
// =====================================

async function enqueueCommunicationMessage(
  payload
){

  if(

    communicationRuntimeState
    .messageQueue
    .length >=

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_QUEUE_SIZE

  ){

    return false;

  }

  const payloadHash =
  createMessageHash(
    payload
  );

  const duplicate =

    communicationRuntimeState
    .messageQueue
    .some((message) => {

      return (

        createMessageHash(
          message
        ) ===
        payloadHash

      );

    });

  if(
    duplicate
  ){

    communicationRuntimeState
    .diagnostics
    .duplicatesPrevented++;

    return false;

  }

  communicationRuntimeState
  .messageQueue
  .push(

    safeCommunicationClone(
      payload
    )

  );

  communicationRuntimeState
  .diagnostics
  .queued++;

  if(
    typeof persistCommunicationState ===
    "function"
  ){

    persistCommunicationState();

  }

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .MESSAGE_QUEUED,

    {

      messageId:
      payload?.id ||
      null

    }

  );

  return true;

}



// =====================================
// PROCESS QUEUE
// =====================================

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

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .PROCESSING

  );

  try{

    while(

      communicationRuntimeState
      .messageQueue
      .length > 0

    ){

      const payload =

        communicationRuntimeState
        .messageQueue[0];

      if(!payload){

        communicationRuntimeState
        .messageQueue
        .shift();

        continue;

      }

      try{

        await executeCommunicationMessage(
          payload
        );

        communicationRuntimeState
        .messageQueue
        .shift();

      }

      catch(error){

        communicationRuntimeState
        .diagnostics
        .failed++;

        await emitCommunicationEvent(

          COMMUNICATION_RUNTIME_EVENTS
          .MESSAGE_FAILED,

          {

            error:
            String(error),

            messageId:
            payload?.id ||
            null

          }

        );

        if(
          COMMUNICATION_RUNTIME_CONFIG
          .DEBUG
        ){

          console.error(
            "COMMUNICATION_QUEUE_ERROR:",
            error
          );

        }

        break;

      }

      await wait(0);

    }

    if(
      typeof persistCommunicationState ===
      "function"
    ){

      persistCommunicationState();

    }

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

    return true;

  }

  finally{

    communicationRuntimeState
    .processing =
    false;

  }

}


// =====================================
// PUBLIC API
// =====================================

const CommunicationQueue =
Object.freeze({

  enqueue:
  enqueueCommunicationMessage,

  process:
  processCommunicationQueue

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window
  .CommunicationQueue =
  CommunicationQueue;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis
  .CommunicationQueue =
  CommunicationQueue;

}
