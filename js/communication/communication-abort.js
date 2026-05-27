// =====================================
// RIGO AI
// COMMUNICATION ABORT
// =====================================



// =====================================
// ABORT MESSAGE
// =====================================

async function abortCommunicationMessage(
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

  await emitCommunicationEvent(

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
  .diagnostics
  .aborted +=

  communicationRuntimeState
  .abortControllers
  .size;

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



// =====================================
// PUBLIC API
// =====================================

const CommunicationAbort =
Object.freeze({

  abort:
  abortCommunicationMessage,

  abortAll:
  abortAllCommunicationMessages

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.CommunicationAbort =
  CommunicationAbort;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.CommunicationAbort =
  CommunicationAbort;

}
