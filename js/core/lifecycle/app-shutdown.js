// =====================================
// RIGO AI
// APP SHUTDOWN
// =====================================



// =====================================
// CLEANUP UI
// =====================================

function cleanupApplicationUI(){

  try{

    if(
      sendButton
    ){

      sendButton.disabled =
      false;

    }

    if(
      messageInput
    ){

      messageInput.disabled =
      false;

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CLEANUP MESSAGE RUNTIME
// =====================================

function cleanupMessageRuntime(){

  try{

    if(
      typeof messageRuntimeState !==
      "undefined"
    ){

      messageRuntimeState
      .sending =
      false;

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CLEANUP APP
// =====================================

async function cleanupApp(){

  try{

    cleanupMessageRuntime();

    cleanupApplicationUI();

    stopHealthchecks();



    // ================================
    // RUNTIME CLEANUP
    // ================================

    if(
      typeof RuntimeManager !==
      "undefined"
    ){

      await RuntimeManager
      .shutdown();

    }



    // ================================
    // STATE
    // ================================

    updateAppPhase(
      APP_PHASES
      .IDLE
    );

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "APP CLEANUP FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

}



// =====================================
// SHUTDOWN SNAPSHOT
// =====================================

function createShutdownSnapshot(){

  return Object.freeze({

    shuttingDown:

      Boolean(
        appState
        ?.shuttingDown
      ),

    started:

      Boolean(
        appState
        ?.started
      ),

    phase:

      String(
        appState
        ?.phase || ""
      ),

    shutdownAt:

      appState
      ?.shutdownAt ||

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// SHUTDOWN APP
// =====================================

async function shutdownApp(){

  if(
    appState
    .shuttingDown
  ){

    return false;

  }

  appState
  .shuttingDown =
  true;

  updateAppPhase(
    APP_PHASES
    .SHUTTING_DOWN
  );

  await emitAppEvent(
    "app.shutdown"
  );

  try{

    const cleaned =
    await cleanupApp();

    if(!cleaned){

      throw new Error(
        "APP CLEANUP FAILED"
      );

    }

    appState.started =
    false;

    appState.shutdownAt =
    Date.now();

    if(
      typeof logDiagnosticInfo ===
      "function"
    ){

      await logDiagnosticInfo(

        "APPLICATION SHUTDOWN COMPLETED"

      );

    }

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    if(
      typeof logCriticalError ===
      "function"
    ){

      await logCriticalError(

        "APPLICATION SHUTDOWN FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    appState
    .shuttingDown =
    false;

  }

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.cleanupApp =
  cleanupApp;

  window.shutdownApp =
  shutdownApp;

  window.createShutdownSnapshot =
  createShutdownSnapshot;

}
