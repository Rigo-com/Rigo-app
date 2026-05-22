// =====================================
// RIGO AI
// APP RECOVERY
// =====================================



// =====================================
// RECOVER APPLICATION
// =====================================

async function recoverApplication(){

  if(

    !APP_CORE_CONFIG
    .ENABLE_RECOVERY

  ){

    return false;

  }

  if(
    appState.recovering
  ){

    return false;

  }

  if(

    appState.recoveryAttempts >=

    APP_CORE_CONFIG
    .MAX_RECOVERY_ATTEMPTS

  ){

    return false;

  }

  appState.recovering =
  true;

  appState.recoveryAttempts++;

  updateAppPhase(
    APP_PHASES.RECOVERING
  );

  await emitAppEvent(
    "app.recovering"
  );

  try{



    // ================================
    // RESET HEALTH SYSTEM
    // ================================

    if(
      typeof HealthSystem !==
      "undefined"
    ){

      HealthSystem.reset();

    }



    // ================================
    // RESET RUNTIME
    // ================================

    if(
      typeof RuntimeManager !==
      "undefined"
    ){

      await RuntimeManager
      .shutdown();

    }



    // ================================
    // CLEANUP APP
    // ================================

    cleanupApp();



    // ================================
    // RESTART APP
    // ================================

    const restarted =
    await startApp();

    if(!restarted){

      return false;

    }

    appState.crashed =
    false;

    appState.lastError =
    null;

    await emitAppEvent(
      "app.recovered"
    );

    return true;

  }

  catch(error){

    setAppError(
      error
    );

    if(
      typeof DiagnosticsRuntime !==
      "undefined"
    ){

      await DiagnosticsRuntime
      .error(

        "APPLICATION RECOVERY FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    updateAppPhase(
      APP_PHASES.IDLE
    );

    appState.recovering =
    false;

  }

}
