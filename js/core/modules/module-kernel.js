// =====================================
// RIGO AI
// MODULE KERNEL
// THIN ORCHESTRATION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value === "function";

}



function getKernelDependency(name){

  if(typeof window === "undefined"){
    return null;
  }

  return window[name] || null;

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
// EVENT EMITTER
// =====================================

async function emitKernelEvent(
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
        "module-kernel",

        timestamp:
        Date.now(),

        ...payload

      }
    );

    return true;

  }catch(error){

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

  if(!runtime){

    emitKernelWarning(
      "Missing ModuleRuntime dependency"
    );

    return false;

  }

  if(!health){

    emitKernelWarning(
      "Missing ModuleHealth dependency"
    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeKernel(){

  if(
    !validateKernelDependencies()
  ){
    return false;
  }

  const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

  if(
    !runtime ||
    !isFunction(runtime.initialize)
  ){
    return false;
  }

  try{

    return await runtime.initialize();

  }catch(error){

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
    !validateKernelDependencies()
  ){
    return false;
  }

  const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

  try{

    await emitKernelEvent(
      "module.kernel.boot.started"
    );

    const initialized =
      await initializeKernel();

    if(!initialized){

      throw new Error(
        "KERNEL INITIALIZATION FAILED"
      );

    }

    const booted =
      await runtime.boot();

    if(!booted){

      throw new Error(
        "RUNTIME BOOT FAILED"
      );

    }

    await emitKernelEvent(

      "module.kernel.boot.completed",

      {

        timestamp:
        Date.now()

      }

    );

    return true;

  }catch(error){

    emitKernelWarning(
      "Kernel boot failed",
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownKernel(){

  if(
    !validateKernelDependencies()
  ){
    return false;
  }

  const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

  try{

    await emitKernelEvent(
      "module.kernel.shutdown.started"
    );

    const result =
      await runtime.shutdown();

    await emitKernelEvent(

      "module.kernel.shutdown.completed",

      {

        success:
        result

      }

    );

    return result;

  }catch(error){

    emitKernelWarning(
      "Kernel shutdown failed",
      error
    );

    return false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverKernel(){

  if(
    !validateKernelDependencies()
  ){
    return false;
  }

  const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

  try{

    await emitKernelEvent(
      "module.kernel.recovery.started"
    );

    const result =
      await runtime.recover();

    await emitKernelEvent(

      "module.kernel.recovery.completed",

      {

        success:
        result

      }

    );

    return result;

  }catch(error){

    emitKernelWarning(
      "Kernel recovery failed",
      error
    );

    return false;

  }

}



// =====================================
// HEALTH
// =====================================

async function getKernelHealth(){

  if(
    !validateKernelDependencies()
  ){
    return null;
  }

  const runtime =
    getKernelDependency(
      "ModuleRuntime"
    );

  const health =
    getKernelDependency(
      "ModuleHealth"
    );

  try{

    const runtimeHealth =
      isFunction(runtime.health)
        ? await runtime.health()
        : null;

    const moduleHealth =
      isFunction(health.health)
        ? await health.health()
        : null;

    const result =
      Object.freeze({

        runtime:
        runtimeHealth,

        modules:
        moduleHealth,

        timestamp:
        Date.now()

      });

    await emitKernelEvent(

      "module.kernel.healthcheck",

      {

        health:
        result

      }

    );

    return result;

  }catch(error){

    emitKernelWarning(
      "Kernel healthcheck failed",
      error
    );

    return null;

  }

}



// =====================================
// SYSTEM RESET
// =====================================

async function resetKernel(){

  if(
    !validateKernelDependencies()
  ){
    return false;
  }

  try{

    await emitKernelEvent(
      "module.kernel.reset.started"
    );

    const runtime =
      getKernelDependency(
        "ModuleRuntime"
      );

    if(
      runtime &&
      isFunction(runtime.shutdown)
    ){

      await runtime.shutdown();

    }

    if(
      typeof moduleLoaderState !==
      "undefined"
    ){

      const activeModules = [

        ...moduleLoaderState.activeModules

      ];

      for(
        const moduleName
        of activeModules
      ){

        try{

          if(
            isFunction(unloadModule)
          ){

            await unloadModule(
              moduleName
            );

          }

        }catch(error){

          emitKernelWarning(
            `Failed unloading module: ${moduleName}`,
            error
          );

        }

      }

      moduleLoaderState.activeModules.clear();

      moduleLoaderState.failedModules.clear();

      moduleLoaderState.loadingStack = [];

      if(
        moduleLoaderState.instances
      ){

        moduleLoaderState.instances.clear();

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

      health.resetDiagnostics();

    }

    await emitKernelEvent(
      "module.kernel.reset.completed"
    );

    return true;

  }catch(error){

    emitKernelWarning(
      "Kernel reset failed",
      error
    );

    return false;

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

  return Object.freeze({

    runtime:

    runtime &&
    isFunction(runtime.snapshot)
      ? runtime.snapshot()
      : null,

    modules:

    health &&
    isFunction(health.snapshot)
      ? health.snapshot()
      : null,

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

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "ModuleKernel",
    {

      value:
      ModuleKernel,

      writable:
      false,

      configurable:
      false

    }
  );

}
