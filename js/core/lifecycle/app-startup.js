// =====================================
// RIGO AI
// APP STARTUP
// =====================================



// =====================================
// START APP
// =====================================

async function startApp(){

  if(

    appState.started ||

    appState.starting

  ){

    return false;

  }

  appState.starting =
  true;

  appState.startupStartedAt =
  Date.now();

  updateAppPhase(
    APP_PHASES.PREINIT
  );

  await emitAppEvent(
    "app.preinit"
  );

  try{

    updateAppPhase(
      APP_PHASES.BOOTING
    );

    await emitAppEvent(
      "app.booting"
    );

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

    updateAppPhase(
      APP_PHASES.READY
    );

    startHealthchecks();

    hideLoadingScreen();

    await emitAppEvent(
      "app.ready"
    );

    safeLogInfo(
      "RIGO AI READY"
    );

    return true;

  }

  catch(error){

    appState.failedStarts++;

    appState.lastError =
    error;

    updateAppPhase(
      APP_PHASES.ERROR
    );

    cleanupApp();

    if(
      typeof document !==
      "undefined" &&

      document.body
    ){

      document.body.classList.add(
        "app-error"
      );

    }

    hideLoadingScreen();

    safeLogError(

      getSafeErrorMessage(
        error
      )

    );

    await emitAppEvent(

      "app.error",

      {

        error:
        getSafeErrorMessage(
          error
        )

      }

    );

    if(

      APP_CORE_CONFIG
      .ENABLE_RECOVERY

    ){

      await recoverApplication();

    }

    return false;

  }

  finally{

    appState.starting =
    false;

  }

}
