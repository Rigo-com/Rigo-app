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
    .typing === true

  ){

    return true;

  }

  communicationRuntimeState
  .typing =
  true;

  try{

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .TYPING_STARTED,

      {

        timestamp:
        Date.now()

      }

    );

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "COMMUNICATION_TYPING_START_ERROR:",
        error
      );

    }

  }

  return true;

}



// =====================================
// STOP TYPING
// =====================================

async function stopTypingIndicator(){

  if(

    communicationRuntimeState
    .typing !== true

  ){

    return true;

  }

  communicationRuntimeState
  .typing =
  false;

  try{

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .TYPING_STOPPED,

      {

        timestamp:
        Date.now()

      }

    );

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "COMMUNICATION_TYPING_STOP_ERROR:",
        error
      );

    }

  }

  return true;

}
