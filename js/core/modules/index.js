// =====================================
// RIGO AI
// MODULES INDEX
// CLEAN COMPOSITION LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value === "function";

}



function emitModulesIndexWarning(
  message,
  error = null
){

  console.warn(
    `[ModulesIndex] ${message}`,
    error || ""
  );

}



// =====================================
// DEPENDENCY VALIDATION
// =====================================

function validateModulesLayer(){

  const requiredSystems = [

    "ModuleConstants",
    "ModuleRegistry",
    "ModuleRuntime",
    "ModuleHealth",
    "ModuleLoader",
    "ModuleKernel"

  ];

  const missingSystems =

    requiredSystems.filter((systemName) => {

      return (
        typeof window[systemName] ===
        "undefined"
      );

    });

  if(missingSystems.length > 0){

    emitModulesIndexWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// STARTUP
// =====================================

async function initializeModulesLayer(){

  try{

    if(
      !validateModulesLayer()
    ){
      return false;
    }

    if(
      typeof window.__RIGO_MODULES_READY__ !==
      "undefined"
    ){

      return true;

    }

    const kernel =
      window.ModuleKernel;

    if(
      kernel &&
      isFunction(kernel.initialize)
    ){

      const initialized =
        await kernel.initialize();

      if(!initialized){

        throw new Error(
          "MODULE KERNEL INITIALIZATION FAILED"
        );

      }

    }

    window.__RIGO_MODULES_READY__ =
      true;

    console.info(
      "[ModulesIndex] Modules layer initialized"
    );

    return true;

  }catch(error){

    emitModulesIndexWarning(
      "Modules initialization failed",
      error
    );

    return false;

  }

}



// =====================================
// OPTIONAL AUTO BOOT
// =====================================

async function autoBootModulesLayer(){

  try{

    const kernel =
      window.ModuleKernel;

    if(
      !kernel ||
      !isFunction(kernel.boot)
    ){
      return false;
    }

    return await kernel.boot();

  }catch(error){

    emitModulesIndexWarning(
      "Auto boot failed",
      error
    );

    return false;

  }

}



// =====================================
// PUBLIC SURFACE
// =====================================

const RigoModules =
Object.freeze({

  constants:
  window.ModuleConstants,

  registry:
  window.ModuleRegistry,

  runtime:
  window.ModuleRuntime,

  health:
  window.ModuleHealth,

  loader:
  window.ModuleLoader,

  kernel:
  window.ModuleKernel,

  initialize:
  initializeModulesLayer,

  boot:
  autoBootModulesLayer

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "RigoModules",
    {

      value:
      RigoModules,

      writable:
      false,

      configurable:
      false

    }
  );

}



// =====================================
// SAFE AUTO INITIALIZATION
// =====================================

if(typeof window !== "undefined"){

  queueMicrotask(async() => {

    try{

      await initializeModulesLayer();

    }catch(error){

      emitModulesIndexWarning(
        "Queued initialization failed",
        error
      );

    }

  });

}
