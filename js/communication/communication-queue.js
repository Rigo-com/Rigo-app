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

  const duplicate =

    communicationRuntimeState
    .messageQueue
    .some((message) => {

      return (
        message.content ===
        payload.content
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
  .push(payload);

  communicationRuntimeState
  .diagnostics
  .queued++;

  persistCommunicationState();

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .MESSAGE_QUEUED,

    {

      messageId:
      payload.id

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
        .messageQueue
        .shift();

      if(!payload){

        continue;

      }

      try{

        await executeCommunicationMessage(
          payload
        );

      }

      catch(error){

        communicationRuntimeState
        .diagnostics
        .failed++;

      }

      await wait(0);

    }

    persistCommunicationState();

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
