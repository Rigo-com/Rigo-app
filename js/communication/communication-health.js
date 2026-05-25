// =====================================
// RIGO AI
// COMMUNICATION HEALTH
// =====================================



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
