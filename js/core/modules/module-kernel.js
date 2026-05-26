// =====================================
// RIGO AI
// MODULE KERNEL
// THIN ORCHESTRATION LAYER
// ENTERPRISE FINAL
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const moduleKernelState =
Object.seal({

  initialized:false,

  booted:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  resetting:false,

  lastBootAt:null,

  lastShutdownAt:null,

  lastRecoveryAt:null,

  lastResetAt:null,

  lastHealthcheckAt:null,

  lastError:null

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



function getKernelDependency(
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



function normalizeKernelError(
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



function emitKernelWarning(
  message,
  error = null
){

  console.warn(

    `[ModuleKernel] ${message}`,

    error || ""

  );

}



// =====================================
// EVENTS
// =====================================

const MODULE_KERNEL_EVENTS =
Object.freeze({

  INITIALIZED:
  "module.kernel.initialized",

  BOOT_STARTED:
  "module.kernel.boot.started",

  BOOT_COMPLETED:
  "module.kernel.boot.completed",

  SHUTDOWN_STARTED:
  "module.kernel.shutdown.started",

  SHUTDOWN_COMPLETED:
  "module.kernel.shutdown.completed",

  RECOVERY_STARTED:
  "module.kernel.recovery.started",

  RECOVERY_COMPLETED:
  "module.kernel.recovery.completed",

  RESET_STARTED:
  "module.kernel.reset.started",

  RESET_COMPLETED:
  "module.kernel.reset.completed",

  HEALTHCHECK:
  "module.kernel.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitKernelEvent(
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
        "module-kernel",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitKernelWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



// =====================================
// DEPENDENCY VALIDATION
// =====================================

function validateKernelDependencies(){

  const runtime =
  getKernelDependency(
    "ModuleRuntime"
  );

  const health =
  getKernelDependency(
    "ModuleHealth"
  );

  if(
    !runtime
  ){

    emitKernelWarning(
      "Missing ModuleRuntime"
    );

    return false;

  }

  if(
    !health
  ){

    emitKernelWarning(
      "Missing ModuleHealth"
    );

    return false;

  }

  return true;

}



// =====================================
// STATE GUARDS
// =====================================

function isKernelBusy(){

  return (

    moduleKernelState
    .booting ||

    moduleKernelState
    .shuttingDown ||

    moduleKernelState
    .recovering ||

    moduleKernelState
    .resetting

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeKernel(){

  if(
    moduleKernelState
    .initialized
  ){

    return true;

  }

  if(
    !validateKernelDependencies()
  ){

    return false;

  }

  try{

    const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

    if(

      !runtime ||

      !isFunction(
        runtime.initialize
      )

    ){

      return false;

    }

    const initialized =
    await runtime.initialize();

    if(
      !initialized
    ){

      return false;

    }

    moduleKernelState
    .initialized =
    true;

    await emitKernelEvent(
      MODULE_KERNEL_EVENTS
      .INITIALIZED
    );

    return true;

  }

  catch(error){

    moduleKernelState
    .lastError =
    normalizeKernelError(
      error
    );

    emitKernelWarning(

      "Kernel initialization failed",

      error

    );

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootKernel(){

  if(
    isKernelBusy()
  ){

    return false;

  }

  if(
    moduleKernelState
    .booted
  ){

    return true;

  }

  if(
    !validateKernelDependencies()
  ){

    return false;

  }

  moduleKernelState
  .booting =
  true;

  moduleKernelState
  .lastError =
  null;

  try{

    await emitKernelEvent(
      MODULE_KERNEL_EVENTS
      .BOOT_STARTED
    );

    const initialized =
    await initializeKernel();

    if(
      !initialized
    ){

      throw new Error(
        "KERNEL INITIALIZATION FAILED"
      );

    }

    const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

    const booted =
    await runtime.boot();

    if(
      !booted
    ){

      throw new Error(
        "RUNTIME BOOT FAILED"
      );

    }

    moduleKernelState
    .booted =
    true;

    moduleKernelState
    .lastBootAt =
    Date.now();

    await emitKernelEvent(

      MODULE_KERNEL_EVENTS
      .BOOT_COMPLETED,

      {

        booted:true

      }

    );

    return true;

  }

  catch(error){

    moduleKernelState
    .lastError =
    normalizeKernelError(
      error
    );

    emitKernelWarning(
      "Kernel boot failed",
      error
    );

    return false;

  }

  finally{

    moduleKernelState
    .booting =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownKernel(){

  if(
    isKernelBusy()
  ){

    return false;

  }

  if(
    !moduleKernelState
    .booted
  ){

    return true;

  }

  moduleKernelState
  .shuttingDown =
  true;

  try{

    await emitKernelEvent(
      MODULE_KERNEL_EVENTS
      .SHUTDOWN_STARTED
    );

    const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

    const result =
    await runtime.shutdown();

    moduleKernelState
    .booted =
    false;

    moduleKernelState
    .lastShutdownAt =
    Date.now();

    await emitKernelEvent(

      MODULE_KERNEL_EVENTS
      .SHUTDOWN_COMPLETED,

      {

        success:
        result

      }

    );

    return result;

  }

  catch(error){

    moduleKernelState
    .lastError =
    normalizeKernelError(
      error
    );

    emitKernelWarning(
      "Kernel shutdown failed",
      error
    );

    return false;

  }

  finally{

    moduleKernelState
    .shuttingDown =
    false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverKernel(){

  if(
    isKernelBusy()
  ){

    return false;

  }

  moduleKernelState
  .recovering =
  true;

  try{

    await emitKernelEvent(
      MODULE_KERNEL_EVENTS
      .RECOVERY_STARTED
    );

    const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

    const recovered =
    await runtime.recover();

    moduleKernelState
    .lastRecoveryAt =
    Date.now();

    await emitKernelEvent(

      MODULE_KERNEL_EVENTS
      .RECOVERY_COMPLETED,

      {

        recovered

      }

    );

    return recovered;

  }

  catch(error){

    moduleKernelState
    .lastError =
    normalizeKernelError(
      error
    );

    emitKernelWarning(
      "Kernel recovery failed",
      error
    );

    return false;

  }

  finally{

    moduleKernelState
    .recovering =
    false;

  }

}



// =====================================
// HEALTHCHECK
// =====================================

async function getKernelHealth(){

  if(
    !validateKernelDependencies()
  ){

    return null;

  }

  try{

    const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

    const health =
    getKernelDependency(
      "ModuleHealth"
    );

    const runtimeHealth =

      runtime &&
      isFunction(
        runtime.health
      )

      ?

      await runtime.health()

      :

      null;

    const moduleHealth =

      health &&
      isFunction(
        health.health
      )

      ?

      await health.health()

      :

      null;

    moduleKernelState
    .lastHealthcheckAt =
    Date.now();

    const snapshot =
    safeFreeze({

      runtime:
      runtimeHealth,

      modules:
      moduleHealth,

      kernel:{

        initialized:
        moduleKernelState
        .initialized,

        booted:
        moduleKernelState
        .booted,

        booting:
        moduleKernelState
        .booting,

        shuttingDown:
        moduleKernelState
        .shuttingDown,

        recovering:
        moduleKernelState
        .recovering,

        resetting:
        moduleKernelState
        .resetting

      },

      timestamp:
      Date.now()

    });

    await emitKernelEvent(

      MODULE_KERNEL_EVENTS
      .HEALTHCHECK,

      {

        health:
        snapshot

      }

    );

    return snapshot;

  }

  catch(error){

    moduleKernelState
    .lastError =
    normalizeKernelError(
      error
    );

    emitKernelWarning(

      "Kernel healthcheck failed",

      error

    );

    return null;

  }

}



// =====================================
// RESET
// =====================================

async function resetKernel(){

  if(
    isKernelBusy()
  ){

    return false;

  }

  moduleKernelState
  .resetting =
  true;

  try{

    await emitKernelEvent(
      MODULE_KERNEL_EVENTS
      .RESET_STARTED
    );

    const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

    if(

      runtime &&

      isFunction(
        runtime.shutdown
      )

    ){

      await runtime.shutdown();

    }

    if(

      typeof ModuleRegistry !==
      "undefined"

      &&

      isFunction(
        ModuleRegistry.snapshot
      )

    ){

      const snapshot =
      ModuleRegistry
      .snapshot();

      const activeModules =

        snapshot
        ?.activeModules ||

        [];

      for(
        const moduleName
        of activeModules
      ){

        try{

          if(
            isFunction(
              unloadModule
            )
          ){

            await unloadModule(
              moduleName
            );

          }

        }

        catch(error){

          emitKernelWarning(

            `Failed unloading module: ${moduleName}`,

            error

          );

        }

      }

    }

    const health =
    getKernelDependency(
      "ModuleHealth"
    );

    if(

      health &&

      isFunction(
        health.resetDiagnostics
      )

    ){

      health
      .resetDiagnostics();

    }

    moduleKernelState
    .booted =
    false;

    moduleKernelState
    .lastResetAt =
    Date.now();

    await emitKernelEvent(
      MODULE_KERNEL_EVENTS
      .RESET_COMPLETED
    );

    return true;

  }

  catch(error){

    moduleKernelState
    .lastError =
    normalizeKernelError(
      error
    );

    emitKernelWarning(
      "Kernel reset failed",
      error
    );

    return false;

  }

  finally{

    moduleKernelState
    .resetting =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

async function createKernelSnapshot(){

  const runtime =
  getKernelDependency(
    "ModuleRuntime"
  );

  const health =
  getKernelDependency(
    "ModuleHealth"
  );

  return safeFreeze({

    kernel:{

      initialized:
      moduleKernelState
      .initialized,

      booted:
      moduleKernelState
      .booted,

      booting:
      moduleKernelState
      .booting,

      shuttingDown:
      moduleKernelState
      .shuttingDown,

      recovering:
      moduleKernelState
      .recovering,

      resetting:
      moduleKernelState
      .resetting,

      lastBootAt:
      moduleKernelState
      .lastBootAt,

      lastShutdownAt:
      moduleKernelState
      .lastShutdownAt,

      lastRecoveryAt:
      moduleKernelState
      .lastRecoveryAt,

      lastResetAt:
      moduleKernelState
      .lastResetAt,

      lastHealthcheckAt:
      moduleKernelState
      .lastHealthcheckAt,

      lastError:
      moduleKernelState
      .lastError

    },

    runtime:

      runtime &&

      isFunction(
        runtime.snapshot
      )

      ?

      runtime.snapshot()

      :

      null,

    modules:

      health &&

      isFunction(
        health.snapshot
      )

      ?

      health.snapshot()

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ModuleKernel =
Object.freeze({

  initialize:
  initializeKernel,

  boot:
  bootKernel,

  shutdown:
  shutdownKernel,

  recover:
  recoverKernel,

  reset:
  resetKernel,

  health:
  getKernelHealth,

  snapshot:
  createKernelSnapshot

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

    "ModuleKernel",

    {

      value:
      ModuleKernel,

      writable:false,

      configurable:false

    }

  );

}
