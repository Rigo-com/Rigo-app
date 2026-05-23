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

  return Object.freeze({

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

      ? String(
          startupRuntimeState
          .lastError
        )

      : null

  });

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

  startupRuntimeState
  .starting =
  true;

  appState.starting =
  true;

  appState.startupStartedAt =
  Date.now();

  startupRuntimeState
  .lastStartedAt =
  appState.startupStartedAt;

  startupRuntimeState
  .lastError =
  null;

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
    // INITIALIZE
    // ================================

    await Promise.race([

      initializeApp(),

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



    // ================================
    // RUNTIME MANAGER
    // ================================

    if(
      typeof RuntimeManager !==
      "undefined"
    ){

      const booted =
      await RuntimeManager
      .boot();

      if(!booted){

        throw new Error(
          "RUNTIME BOOT FAILED"
        );

      }

    }



    // ================================
    // HEALTH VALIDATION
    // ================================

    const healthReport =
    await runAppHealthcheck();

    if(
      !healthReport
      ?.healthy
    ){

      throw new Error(
        "APPLICATION HEALTHCHECK FAILED"
      );

    }



    // ================================
    // COMPLETE
    // ================================

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

    startupRuntimeState
    .lastCompletedAt =
    appState
    .startupCompletedAt;

    startupRuntimeState
    .lastDuration =
    appState
    .startupDuration;

    updateAppPhase(
      APP_PHASES
      .READY
    );

    startHealthchecks();

    hideSafeLoadingScreen();

    await emitAppEvent(
      "app.ready"
    );



    // ================================
    // DIAGNOSTICS
    // ================================

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

  catch(error){

    appState.failedStarts++;

    appState.lastError =
    error;

    startupRuntimeState
    .lastError =
    error;

    updateAppPhase(
      APP_PHASES
      .ERROR
    );



    // ================================
    // CLEANUP
    // ================================

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



    // ================================
    // DIAGNOSTICS
    // ================================

    if(
      typeof logCriticalError ===
      "function"
    ){

      await logCriticalError(

        "APPLICATION STARTUP FAILED",

        {

          error:
          getSafeErrorMessage(
            error
          )

        }

      );

    }

    await emitAppEvent(

      "app.error",

      {

        error:
        getSafeErrorMessage(
          error
        )

      }

    );



    // ================================
    // RECOVERY
    // ================================

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

  finally{

    appState.starting =
    false;

    startupRuntimeState
    .starting =
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

  window.startApp =
  startApp;

  window.createStartupSnapshot =
  createStartupSnapshot;

}
