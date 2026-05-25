// =====================================
// RIGO AI
// APP RECOVERY
// ISOLATED RECOVERY SERVICE
// =====================================



// =====================================
// RECOVERY CONFIG
// =====================================

const APP_RECOVERY_CONFIG =
Object.freeze({

  RECOVERY_TIMEOUT:
  30000

});



// =====================================
// INTERNAL STATE
// =====================================

const recoveryRuntimeState = {

  recovering:
  false,

  lastRecoveryAt:
  null,

  lastRecoveryDuration:
  null,

  lastRecoveryError:
  null

};



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value === "function";

}



function getRecoveryDependency(name){

  if(typeof window === "undefined"){
    return null;
  }

  return window[name] || null;

}



function emitRecoveryWarning(
  message,
  error = null
){

  console.warn(
    `[AppRecovery] ${message}`,
    error || ""
  );

}



// =====================================
// SAFE FREEZE
// =====================================

function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !== "object"
  ){
    return value;
  }

  if(visited.has(value)){
    return value;
  }

  if(

    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date ||
    value instanceof RegExp

  ){
    return value;
  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue === "object"
    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// TIMEOUT WRAPPER
// =====================================

function createRecoveryTimeout(){

  let timeoutId = null;

  const promise = new Promise((_, reject) => {

    timeoutId = setTimeout(() => {

      reject(
        new Error(
          "APPLICATION RECOVERY TIMEOUT"
        )
      );

    }, APP_RECOVERY_CONFIG.RECOVERY_TIMEOUT);

  });

  return {

    promise,

    clear(){

      if(timeoutId){
        clearTimeout(timeoutId);
      }

    }

  };

}



// =====================================
// SNAPSHOT
// =====================================

function createRecoverySnapshot(){

  return safeFreeze({

    recovering:
    recoveryRuntimeState.recovering,

    lastRecoveryAt:
    recoveryRuntimeState.lastRecoveryAt,

    lastRecoveryDuration:
    recoveryRuntimeState.lastRecoveryDuration,

    lastRecoveryError:

    recoveryRuntimeState.lastRecoveryError
      ? String(
          recoveryRuntimeState.lastRecoveryError
        )
      : null,

    attempts:
    appState?.recoveryAttempts || 0,

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET SYSTEMS
// =====================================

async function resetRecoverySystems(){

  try{

    const runtimeManager =
      getRecoveryDependency(
        "RuntimeManager"
      );

    const healthSystem =
      getRecoveryDependency(
        "HealthSystem"
      );

    const moduleKernel =
      getRecoveryDependency(
        "ModuleKernel"
      );



    // ================================
    // HEALTH
    // ================================

    if(
      healthSystem &&
      isFunction(healthSystem.reset)
    ){

      await healthSystem.reset();

    }



    // ================================
    // RUNTIME
    // ================================

    if(
      runtimeManager &&
      isFunction(runtimeManager.shutdown)
    ){

      await runtimeManager.shutdown();

    }



    // ================================
    // MODULES
    // ================================

    if(
      moduleKernel &&
      isFunction(moduleKernel.reset)
    ){

      await moduleKernel.reset();

    }

    return true;

  }catch(error){

    emitRecoveryWarning(
      "Recovery reset failed",
      error
    );

    return false;

  }

}



// =====================================
// RECOVER APPLICATION
// =====================================

async function recoverApplication(){

  if(
    !APP_CORE_CONFIG?.ENABLE_RECOVERY
  ){
    return false;
  }

  if(

    recoveryRuntimeState.recovering ||

    appState?.recovering

  ){
    return false;
  }

  if(

    appState?.recoveryAttempts >=

    APP_CORE_CONFIG
    ?.MAX_RECOVERY_ATTEMPTS

  ){
    return false;
  }

  const timeout =
    createRecoveryTimeout();

  recoveryRuntimeState.recovering =
    true;

  appState.recovering =
    true;

  appState.recoveryAttempts++;

  recoveryRuntimeState.lastRecoveryAt =
    Date.now();

  recoveryRuntimeState.lastRecoveryError =
    null;

  const updatePhase =
    getRecoveryDependency(
      "updateAppPhase"
    );

  const emitEvent =
    getRecoveryDependency(
      "emitAppEvent"
    );

  const cleanup =
    getRecoveryDependency(
      "cleanupApp"
    );

  const start =
    getRecoveryDependency(
      "startApp"
    );

  const healthcheck =
    getRecoveryDependency(
      "runAppHealthcheck"
    );

  const diagnosticsRuntime =
    getRecoveryDependency(
      "DiagnosticsRuntime"
    );

  if(
    isFunction(updatePhase)
  ){

    updatePhase(
      APP_PHASES.RECOVERING
    );

  }

  if(
    isFunction(emitEvent)
  ){

    await emitEvent(
      "app.recovering"
    );

  }

  const startedAt =
    Date.now();

  try{

    const recoveryProcess =
      (async() => {



        // ============================
        // RESET SYSTEMS
        // ============================

        const resetSuccessful =
          await resetRecoverySystems();

        if(!resetSuccessful){

          throw new Error(
            "RECOVERY RESET FAILED"
          );

        }



        // ============================
        // CLEANUP
        // ============================

        if(
          !isFunction(cleanup)
        ){

          throw new Error(
            "cleanupApp unavailable"
          );

        }

        await cleanup();



        // ============================
        // RESTART
        // ============================

        if(
          !isFunction(start)
        ){

          throw new Error(
            "startApp unavailable"
          );

        }

        const restarted =
          await start();

        if(!restarted){

          throw new Error(
            "APPLICATION RESTART FAILED"
          );

        }



        // ============================
        // VALIDATE HEALTH
        // ============================

        if(
          !isFunction(healthcheck)
        ){

          throw new Error(
            "runAppHealthcheck unavailable"
          );

        }

        const healthReport =
          await healthcheck();

        if(
          !healthReport?.healthy
        ){

          throw new Error(
            "RECOVERY HEALTHCHECK FAILED"
          );

        }



        // ============================
        // SUCCESS
        // ============================

        appState.crashed =
          false;

        appState.lastError =
          null;

        appState.recoveryAttempts =
          0;

        recoveryRuntimeState.lastRecoveryDuration =

          Date.now() -
          startedAt;

        if(
          isFunction(updatePhase)
        ){

          updatePhase(
            APP_PHASES.READY
          );

        }

        if(
          isFunction(logDiagnosticInfo)
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

        if(
          isFunction(emitEvent)
        ){

          await emitEvent(
            "app.recovered"
          );

        }

        return true;

      })();

    const result =
      await Promise.race([

        recoveryProcess,
        timeout.promise

      ]);

    timeout.clear();

    return result;

  }catch(error){

    timeout.clear();

    recoveryRuntimeState.lastRecoveryError =
      error;

    if(
      isFunction(setAppError)
    ){

      setAppError(error);

    }

    if(

      diagnosticsRuntime &&
      isFunction(
        diagnosticsRuntime.error
      )

    ){

      try{

        await diagnosticsRuntime.error(

          "APPLICATION RECOVERY FAILED",

          {

            error:
            String(error)

          }

        );

      }catch(loggingError){

        emitRecoveryWarning(
          "Recovery diagnostics failed",
          loggingError
        );

      }

    }

    if(
      isFunction(updatePhase)
    ){

      updatePhase(
        APP_PHASES.ERROR
      );

    }

    emitRecoveryWarning(
      "Application recovery failed",
      error
    );

    return false;

  }finally{

    recoveryRuntimeState.recovering =
      false;

    appState.recovering =
      false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppRecovery =
Object.freeze({

  recover:
  recoverApplication,

  snapshot:
  createRecoverySnapshot

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "AppRecovery",
    {

      value:
      AppRecovery,

      writable:
      false,

      configurable:
      false

    }
  );

}
