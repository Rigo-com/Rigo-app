// =====================================
// RIGO AI
// APP SHUTDOWN
// =====================================



// =====================================
// SHUTDOWN STATE
// =====================================

const shutdownRuntimeState =
Object.seal({

  shuttingDown:false,

  cleaned:false,

  lastShutdownAt:null,

  lastCleanupAt:null,

  lastError:null

});



// =====================================
// HELPERS
// =====================================

function updateShutdownState(
  updates = {}
){

  Object.assign(

    shutdownRuntimeState,

    updates

  );

  return true;

}



function normalizeShutdownError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



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
// CLEANUP RUNTIME
// =====================================

async function cleanupRuntimeSystems(){

  HealthMonitor
  .stop();

  if(
    typeof RuntimeManager !==
    "undefined"
  ){

    await RuntimeManager
    .shutdown();

  }

  return true;

}



// =====================================
// CLEANUP APP
// =====================================

async function cleanupApp(){

  try{

    cleanupMessageRuntime();

    cleanupApplicationUI();

    await cleanupRuntimeSystems();



    // ================================
    // STATE
    // ================================

    updateAppPhase(
      APP_PHASES
      .IDLE
    );

    updateShutdownState({

      cleaned:true,

      lastCleanupAt:
      Date.now()

    });

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    updateShutdownState({

      lastError:error

    });

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "APP CLEANUP FAILED",

        {

          error:
          normalizeShutdownError(
            error
          )

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

  return freezeEnvironmentObject({

    shuttingDown:

      Boolean(
        shutdownRuntimeState
        .shuttingDown
      ),

    cleaned:

      Boolean(
        shutdownRuntimeState
        .cleaned
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

      shutdownRuntimeState
      .lastShutdownAt ||

      null,

    cleanupAt:

      shutdownRuntimeState
      .lastCleanupAt ||

      null,

    lastError:

      shutdownRuntimeState
      .lastError

      ? normalizeShutdownError(
          shutdownRuntimeState
          .lastError
        )

      : null,

    timestamp:
    Date.now()

  });

}



// =====================================
// COMPLETE SHUTDOWN
// =====================================

async function completeShutdown(){

  appState.started =
  false;

  appState.shutdownAt =
  Date.now();

  updateShutdownState({

    lastShutdownAt:
    appState
    .shutdownAt

  });

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



// =====================================
// HANDLE SHUTDOWN ERROR
// =====================================

async function handleShutdownFailure(
  error
){

  appState.lastError =
  error;

  updateShutdownState({

    lastError:error

  });

  if(
    typeof logCriticalError ===
    "function"
  ){

    await logCriticalError(

      "APPLICATION SHUTDOWN FAILED",

      {

        error:
        normalizeShutdownError(
          error
        )

      }

    );

  }

  return false;

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

  updateShutdownState({

    shuttingDown:true,

    cleaned:false,

    lastError:null

  });

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

    await completeShutdown();

    return true;

  }

  catch(error){

    return handleShutdownFailure(
      error
    );

  }

  finally{

    appState
    .shuttingDown =
    false;

    updateShutdownState({

      shuttingDown:false

    });

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppShutdown =
Object.freeze({

  cleanup:
  cleanupApp,

  shutdown:
  shutdownApp,

  snapshot:
  createShutdownSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppShutdown =
  AppShutdown;

}
