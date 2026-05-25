// =====================================
// RIGO AI
// COMMUNICATION ABORT
// =====================================



// =====================================
// ABORT MESSAGE
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



// =====================================
// ABORT ALL
// =====================================

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
