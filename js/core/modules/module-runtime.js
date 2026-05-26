// =====================================
// RIGO AI
// MODULE RUNTIME
// PURE EXECUTION LAYER
// ENTERPRISE FINAL
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const moduleRuntimeState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  monitoring:false,

  booted:false,

  runtimeLocked:false,

  healthTimer:null,

  startedAt:null,

  completedAt:null,

  lastHealthcheckAt:null,

  lastRecoveryAt:null,

  lastError:null,

  diagnostics:
  Object.seal({

    boots:0,

    shutdowns:0,

    recoveries:0,

    healthchecks:0,

    runtimeErrors:0

  })

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



function normalizeRuntimeError(
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
// SAFE IMMUTABLE FREEZE
// =====================================

function freeze(
  value,
  seen = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    seen.has(value)
  ){

    return value;

  }

  if(

    value instanceof Promise ||

    value instanceof Date ||

    value instanceof Map ||

    value instanceof Set ||

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

  seen.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    freeze(
      nestedValue,
      seen
    );

  });

  return value;

}



// =====================================
// EVENTS
// =====================================

const MODULE_RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "module.runtime.initialized",

  BOOT_STARTED:
  "module.runtime.boot.started",

  BOOT_COMPLETED:
  "module.runtime.boot.completed",

  SHUTDOWN_STARTED:
  "module.runtime.shutdown.started",

  SHUTDOWN_COMPLETED:
  "module.runtime.shutdown.completed",

  RECOVERY_STARTED:
  "module.runtime.recovery.started",

  RECOVERY_COMPLETED:
  "module.runtime.recovery.completed",

  HEALTHCHECK:
  "module.runtime.healthcheck",

  MONITORING_STARTED:
  "module.runtime.monitoring.started",

  MONITORING_STOPPED:
  "module.runtime.monitoring.stopped",

  RESET:
  "module.runtime.reset"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emit(
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
        "module-runtime",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    console.warn(

      "[ModuleRuntime] Event failed:",

      event,

      error

    );

    return false;

  }

}



// =====================================
// RUNTIME LOCKING
// =====================================

function lockRuntime(){

  moduleRuntimeState
  .runtimeLocked =
  true;

  return true;

}



function unlockRuntime(){

  moduleRuntimeState
  .runtimeLocked =
  false;

  return true;

}



// =====================================
// RUNTIME GUARDS
// =====================================

function isRuntimeBusy(){

  return (

    moduleRuntimeState
    .booting ||

    moduleRuntimeState
    .shuttingDown ||

    moduleRuntimeState
    .recovering

  );

}



// =====================================
// MONITORING
// =====================================

async function startRuntimeMonitoring(){

  if(
    moduleRuntimeState
    .monitoring
  ){

    return true;

  }

  if(
    moduleRuntimeState
    .healthTimer
  ){

    clearInterval(

      moduleRuntimeState
      .healthTimer

    );

  }

  moduleRuntimeState
  .monitoring =
  true;

  moduleRuntimeState
  .healthTimer =

    setInterval(() => {

      executeModuleRuntimeHealthcheck()
      .catch(() => {});

    },

    30000);

  await emit(

    MODULE_RUNTIME_EVENTS
    .MONITORING_STARTED

  );

  return true;

}



async function stopRuntimeMonitoring(){

  if(
    moduleRuntimeState
    .healthTimer
  ){

    clearInterval(

      moduleRuntimeState
      .healthTimer

    );

    moduleRuntimeState
    .healthTimer =
    null;

  }

  moduleRuntimeState
  .monitoring =
  false;

  await emit(

    MODULE_RUNTIME_EVENTS
    .MONITORING_STOPPED

  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeModuleRuntime(){

  if(
    moduleRuntimeState
    .initialized
  ){

    return true;

  }

  moduleRuntimeState
  .initialized =
  true;

  await emit(

    MODULE_RUNTIME_EVENTS
    .INITIALIZED

  );

  return true;

}



// =====================================
// BOOT
// =====================================

async function bootModuleRuntime(){

  if(

    isRuntimeBusy() ||

    moduleRuntimeState
    .booted

  ){

    return false;

  }

  moduleRuntimeState
  .booting =
  true;

  lockRuntime();

  moduleRuntimeState
  .startedAt =
  Date.now();

  moduleRuntimeState
  .lastError =
  null;

  moduleRuntimeState
  .diagnostics
  .boots++;

  try{

    await emit(

      MODULE_RUNTIME_EVENTS
      .BOOT_STARTED

    );

    await startRuntimeMonitoring();

    moduleRuntimeState
    .booted =
    true;

    moduleRuntimeState
    .completedAt =
    Date.now();

    await emit(

      MODULE_RUNTIME_EVENTS
      .BOOT_COMPLETED,

      {

        duration:

        moduleRuntimeState
        .completedAt -

        moduleRuntimeState
        .startedAt

      }

    );

    return true;

  }

  catch(error){

    moduleRuntimeState
    .lastError =
    error;

    moduleRuntimeState
    .diagnostics
    .runtimeErrors++;

    return false;

  }

  finally{

    moduleRuntimeState
    .booting =
    false;

    unlockRuntime();

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function executeModuleRuntimeHealthcheck(){

  moduleRuntimeState
  .diagnostics
  .healthchecks++;

  moduleRuntimeState
  .lastHealthcheckAt =
  Date.now();

  const snapshot =
  ModuleRegistry
  ?.snapshot?.();

  await emit(

    MODULE_RUNTIME_EVENTS
    .HEALTHCHECK,

    {

      status:

      moduleRuntimeState
      .booted

      ?

      "healthy"

      :

      "not_ready",

      activeModules:

      snapshot
      ?.activeModules
      ?.length || 0,

      failedModules:

      snapshot
      ?.failedModules
      ?.length || 0

    }

  );

  return freeze({

    booted:
    moduleRuntimeState
    .booted,

    initialized:
    moduleRuntimeState
    .initialized,

    monitoring:
    moduleRuntimeState
    .monitoring,

    diagnostics:{

      ...moduleRuntimeState
      .diagnostics

    },

    registry:

      snapshot ||

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// RECOVERY
// =====================================

async function recoverModuleRuntime(){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  moduleRuntimeState
  .recovering =
  true;

  lockRuntime();

  moduleRuntimeState
  .diagnostics
  .recoveries++;

  moduleRuntimeState
  .lastRecoveryAt =
  Date.now();

  try{

    await emit(

      MODULE_RUNTIME_EVENTS
      .RECOVERY_STARTED

    );

    const snapshot =
    ModuleRegistry
    ?.snapshot?.();

    const failedModules =

      snapshot
      ?.failedModules ||

      [];

    for(
      const moduleName
      of failedModules
    ){

      if(

        typeof ModuleLoader !==
        "undefined" &&

        isFunction(
          ModuleLoader
          .load
        )

      ){

        try{

          await ModuleLoader
          .load(
            moduleName
          );

        }

        catch(error){}

      }

    }

    moduleRuntimeState
    .lastError =
    null;

    await emit(

      MODULE_RUNTIME_EVENTS
      .RECOVERY_COMPLETED,

      {

        recoveredModules:
        failedModules
        .length

      }

    );

    return true;

  }

  catch(error){

    moduleRuntimeState
    .lastError =
    error;

    moduleRuntimeState
    .diagnostics
    .runtimeErrors++;

    return false;

  }

  finally{

    moduleRuntimeState
    .recovering =
    false;

    unlockRuntime();

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownModuleRuntime(){

  if(

    isRuntimeBusy() ||

    !moduleRuntimeState
    .booted

  ){

    return false;

  }

  moduleRuntimeState
  .shuttingDown =
  true;

  lockRuntime();

  moduleRuntimeState
  .diagnostics
  .shutdowns++;

  try{

    await emit(

      MODULE_RUNTIME_EVENTS
      .SHUTDOWN_STARTED

    );

    await stopRuntimeMonitoring();

    moduleRuntimeState
    .booted =
    false;

    await emit(

      MODULE_RUNTIME_EVENTS
      .SHUTDOWN_COMPLETED

    );

    return true;

  }

  catch(error){

    moduleRuntimeState
    .lastError =
    error;

    moduleRuntimeState
    .diagnostics
    .runtimeErrors++;

    return false;

  }

  finally{

    moduleRuntimeState
    .shuttingDown =
    false;

    unlockRuntime();

  }

}



// =====================================
// RESET
// =====================================

async function resetModuleRuntime(){

  await stopRuntimeMonitoring();

  moduleRuntimeState
  .booted =
  false;

  moduleRuntimeState
  .booting =
  false;

  moduleRuntimeState
  .shuttingDown =
  false;

  moduleRuntimeState
  .recovering =
  false;

  moduleRuntimeState
  .runtimeLocked =
  false;

  moduleRuntimeState
  .startedAt =
  null;

  moduleRuntimeState
  .completedAt =
  null;

  moduleRuntimeState
  .lastHealthcheckAt =
  null;

  moduleRuntimeState
  .lastRecoveryAt =
  null;

  moduleRuntimeState
  .lastError =
  null;

  await emit(

    MODULE_RUNTIME_EVENTS
    .RESET

  );

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleRuntimeSnapshot(){

  return freeze({

    initialized:
    moduleRuntimeState
    .initialized,

    booted:
    moduleRuntimeState
    .booted,

    booting:
    moduleRuntimeState
    .booting,

    shuttingDown:
    moduleRuntimeState
    .shuttingDown,

    recovering:
    moduleRuntimeState
    .recovering,

    monitoring:
    moduleRuntimeState
    .monitoring,

    runtimeLocked:
    moduleRuntimeState
    .runtimeLocked,

    startedAt:
    moduleRuntimeState
    .startedAt,

    completedAt:
    moduleRuntimeState
    .completedAt,

    lastHealthcheckAt:

      moduleRuntimeState
      .lastHealthcheckAt,

    lastRecoveryAt:

      moduleRuntimeState
      .lastRecoveryAt,

    diagnostics:{

      ...moduleRuntimeState
      .diagnostics

    },

    lastError:

      moduleRuntimeState
      .lastError

      ?

      normalizeRuntimeError(

        moduleRuntimeState
        .lastError

      )

      :

      null

  });

}



// =====================================
// PUBLIC API
// =====================================

const ModuleRuntime =
Object.freeze({

  initialize:
  initializeModuleRuntime,

  boot:
  bootModuleRuntime,

  shutdown:
  shutdownModuleRuntime,

  recover:
  recoverModuleRuntime,

  health:
  executeModuleRuntimeHealthcheck,

  startMonitoring:
  startRuntimeMonitoring,

  stopMonitoring:
  stopRuntimeMonitoring,

  reset:
  resetModuleRuntime,

  snapshot:
  createModuleRuntimeSnapshot

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

    "ModuleRuntime",

    {

      value:
      ModuleRuntime,

      writable:false,

      configurable:false

    }

  );

}
