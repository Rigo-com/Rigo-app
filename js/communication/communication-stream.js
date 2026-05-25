// =====================================
// RIGO AI
// COMMUNICATION STREAM
// =====================================



// =====================================
// START STREAM
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



// =====================================
// STOP STREAM
// =====================================

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
