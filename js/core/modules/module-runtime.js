// =====================================
// RIGO AI
// MODULE RUNTIME
// PURE EXECUTION LAYER
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const moduleRuntimeState = {

  initialized:
  false,

  booting:
  false,

  shuttingDown:
  false,

  recovering:
  false,

  monitoring:
  false,

  booted:
  false,

  runtimeLocked:
  false,

  healthTimer:
  null,

  startedAt:
  null,

  completedAt:
  null,

  lastHealthcheckAt:
  null,

  lastRecoveryAt:
  null,

  lastError:
  null,

  diagnostics:{

    boots:
    0,

    shutdowns:
    0,

    recoveries:
    0,

    healthchecks:
    0,

    runtimeErrors:
    0

  }

};



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value === "function";

}



function isPlainObject(value){

  if(
    !value ||
    typeof value !== "object"
  ){
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
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
    typeof value !== "object"
  ){
    return value;
  }

  if(seen.has(value)){
    return value;
  }

  if(
    value instanceof Date ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof RegExp
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

  Object.values(value).forEach((nestedValue) => {

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
  "module.runtime.healthcheck"

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
      !isFunction(emitSystemEvent)
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

  }catch(error){

    console.warn(
      "[ModuleRuntime] Event failed:",
      event,
      error
    );

    return false;

  }

}



// =====================================
// RUNTIME GUARDS
// =====================================

function isRuntimeBusy(){

  return (

    moduleRuntimeState.booting ||
    moduleRuntimeState.shuttingDown ||
    moduleRuntimeState.recovering

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeModuleRuntime(){

  if(
    moduleRuntimeState.initialized
  ){
    return true;
  }

  moduleRuntimeState.initialized =
    true;

  await emit(
    MODULE_RUNTIME_EVENTS.INITIALIZED
  );

  return true;

}



// =====================================
// BOOT
// =====================================

async function bootModuleRuntime(){

  if(
    isRuntimeBusy() ||
    moduleRuntimeState.booted
  ){
    return false;
  }

  moduleRuntimeState.booting =
    true;

  moduleRuntimeState.runtimeLocked =
    true;

  moduleRuntimeState.startedAt =
    Date.now();

  moduleRuntimeState.lastError =
    null;

  moduleRuntimeState.diagnostics.boots++;

  try{

    await emit(
      MODULE_RUNTIME_EVENTS.BOOT_STARTED
    );

    moduleRuntimeState.booted =
      true;

    moduleRuntimeState.completedAt =
      Date.now();

    await emit(

      MODULE_RUNTIME_EVENTS.BOOT_COMPLETED,

      {

        duration:

        moduleRuntimeState.completedAt -
        moduleRuntimeState.startedAt

      }

    );

    return true;

  }catch(error){

    moduleRuntimeState.lastError =
      error;

    moduleRuntimeState.diagnostics.runtimeErrors++;

    return false;

  }finally{

    moduleRuntimeState.booting =
      false;

    moduleRuntimeState.runtimeLocked =
      false;

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function executeModuleRuntimeHealthcheck(){

  moduleRuntimeState.diagnostics.healthchecks++;

  moduleRuntimeState.lastHealthcheckAt =
    Date.now();

  await emit(

    MODULE_RUNTIME_EVENTS.HEALTHCHECK,

    {

      status:

      moduleRuntimeState.booted
        ? "healthy"
        : "not_ready"

    }

  );

  return freeze({

    booted:
    moduleRuntimeState.booted,

    initialized:
    moduleRuntimeState.initialized,

    monitoring:
    moduleRuntimeState.monitoring,

    diagnostics:{
      ...moduleRuntimeState.diagnostics
    },

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

  moduleRuntimeState.recovering =
    true;

  moduleRuntimeState.runtimeLocked =
    true;

  moduleRuntimeState.diagnostics.recoveries++;

  moduleRuntimeState.lastRecoveryAt =
    Date.now();

  try{

    await emit(
      MODULE_RUNTIME_EVENTS.RECOVERY_STARTED
    );

    moduleRuntimeState.lastError =
      null;

    await emit(
      MODULE_RUNTIME_EVENTS.RECOVERY_COMPLETED
    );

    return true;

  }catch(error){

    moduleRuntimeState.lastError =
      error;

    moduleRuntimeState.diagnostics.runtimeErrors++;

    return false;

  }finally{

    moduleRuntimeState.recovering =
      false;

    moduleRuntimeState.runtimeLocked =
      false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownModuleRuntime(){

  if(
    isRuntimeBusy() ||
    !moduleRuntimeState.booted
  ){
    return false;
  }

  moduleRuntimeState.shuttingDown =
    true;

  moduleRuntimeState.runtimeLocked =
    true;

  moduleRuntimeState.diagnostics.shutdowns++;

  try{

    await emit(
      MODULE_RUNTIME_EVENTS.SHUTDOWN_STARTED
    );

    if(
      moduleRuntimeState.healthTimer
    ){

      clearInterval(
        moduleRuntimeState.healthTimer
      );

      moduleRuntimeState.healthTimer =
        null;

    }

    moduleRuntimeState.monitoring =
      false;

    moduleRuntimeState.booted =
      false;

    await emit(
      MODULE_RUNTIME_EVENTS.SHUTDOWN_COMPLETED
    );

    return true;

  }catch(error){

    moduleRuntimeState.lastError =
      error;

    moduleRuntimeState.diagnostics.runtimeErrors++;

    return false;

  }finally{

    moduleRuntimeState.shuttingDown =
      false;

    moduleRuntimeState.runtimeLocked =
      false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleRuntimeSnapshot(){

  return freeze({

    initialized:
    moduleRuntimeState.initialized,

    booted:
    moduleRuntimeState.booted,

    booting:
    moduleRuntimeState.booting,

    shuttingDown:
    moduleRuntimeState.shuttingDown,

    recovering:
    moduleRuntimeState.recovering,

    monitoring:
    moduleRuntimeState.monitoring,

    runtimeLocked:
    moduleRuntimeState.runtimeLocked,

    startedAt:
    moduleRuntimeState.startedAt,

    completedAt:
    moduleRuntimeState.completedAt,

    lastHealthcheckAt:
    moduleRuntimeState.lastHealthcheckAt,

    lastRecoveryAt:
    moduleRuntimeState.lastRecoveryAt,

    diagnostics:{
      ...moduleRuntimeState.diagnostics
    },

    lastError:

    moduleRuntimeState.lastError
      ? String(moduleRuntimeState.lastError)
      : null

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

  snapshot:
  createModuleRuntimeSnapshot

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "ModuleRuntime",
    {

      value:
      ModuleRuntime,

      writable:
      false,

      configurable:
      false

    }
  );

}
