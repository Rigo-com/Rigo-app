// =====================================
// RIGO AI
// MODULE RUNTIME
// PURE RUNTIME LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import ModuleRegistry
from "./module-registry.js";

import ModuleActivation
from "./module-activation.js";



// =====================================
// INTERNAL STATE
// =====================================

const moduleRuntimeState =
Object.seal({

  initialized:false,

  booted:false,

  booting:false,

  shuttingDown:false,

  resetting:false,

  startedAt:null,

  stoppedAt:null

});



// =====================================
// HELPERS
// =====================================

function isRuntimeBusy(){

  return (

    moduleRuntimeState
    .booting ||

    moduleRuntimeState
    .shuttingDown ||

    moduleRuntimeState
    .resetting

  );

}



// =====================================
// INITIALIZATION
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

  return true;

}



// =====================================
// BOOT
// =====================================

async function bootModuleRuntime(){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  if(
    moduleRuntimeState
    .booted
  ){

    return true;

  }

  moduleRuntimeState
  .booting =
  true;

  try{

    const initialized =
    await initializeModuleRuntime();

    if(
      !initialized
    ){

      return false;

    }

    const modules =
    ModuleRegistry
    .getRegisteredModules();

    for(
      const moduleName
      of modules
    ){

      const definition =
      ModuleRegistry
      .getRegisteredModule(
        moduleName
      );

      if(
        !definition
      ){

        continue;

      }

      if(
        definition
        .metadata
        .lazy
      ){

        continue;

      }

      const loaded =
      await ModuleActivation
      .load(
        moduleName
      );

      if(
        !loaded
      ){

        return false;

      }

    }

    moduleRuntimeState
    .booted =
    true;

    moduleRuntimeState
    .startedAt =
    Date.now();

    moduleRuntimeState
    .stoppedAt =
    null;

    return true;

  }

  finally{

    moduleRuntimeState
    .booting =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownModuleRuntime(){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  if(
    !moduleRuntimeState
    .booted
  ){

    return true;

  }

  moduleRuntimeState
  .shuttingDown =
  true;

  try{

    const modules =

      ModuleRegistry
      .getRegisteredModules()
      .reverse();

    for(
      const moduleName
      of modules
    ){

      await ModuleActivation
      .unload(
        moduleName
      );

    }

    moduleRuntimeState
    .booted =
    false;

    moduleRuntimeState
    .stoppedAt =
    Date.now();

    return true;

  }

  finally{

    moduleRuntimeState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET
// =====================================

async function resetModuleRuntime(){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  moduleRuntimeState
  .resetting =
  true;

  try{

    await shutdownModuleRuntime();

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
    .startedAt =
    null;

    moduleRuntimeState
    .stoppedAt =
    null;

    return true;

  }

  finally{

    moduleRuntimeState
    .resetting =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleRuntimeSnapshot(){

  return Object.freeze({

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

    resetting:
    moduleRuntimeState
    .resetting,

    startedAt:
    moduleRuntimeState
    .startedAt,

    stoppedAt:
    moduleRuntimeState
    .stoppedAt,

    registeredModules:

      ModuleRegistry
      .getRegisteredModules()
      .length,

    instances:

      ModuleRegistry
      .snapshot()
      .instances,

    timestamp:
    Date.now()

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

  reset:
  resetModuleRuntime,

  snapshot:
  createModuleRuntimeSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeModuleRuntime,

  bootModuleRuntime,

  shutdownModuleRuntime,

  resetModuleRuntime,

  createModuleRuntimeSnapshot,

  ModuleRuntime

};

export default
ModuleRuntime;
