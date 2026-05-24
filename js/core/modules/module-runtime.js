// =====================================
// RIGO AI
// MODULE RUNTIME
// ENTERPRISE ORCHESTRATION ENGINE
// =====================================



// =====================================
// STATE
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

  diagnostics:{

    boots:0,

    shutdowns:0,

    recoveries:0,

    healthchecks:0,

    runtimeErrors:0

  }

});



// =====================================
// IMMUTABLE
// =====================================

function freezeModuleRuntime(
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

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeModuleRuntime(
        nestedValue,
        visited
      );

    }

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

async function emitModuleRuntimeEvent(
  eventName,
  payload = {}
){

  try{

    if(
      typeof emitSystemEvent !==
      "function"
    ){

      return false;

    }

    await emitSystemEvent(

      eventName,

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

    return false;

  }

}



// =====================================
// SORT MODULES
// =====================================

function getBootableModules(){

  const modules = [

    ...moduleLoaderState
    .modules
    .values()

  ];

  return modules
  .sort((a,b) => {

    return (

      a.metadata.priority -

      b.metadata.priority

    );

  });

}



// =====================================
// LOAD MODULES
// =====================================

async function bootModules(){

  const modules =
  getBootableModules();

  for(
    const moduleDefinition
    of modules
  ){

    if(
      moduleDefinition
      .metadata
      .lazy
    ){

      continue;

    }

    const loaded =
    await loadModule(

      moduleDefinition
      .metadata
      .name

    );

    if(!loaded){

      throw new Error(

        "MODULE BOOT FAILED: " +

        moduleDefinition
        .metadata
        .name

      );

    }

  }

  return true;

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

  const health =
  await getModuleHealth();

  await emitModuleRuntimeEvent(

    MODULE_RUNTIME_EVENTS
    .HEALTHCHECK,

    {

      health

    }

  );



  // ================================
  // AUTO RECOVERY
  // ================================

  if(

    MODULE_LOADER_CONFIG
    .ENABLE_RECOVERY &&

    health?.status ===
    "critical"

  ){

    await recoverModuleRuntime();

  }

  return health;

}



// =====================================
// START MONITORING
// =====================================

function startModuleRuntimeMonitoring(){

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

    executeModuleRuntimeHealthcheck();

  },

  APP_CORE_CONFIG
  ?.HEALTHCHECK_INTERVAL

  ||

  30000);

  return true;

}



// =====================================
// STOP MONITORING
// =====================================

function stopModuleRuntimeMonitoring(){

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

  const initialized =
  await initializeModuleLoader();

  if(!initialized){

    return false;

  }

  moduleRuntimeState
  .initialized =
  true;

  await emitModuleRuntimeEvent(

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
    moduleRuntimeState
    .booting
  ){

    return false;

  }

  if(
    moduleRuntimeState
    .runtimeLocked
  ){

    return false;

  }

  moduleRuntimeState
  .booting =
  true;

  moduleRuntimeState
  .runtimeLocked =
  true;

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

    await emitModuleRuntimeEvent(

      MODULE_RUNTIME_EVENTS
      .BOOT_STARTED

    );

    const initialized =
    await initializeModuleRuntime();

    if(!initialized){

      throw new Error(
        "MODULE RUNTIME INIT FAILED"
      );

    }

    await bootModules();

    startModuleRuntimeMonitoring();

    moduleRuntimeState
    .booted =
    true;

    moduleRuntimeState
    .completedAt =
    Date.now();

    await emitModuleRuntimeEvent(

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

    if(
      typeof logCriticalError ===
      "function"
    ){

      await logCriticalError(

        "MODULE RUNTIME BOOT FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    moduleRuntimeState
    .booting =
    false;

    moduleRuntimeState
    .runtimeLocked =
    false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverModuleRuntime(){

  if(
    moduleRuntimeState
    .recovering
  ){

    return false;

  }

  moduleRuntimeState
  .recovering =
  true;

  moduleRuntimeState
  .diagnostics
  .recoveries++;

  moduleRuntimeState
  .lastRecoveryAt =
  Date.now();

  try{

    await emitModuleRuntimeEvent(

      MODULE_RUNTIME_EVENTS
      .RECOVERY_STARTED

    );

    const failedModules = [

      ...moduleLoaderState
      .failedModules

    ];

    for(
      const moduleName
      of failedModules
    ){

      await recoverModule(
        moduleName
      );

    }

    await emitModuleRuntimeEvent(

      MODULE_RUNTIME_EVENTS
      .RECOVERY_COMPLETED

    );

    return true;

  }

  catch(error){

    moduleRuntimeState
    .lastError =
    error;

    return false;

  }

  finally{

    moduleRuntimeState
    .recovering =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownModuleRuntime(){

  if(
    moduleRuntimeState
    .shuttingDown
  ){

    return false;

  }

  moduleRuntimeState
  .shuttingDown =
  true;

  moduleRuntimeState
  .diagnostics
  .shutdowns++;

  try{

    await emitModuleRuntimeEvent(

      MODULE_RUNTIME_EVENTS
      .SHUTDOWN_STARTED

    );

    stopModuleRuntimeMonitoring();

    await resetModuleLoader();

    moduleRuntimeState
    .booted =
    false;

    await emitModuleRuntimeEvent(

      MODULE_RUNTIME_EVENTS
      .SHUTDOWN_COMPLETED

    );

    return true;

  }

  catch(error){

    moduleRuntimeState
    .lastError =
    error;

    return false;

  }

  finally{

    moduleRuntimeState
    .shuttingDown =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleRuntimeSnapshot(){

  return freezeModuleRuntime({

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

      ? String(
          moduleRuntimeState
          .lastError
        )

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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ModuleRuntime =
  ModuleRuntime;

  window.initializeModuleRuntime =
  initializeModuleRuntime;

  window.bootModuleRuntime =
  bootModuleRuntime;

  window.shutdownModuleRuntime =
  shutdownModuleRuntime;

  window.recoverModuleRuntime =
  recoverModuleRuntime;

}
