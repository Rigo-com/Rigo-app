// =====================================
// RIGO AI
// APP SHUTDOWN
// =====================================



// =====================================
// CLEANUP APP
// =====================================

function cleanupApp(){

  sendingMessage =
  false;

  if(sendButton){

    sendButton.disabled =
    false;

  }

  if(messageInput){

    messageInput.disabled =
    false;

  }

  stopHealthchecks();

  updateAppPhase(
    APP_PHASES.IDLE
  );

  return true;

}



// =====================================
// SHUTDOWN APP
// =====================================

async function shutdownApp(){

  if(
    appState.shuttingDown
  ){

    return false;

  }

  appState.shuttingDown =
  true;

  updateAppPhase(
    APP_PHASES.SHUTTING_DOWN
  );

  await emitAppEvent(
    "app.shutdown"
  );

  try{

    cleanupApp();

    stopHealthchecks();

    appState.started =
    false;

    appState.shutdownAt =
    Date.now();

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    return false;

  }

  finally{

    appState.shuttingDown =
    false;

  }

}
