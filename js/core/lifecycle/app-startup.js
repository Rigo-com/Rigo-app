// =====================================
// RIGO AI
// APP STARTUP
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeStartupObject(
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

      freezeStartupObject(
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

function getStartupDependency(
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
// STARTUP STATE
// =====================================

const startupRuntimeState =
Object.seal({

  starting:false,

  lastStartedAt:null,

  lastCompletedAt:null,

  lastDuration:null,

  lastError:null

});



// =====================================
// HELPERS
// =====================================

function updateStartupState(
  updates = {}
){

  Object.assign(

    startupRuntimeState,

    updates

  );

  return true;

}



function updateStartupAppState(
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



function normalizeStartupError(
  error
){

  const formatter =
  getStartupDependency(
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
// SAFE LOADING SCREEN
// =====================================

function hideSafeLoadingScreen(){

  try{

    const hideLoading =
    getStartupDependency(
      "hideLoadingScreen"
    );

    if(
      typeof hideLoading ===
      "function"
    ){

      hideLoading();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// STARTUP SNAPSHOT
// =====================================

function createStartupSnapshot(){

  return freezeStartupObject({

    starting:
    startupRuntimeState
    .starting,

    lastStartedAt:
    startupRuntimeState
    .lastStartedAt,

    lastCompletedAt:
    startupRuntimeState
    .lastCompletedAt,

    lastDuration:
    startupRuntimeState
    .lastDuration,

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

      appState
      ?.phase ||

      null,

    lastError:

      startupRuntimeState
      .lastError

      ? normalizeStartupError(
          startupRuntimeState
          .lastError
        )

      : null

  });

}



// =====================================
// START BOOTSTRAP
// =====================================

async function startBootstrapProcess(){

  const bootstrap =
  getStartupDependency(
    "AppBootstrap"
  );

  const coreConfig =
  getStartupDependency(
    "APP_CORE_CONFIG"
  );

  if(
    !bootstrap ||
    typeof bootstrap
    .initialize !==
    "function"
  ){

    throw new Error(
      "BOOTSTRAP UNAVAILABLE"
    );

  }

  await Promise.race([

    bootstrap
    .initialize(),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(

          new Error(
            "APP STARTUP TIMEOUT"
          )

        );

      },

      coreConfig
      ?.STARTUP_TIMEOUT

      ??

      15000);

    })

  ]);

  return true;

}



// =====================================
// START RUNTIME
// =====================================

async function startRuntimeManager(){

  const runtimeManager =
  getStartupDependency(
    "RuntimeManager"
  );

  if(
    !runtimeManager
  ){

    return true;

  }

  const booted =
  await runtimeManager
  .boot();

  if(!booted){

    throw new Error(
      "RUNTIME BOOT FAILED"
    );

  }

  return true;

}



// =====================================
// VALIDATE HEALTH
// =====================================

async function validateStartupHealth(){

  const healthRuntime =
  getStartupDependency(
    "HealthRuntime"
  );

  if(
    !healthRuntime ||
    typeof healthRuntime
    .run !==
    "function"
  ){

    throw new Error(
      "HEALTH RUNTIME UNAVAILABLE"
    );

  }

  const healthReport =
  await healthRuntime
  .run();

  if(
    !healthReport
    ?.healthy
  ){

    throw new Error(
      "APPLICATION HEALTHCHECK FAILED"
    );

  }

  return true;

}



// =====================================
// COMPLETE STARTUP
// =====================================

async function completeStartupProcess(){

  updateStartupAppState({

    started:true,

    initialized:true,

    initializedAt:
    Date.now(),

    startupCompletedAt:
    Date.now()

  });

  appState.startupDuration =

    appState
    .startupCompletedAt -

    appState
    .startupStartedAt;

  updateStartupState({

    lastCompletedAt:

      appState
      .startupCompletedAt,

    lastDuration:

      appState
      .startupDuration

  });

  const updatePhase =
  getStartupDependency(
    "updateAppPhase"
  );

  const phases =
  getStartupDependency(
    "APP_PHASES"
  );

  if(
    typeof updatePhase ===
    "function" &&
    phases
  ){

    updatePhase(
      phases.READY
    );

  }

  const healthMonitor =
  getStartupDependency(
    "HealthMonitor"
  );

  if(
    healthMonitor &&
    typeof healthMonitor
    .start ===
    "function"
  ){

    healthMonitor
    .start();

  }

  hideSafeLoadingScreen();

  const appEmitter =
  getStartupDependency(
    "emitAppEvent"
  );

  if(
    typeof appEmitter ===
    "function"
  ){

    await appEmitter(
      "app.ready"
    );

  }

  const diagnosticsInfo =
  getStartupDependency(
    "logDiagnosticInfo"
  );

  if(
    typeof diagnosticsInfo ===
    "function"
  ){

    await diagnosticsInfo(

      "RIGO AI READY",

      {

        startupDuration:

          appState
          .startupDuration

      }

    );

  }

  const performanceTracker =
  getStartupDependency(
    "trackPerformanceMetric"
  );

  if(
    typeof performanceTracker ===
    "function"
  ){

    await performanceTracker(

      "app.startup",

      appState
      .startupDuration

    );

  }

  return true;

}



// =====================================
// HANDLE STARTUP ERROR
// =====================================

async function handleStartupFailure(
  error
){

  appState.failedStarts++;

  appState.lastError =
  error;

  updateStartupState({

    lastError:error

  });

  const updatePhase =
  getStartupDependency(
    "updateAppPhase"
  );

  const phases =
  getStartupDependency(
    "APP_PHASES"
  );

  if(
    typeof updatePhase ===
    "function" &&
    phases
  ){

    updatePhase(
      phases.ERROR
    );

  }



  // ===================================
  // CLEANUP
  // ===================================

  const cleanup =
  getStartupDependency(
    "cleanupApp"
  );

  if(
    typeof cleanup ===
    "function"
  ){

    await cleanup();

  }

  if(
    typeof document !==
    "undefined" &&

    document.body
  ){

    document.body.classList.add(
      "app-error"
    );

  }

  hideSafeLoadingScreen();



  // ===================================
  // DIAGNOSTICS
  // ===================================

  const criticalLogger =
  getStartupDependency(
    "logCriticalError"
  );

  if(
    typeof criticalLogger ===
    "function"
  ){

    await criticalLogger(

      "APPLICATION STARTUP FAILED",

      {

        error:
        normalizeStartupError(
          error
        )

      }

    );

  }

  const appEmitter =
  getStartupDependency(
    "emitAppEvent"
  );

  if(
    typeof appEmitter ===
    "function"
  ){

    await appEmitter(

      "app.error",

      {

        error:
        normalizeStartupError(
          error
        )

      }

    );

  }



  // ===================================
  // RECOVERY
  // ===================================

  const coreConfig =
  getStartupDependency(
    "APP_CORE_CONFIG"
  );

  const recovery =
  getStartupDependency(
    "recoverApplication"
  );

  if(

    coreConfig
    ?.ENABLE_RECOVERY &&

    typeof recovery ===
    "function"

  ){

    await recovery();

  }

  return false;

}



// =====================================
// START APP
// =====================================

async function startApp(){

  if(

    appState.started ||

    appState.starting ||

    startupRuntimeState
    .starting

  ){

    return false;

  }

  updateStartupState({

    starting:true,

    lastStartedAt:
    Date.now(),

    lastError:null

  });

  updateStartupAppState({

    starting:true,

    startupStartedAt:

      startupRuntimeState
      .lastStartedAt

  });

  const updatePhase =
  getStartupDependency(
    "updateAppPhase"
  );

  const phases =
  getStartupDependency(
    "APP_PHASES"
  );

  const appEmitter =
  getStartupDependency(
    "emitAppEvent"
  );

  if(
    typeof updatePhase ===
    "function" &&
    phases
  ){

    updatePhase(
      phases.PREINIT
    );

  }

  if(
    typeof appEmitter ===
    "function"
  ){

    await appEmitter(
      "app.preinit"
    );

  }

  try{



    // ================================
    // BOOTING
    // ================================

    if(
      typeof updatePhase ===
      "function" &&
      phases
    ){

      updatePhase(
        phases.BOOTING
      );

    }

    if(
      typeof appEmitter ===
      "function"
    ){

      await appEmitter(
        "app.booting"
      );

    }



    // ================================
    // BOOTSTRAP
    // ================================

    await startBootstrapProcess();



    // ================================
    // RUNTIME
    // ================================

    await startRuntimeManager();



    // ================================
    // HEALTH
    // ================================

    await validateStartupHealth();



    // ================================
    // COMPLETE
    // ================================

    await completeStartupProcess();

    return true;

  }

  catch(error){

    return await handleStartupFailure(
      error
    );

  }

  finally{

    updateStartupAppState({

      starting:false

    });

    updateStartupState({

      starting:false

    });

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppStartup =
Object.freeze({

  start:
  startApp,

  snapshot:
  createStartupSnapshot,

  diagnostics:
  createStartupSnapshot

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

    "AppStartup",

    {

      value:
      AppStartup,

      writable:
      false,

      configurable:
      false

    }

  );

}
