// =====================================
// RIGO AI
// APP RECOVERY
// ISOLATED RECOVERY SERVICE
// ENTERPRISE FINAL
// =====================================



// =====================================
// CONFIG
// =====================================

const APP_RECOVERY_CONFIG =
Object.freeze({

  RECOVERY_TIMEOUT:
  30000,

  ENABLE_DIAGNOSTICS:
  true,

  ENABLE_HEALTH_VALIDATION:
  true

});



// =====================================
// INTERNAL STATE
// =====================================

const recoveryRuntimeState =
Object.seal({

  recovering:false,

  initialized:false,

  totalRecoveries:0,

  successfulRecoveries:0,

  failedRecoveries:0,

  lastRecoveryAt:null,

  lastRecoveryDuration:null,

  lastRecoveryError:null

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}



function isPlainObject(
  value
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype ||

    prototype ===
    null

  );

}



function getRecoveryDependency(
  name
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return (
      window[name] ||
      null
    );

  }

  catch(error){

    return null;

  }

}



function normalizeRecoveryError(
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

    value instanceof Promise ||

    value instanceof Map ||

    value instanceof Set ||

    value instanceof Date ||

    value instanceof RegExp ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  if(

    !Array.isArray(value) &&

    !isPlainObject(value)

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// EVENTS
// =====================================

const APP_RECOVERY_EVENTS =
Object.freeze({

  RECOVERY_STARTED:
  "app.recovery.started",

  RECOVERY_COMPLETED:
  "app.recovery.completed",

  RECOVERY_FAILED:
  "app.recovery.failed",

  RESET_STARTED:
  "app.recovery.reset.started",

  RESET_COMPLETED:
  "app.recovery.reset.completed"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitRecoveryEvent(
  event,
  payload = {}
){

  try{

    if(
      !isFunction(
        emitSystemEvent
      )
    ){

      return false;

    }

    await emitSystemEvent(

      event,

      {

        source:
        "app-recovery",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitRecoveryWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// TIMEOUT
// =====================================

function createRecoveryTimeout(){

  let timeoutId =
  null;

  const promise =
  new Promise((_, reject) => {

    timeoutId =
    setTimeout(() => {

      reject(

        new Error(
          "APPLICATION RECOVERY TIMEOUT"
        )

      );

    },

    APP_RECOVERY_CONFIG
    .RECOVERY_TIMEOUT);

  });

  return {

    promise,

    clear(){

      if(
        timeoutId
      ){

        clearTimeout(
          timeoutId
        );

      }

    }

  };

}



// =====================================
// RESET SYSTEMS
// =====================================

async function resetRecoverySystems(){

  try{

    await emitRecoveryEvent(
      APP_RECOVERY_EVENTS
      .RESET_STARTED
    );

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

    // =============================
    // HEALTH
    // =============================

    if(

      healthSystem &&

      isFunction(
        healthSystem.reset
      )

    ){

      await healthSystem
      .reset();

    }

    // =============================
    // RUNTIME
    // =============================

    if(

      runtimeManager &&

      isFunction(
        runtimeManager.shutdown
      )

    ){

      await runtimeManager
      .shutdown();

    }

    // =============================
    // MODULES
    // =============================

    if(

      moduleKernel &&

      isFunction(
        moduleKernel.reset
      )

    ){

      await moduleKernel
      .reset();

    }

    await emitRecoveryEvent(
      APP_RECOVERY_EVENTS
      .RESET_COMPLETED
    );

    return true;

  }

  catch(error){

    emitRecoveryWarning(
      "Recovery reset failed",
      error
    );

    return false;

  }

}



// =====================================
// HEALTH VALIDATION
// =====================================

async function validateRecoveryHealth(){

  if(

    !APP_RECOVERY_CONFIG
    .ENABLE_HEALTH_VALIDATION

  ){

    return true;

  }

  const healthcheck =
  getRecoveryDependency(
    "runAppHealthcheck"
  );

  if(
    !isFunction(
      healthcheck
    )
  ){

    return false;

  }

  const report =
  await healthcheck();

  return Boolean(
    report?.healthy
  );

}



// =====================================
// RECOVERY
// =====================================

async function recoverApplication(){

  if(
    recoveryRuntimeState
    .recovering
  ){

    return false;

  }

  if(

    typeof APP_CORE_CONFIG !==
    "undefined"

    &&

    !APP_CORE_CONFIG
    ?.ENABLE_RECOVERY

  ){

    return false;

  }

  if(

    typeof appState !==
    "undefined"

    &&

    appState?.recoveryAttempts >=

    APP_CORE_CONFIG
    ?.MAX_RECOVERY_ATTEMPTS

  ){

    return false;

  }

  recoveryRuntimeState
  .recovering =
  true;

  recoveryRuntimeState
  .totalRecoveries++;

  recoveryRuntimeState
  .lastRecoveryAt =
  Date.now();

  recoveryRuntimeState
  .lastRecoveryError =
  null;

  const startedAt =
  Date.now();

  const timeout =
  createRecoveryTimeout();

  try{

    if(
      typeof appState !==
      "undefined"
    ){

      appState.recovering =
      true;

      appState
      .recoveryAttempts++;
    }

    const updatePhase =
    getRecoveryDependency(
      "updateAppPhase"
    );

    const cleanup =
    getRecoveryDependency(
      "cleanupApp"
    );

    const start =
    getRecoveryDependency(
      "startApp"
    );

    if(
      isFunction(
        updatePhase
      )
    ){

      updatePhase(
        APP_PHASES
        .RECOVERING
      );

    }

    await emitRecoveryEvent(
      APP_RECOVERY_EVENTS
      .RECOVERY_STARTED
    );

    const recoveryProcess =
    (async() => {

      // ===========================
      // RESET
      // ===========================

      const resetSuccessful =
      await resetRecoverySystems();

      if(
        !resetSuccessful
      ){

        throw new Error(
          "RECOVERY RESET FAILED"
        );

      }

      // ===========================
      // CLEANUP
      // ===========================

      if(
        !isFunction(
          cleanup
        )
      ){

        throw new Error(
          "cleanupApp unavailable"
        );

      }

      await cleanup();

      // ===========================
      // RESTART
      // ===========================

      if(
        !isFunction(
          start
        )
      ){

        throw new Error(
          "startApp unavailable"
        );

      }

      const restarted =
      await start();

      if(
        !restarted
      ){

        throw new Error(
          "APPLICATION RESTART FAILED"
        );

      }

      // ===========================
      // HEALTH VALIDATION
      // ===========================

      const healthy =
      await validateRecoveryHealth();

      if(
        !healthy
      ){

        throw new Error(
          "RECOVERY HEALTHCHECK FAILED"
        );

      }

      return true;

    })();

    const recovered =
    await Promise.race([

      recoveryProcess,

      timeout.promise

    ]);

    timeout.clear();

    recoveryRuntimeState
    .successfulRecoveries++;

    recoveryRuntimeState
    .lastRecoveryDuration =

      Date.now() -
      startedAt;

    if(
      typeof appState !==
      "undefined"
    ){

      appState.crashed =
      false;

      appState.lastError =
      null;

      appState.recovering =
      false;

      appState
      .recoveryAttempts =
      0;

    }

    const updatePhase =
    getRecoveryDependency(
      "updateAppPhase"
    );

    if(
      isFunction(
        updatePhase
      )
    ){

      updatePhase(
        APP_PHASES.READY
      );

    }

    if(

      APP_RECOVERY_CONFIG
      .ENABLE_DIAGNOSTICS

      &&

      isFunction(
        logDiagnosticInfo
      )

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

    await emitRecoveryEvent(

      APP_RECOVERY_EVENTS
      .RECOVERY_COMPLETED,

      {

        duration:

        recoveryRuntimeState
        .lastRecoveryDuration

      }

    );

    return recovered;

  }

  catch(error){

    timeout.clear();

    recoveryRuntimeState
    .failedRecoveries++;

    recoveryRuntimeState
    .lastRecoveryError =
    normalizeRecoveryError(
      error
    );

    if(
      typeof appState !==
      "undefined"
    ){

      appState.recovering =
      false;
    }

    if(
      isFunction(
        setAppError
      )
    ){

      setAppError(
        error
      );

    }

    const updatePhase =
    getRecoveryDependency(
      "updateAppPhase"
    );

    if(
      isFunction(
        updatePhase
      )
    ){

      updatePhase(
        APP_PHASES.ERROR
      );

    }

    if(

      APP_RECOVERY_CONFIG
      .ENABLE_DIAGNOSTICS

      &&

      isFunction(
        logDiagnosticError
      )

    ){

      await logDiagnosticError(

        "APPLICATION RECOVERY FAILED",

        {

          error:
          normalizeRecoveryError(
            error
          )

        }

      );

    }

    await emitRecoveryEvent(

      APP_RECOVERY_EVENTS
      .RECOVERY_FAILED,

      {

        error:
        normalizeRecoveryError(
          error
        )

      }

    );

    emitRecoveryWarning(
      "Application recovery failed",
      error
    );

    return false;

  }

  finally{

    recoveryRuntimeState
    .recovering =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createRecoverySnapshot(){

  return safeFreeze({

    initialized:
    recoveryRuntimeState
    .initialized,

    recovering:
    recoveryRuntimeState
    .recovering,

    totalRecoveries:
    recoveryRuntimeState
    .totalRecoveries,

    successfulRecoveries:

      recoveryRuntimeState
      .successfulRecoveries,

    failedRecoveries:

      recoveryRuntimeState
      .failedRecoveries,

    lastRecoveryAt:

      recoveryRuntimeState
      .lastRecoveryAt,

    lastRecoveryDuration:

      recoveryRuntimeState
      .lastRecoveryDuration,

    lastRecoveryError:

      recoveryRuntimeState
      .lastRecoveryError,

    attempts:

      typeof appState !==
      "undefined"

      ?

      appState
      ?.recoveryAttempts || 0

      :

      0,

    timestamp:
    Date.now()

  });

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

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "AppRecovery",

    {

      value:
      AppRecovery,

      writable:false,

      configurable:false

    }

  );

}
