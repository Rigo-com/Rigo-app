// =====================================
// RIGO AI
// APP SHUTDOWN
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeShutdownObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeShutdownObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// DEPENDENCIES
// =====================================

function getShutdownDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return window[
      dependencyName
    ] || null;

  }

  catch(error){

    return null;

  }

}



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



function updateShutdownAppState(
  updates = {}
){

  if(
    typeof appState !==
    "object" ||

    !appState
  ){

    return false;

  }

  Object.assign(
    appState,
    updates
  );

  return true;

}



function normalizeShutdownError(
  error
){

  const formatter =
  getShutdownDependency(
    "getSafeErrorMessage"
  );

  if(
    typeof formatter ===
    "function"
  ){

    return formatter(
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

    const sendButton =
    getShutdownDependency(
      "sendButton"
    );

    const messageInput =
    getShutdownDependency(
      "messageInput"
    );

    if(sendButton){

      sendButton.disabled =
      false;

    }

    if(messageInput){

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

    const messageRuntimeState =
    getShutdownDependency(
      "messageRuntimeState"
    );

    if(
      messageRuntimeState
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

  const healthMonitor =
  getShutdownDependency(
    "HealthMonitor"
  );

  if(
    healthMonitor &&
    typeof healthMonitor
    .stop ===
    "function"
  ){

    await healthMonitor
    .stop();

  }

  const runtimeManager =
  getShutdownDependency(
    "RuntimeManager"
  );

  if(
    runtimeManager &&
    typeof runtimeManager
    .shutdown ===
    "function"
  ){

    await runtimeManager
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

    const updatePhase =
    getShutdownDependency(
      "updateAppPhase"
    );

    const phases =
    getShutdownDependency(
      "APP_PHASES"
    );

    if(
      typeof updatePhase ===
      "function" &&
      phases
    ){

      updatePhase(
        phases.IDLE
      );

    }

    updateShutdownState({

      cleaned:true,

      lastCleanupAt:
      Date.now()

    });

    return true;

  }

  catch(error){

    updateShutdownAppState({

      lastError:error

    });

    updateShutdownState({

      lastError:error

    });

    const diagnosticsError =
    getShutdownDependency(
      "logDiagnosticError"
    );

    if(
      typeof diagnosticsError ===
      "function"
    ){

      await diagnosticsError(

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

  return freezeShutdownObject({

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

    initialized:

      Boolean(
        appState
        ?.initialized
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

    crashCount:

      Number(
        appState
        ?.crashCount || 0
      ),

    shutdownAt:

      shutdownRuntimeState
      .lastShutdownAt ||

      null,

    cleanupAt:

      shutdownRuntimeState
      .lastCleanupAt ||

      null,

    cleanupDuration:

      shutdownRuntimeState
      .lastShutdownAt &&

      shutdownRuntimeState
      .lastCleanupAt

      ?

      shutdownRuntimeState
      .lastShutdownAt -

      shutdownRuntimeState
      .lastCleanupAt

      :

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

  updateShutdownAppState({

    started:false,

    shutdownAt:
    Date.now()

  });

  updateShutdownState({

    lastShutdownAt:
    appState
    .shutdownAt

  });

  const diagnosticsInfo =
  getShutdownDependency(
    "logDiagnosticInfo"
  );

  if(
    typeof diagnosticsInfo ===
    "function"
  ){

    await diagnosticsInfo(

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

  updateShutdownAppState({

    lastError:error

  });

  updateShutdownState({

    lastError:error

  });

  const criticalLogger =
  getShutdownDependency(
    "logCriticalError"
  );

  if(
    typeof criticalLogger ===
    "function"
  ){

    await criticalLogger(

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
    ?.shuttingDown
  ){

    return false;

  }

  updateShutdownAppState({

    shuttingDown:true

  });

  updateShutdownState({

    shuttingDown:true,

    cleaned:false,

    lastError:null

  });

  const updatePhase =
  getShutdownDependency(
    "updateAppPhase"
  );

  const phases =
  getShutdownDependency(
    "APP_PHASES"
  );

  if(
    typeof updatePhase ===
    "function" &&
    phases
  ){

    updatePhase(
      phases
      .SHUTTING_DOWN
    );

  }

  const appEmitter =
  getShutdownDependency(
    "emitAppEvent"
  );

  if(
    typeof appEmitter ===
    "function"
  ){

    await appEmitter(
      "app.shutdown"
    );

  }

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

    return await handleShutdownFailure(
      error
    );

  }

  finally{

    updateShutdownAppState({

      shuttingDown:false

    });

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
  createShutdownSnapshot,

  diagnostics:
  createShutdownSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "AppShutdown",

    {

      value:
      AppShutdown,

      writable:
      false,

      configurable:
      false

    }

  );

}
