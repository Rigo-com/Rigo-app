// =====================================
// APP RECOVERY
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

    cleanupApp();

    const restarted =
    await startApp();

    if(!restarted){

      return false;

    }

    appState.crashed =
    false;

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    return false;

  }

  finally{

    appState.recovering =
    false;

  }

}
