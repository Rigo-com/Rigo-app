// =====================================
// RIGO AI
// APP RECOVERY
// =====================================



// =====================================
// RECOVERY STATE
// =====================================

const recoveryRuntimeState =
Object.seal({

  recovering:false,

  lastRecoveryAt:null,

  lastRecoveryDuration:null,

  lastRecoveryError:null

});



// =====================================
// SNAPSHOT
// =====================================

function createRecoverySnapshot(){

  return Object.freeze({

    recovering:
    recoveryRuntimeState
    .recovering,

    lastRecoveryAt:
    recoveryRuntimeState
    .lastRecoveryAt,

    lastRecoveryDuration:
    recoveryRuntimeState
    .lastRecoveryDuration,

    lastRecoveryError:

      recoveryRuntimeState
      .lastRecoveryError

      ? String(
          recoveryRuntimeState
          .lastRecoveryError
        )

      : null,

    attempts:
    appState
    .recoveryAttempts,

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET SYSTEMS
// =====================================

async function resetRecoverySystems(){

  try{



    // ================================
    // HEALTH
    // ================================

    if(
      typeof HealthSystem !==
      "undefined"
    ){

      await HealthSystem
      .reset();

    }



    // ================================
    // RUNTIME
    // ================================

    if(
      typeof RuntimeManager !==
      "undefined"
    ){

      await RuntimeManager
      .shutdown();

    }



    // ================================
    // MODULES
    // ================================

    if(
      typeof ModuleLoader !==
      "undefined"
    ){

      await ModuleLoader
      .reset();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



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

    appState.recovering ||

    recoveryRuntimeState
    .recovering

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

  recoveryRuntimeState
  .recovering =
  true;

  appState.recovering =
  true;

  appState.recoveryAttempts++;

  recoveryRuntimeState
  .lastRecoveryAt =
  Date.now();

  recoveryRuntimeState
  .lastRecoveryError =
  null;

  updateAppPhase(
    APP_PHASES
    .RECOVERING
  );

  await emitAppEvent(
    "app.recovering"
  );

  const startedAt =
  Date.now();

  try{



    // ================================
    // RESET SYSTEMS
    // ================================

    const resetSuccessful =
    await resetRecoverySystems();

    if(!resetSuccessful){

      throw new Error(
        "RECOVERY RESET FAILED"
      );

    }



    // ================================
    // CLEANUP
    // ================================

    await cleanupApp();



    // ================================
    // RESTART
    // ================================

    const restarted =
    await startApp();

    if(!restarted){

      throw new Error(
        "APPLICATION RESTART FAILED"
      );

    }



    // ================================
    // VALIDATE HEALTH
    // ================================

    const healthReport =
    await runAppHealthcheck();

    if(
      !healthReport
      ?.healthy
    ){

      throw new Error(
        "RECOVERY HEALTHCHECK FAILED"
      );

    }



    // ================================
    // SUCCESS
    // ================================

    appState.crashed =
    false;

    appState.lastError =
    null;

    recoveryRuntimeState
    .lastRecoveryDuration =

      Date.now() -
      startedAt;

    updateAppPhase(
      APP_PHASES
      .READY
    );

    if(
      typeof logDiagnosticInfo ===
      "function"
    ){

      await logDiagnosticInfo(

        "APPLICATION RECOVERED",

        {

          duration:

            recoveryRuntimeState
            .lastRecoveryDuration

        }

      );

    }

    await emitAppEvent(
      "app.recovered"
    );

    return true;

  }

  catch(error){

    recoveryRuntimeState
    .lastRecoveryError =
    error;

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

    updateAppPhase(
      APP_PHASES
      .ERROR
    );

    return false;

  }

  finally{

    recoveryRuntimeState
    .recovering =
    false;

    appState.recovering =
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

  window.recoverApplication =
  recoverApplication;

  window.createRecoverySnapshot =
  createRecoverySnapshot;

}
