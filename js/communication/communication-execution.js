// =====================================
// RIGO AI
// COMMUNICATION EXECUTION
// =====================================



// =====================================
// QUEUE
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



// =====================================
// STREAMS
// =====================================

async function startCommunicationStream(
  streamId
){

  if(

    communicationRuntimeState
    .activeStreams
    .has(streamId)

  ){

    return false;

  }

  communicationRuntimeState
  .streaming =
  true;

  communicationRuntimeState
  .activeStreams
  .set(

    streamId,

    freezeCommunicationObject({

      startedAt:
      Date.now()

    })

  );

  communicationRuntimeState
  .diagnostics
  .streams++;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .STREAMING

  );

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .STREAM_STARTED,

    {

      streamId

    }

  );

  return true;

}



async function stopCommunicationStream(
  streamId
){

  if(

    !communicationRuntimeState
    .activeStreams
    .has(streamId)

  ){

    return false;

  }

  communicationRuntimeState
  .activeStreams
  .delete(
    streamId
  );

  if(

    communicationRuntimeState
    .activeStreams
    .size === 0

  ){

    communicationRuntimeState
    .streaming =
    false;

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

  }

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .STREAM_COMPLETED,

    {

      streamId

    }

  );

  return true;

}



// =====================================
// TYPING
// =====================================

async function startTypingIndicator(){

  if(

    !COMMUNICATION_RUNTIME_CONFIG
    .ENABLE_TYPING_INDICATOR

  ){

    return false;

  }

  if(
    communicationRuntimeState
    .typing
  ){

    return true;

  }

  communicationRuntimeState
  .typing =
  true;

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .TYPING_STARTED

  );

  return true;

}



async function stopTypingIndicator(){

  if(
    !communicationRuntimeState
    .typing
  ){

    return true;

  }

  communicationRuntimeState
  .typing =
  false;

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .TYPING_STOPPED

  );

  return true;

}



// =====================================
// ABORT
// =====================================

function abortCommunicationMessage(
  requestId
){

  const controller =

    communicationRuntimeState
    .abortControllers
    .get(
      requestId
    );

  if(!controller){

    return false;

  }

  try{

    controller.abort();

  }

  catch(error){

    return false;

  }

  communicationRuntimeState
  .abortControllers
  .delete(
    requestId
  );

  communicationRuntimeState
  .activeRequests
  .delete(
    requestId
  );

  communicationRuntimeState
  .diagnostics
  .aborted++;

  emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .MESSAGE_ABORTED,

    {

      requestId

    }

  );

  return true;

}



function abortAllCommunicationMessages(){

  communicationRuntimeState
  .abortControllers
  .forEach((controller) => {

    try{

      controller.abort();

    }

    catch(error){

    }

  });

  communicationRuntimeState
  .abortControllers
  .clear();

  communicationRuntimeState
  .activeRequests
  .clear();

  return true;

}
