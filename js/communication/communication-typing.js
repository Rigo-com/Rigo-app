// =====================================
// RIGO AI
// COMMUNICATION TYPING
// =====================================



// =====================================
// START TYPING
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



// =====================================
// STOP TYPING
// =====================================

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
