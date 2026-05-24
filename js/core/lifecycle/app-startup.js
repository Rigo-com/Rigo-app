// =====================================
// RIGO AI
// APP STARTUP
// =====================================



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



function normalizeStartupError(
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
// SAFE LOADING SCREEN
// =====================================

function hideSafeLoadingScreen(){

  try{

    if(
      typeof hideLoadingScreen ===
      "function"
    ){

      hideLoadingScreen();

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

  return freezeEnvironmentObject({

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

  await Promise.race([

    AppBootstrap
    .initialize(),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(

          new Error(
            "APP STARTUP TIMEOUT"
          )

        );

      },

      APP_CORE_CONFIG
      .STARTUP_TIMEOUT);

    })

  ]);

  return true;

}



// =====================================
// START RUNTIME
// =====================================

async function startRuntimeManager(){

  if(
    typeof RuntimeManager ===
    "undefined"
  ){

    return true;

  }

  const booted =
  await RuntimeManager
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

  const healthReport =
  await HealthRuntime
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

  appState.started =
  true;

  appState.initialized =
  true;

  appState.initializedAt =
  Date.now();

  appState.startupCompletedAt =
  Date.now();

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

  updateAppPhase(
    APP_PHASES
    .READY
  );

  HealthMonitor
  .start();

  hideSafeLoadingScreen();

  await emitAppEvent(
    "app.ready"
  );

  if(
    typeof logDiagnosticInfo ===
    "function"
  ){

    await logDiagnosticInfo(

      "RIGO AI READY",

      {

        startupDuration:

          appState
          .startupDuration

      }

    );

  }

  if(
    typeof trackPerformanceMetric ===
    "function"
  ){

    trackPerformanceMetric(

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

  updateAppPhase(
    APP_PHASES
    .ERROR
  );



  // ===================================
  // CLEANUP
  // ===================================

  await cleanupApp();

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

  if(
    typeof logCriticalError ===
    "function"
  ){

    await logCriticalError(

      "APPLICATION STARTUP FAILED",

      {

        error:
        normalizeStartupError(
          error
        )

      }

    );

  }

  await emitAppEvent(

    "app.error",

    {

      error:
      normalizeStartupError(
        error
      )

    }

  );



  // ===================================
  // RECOVERY
  // ===================================

  if(

    APP_CORE_CONFIG
    .ENABLE_RECOVERY &&

    typeof recoverApplication ===
    "function"

  ){

    await recoverApplication();

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

  appState.starting =
  true;

  appState.startupStartedAt =

    startupRuntimeState
    .lastStartedAt;

  updateAppPhase(
    APP_PHASES
    .PREINIT
  );

  await emitAppEvent(
    "app.preinit"
  );

  try{



    // ================================
    // BOOTING
    // ================================

    updateAppPhase(
      APP_PHASES
      .BOOTING
    );

    await emitAppEvent(
      "app.booting"
    );



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

    return handleStartupFailure(
      error
    );

  }

  finally{

    appState.starting =
    false;

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
  createStartupSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppStartup =
  AppStartup;

}
