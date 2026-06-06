// =====================================
// RIGO AI
// MODULES INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import ModuleConstants
from "./module-constants.js";

import ModuleRegistry
from "./module-registry.js";

import ModuleActivation
from "./module-activation.js";

import ModuleRuntime
from "./module-runtime.js";



// =====================================
// INITIALIZATION
// =====================================

async function initializeModules(){

  return ModuleRuntime
  .initialize();

}



// =====================================
// SETUP
// =====================================

export {
  registerCoreModules
}
from "./module-setup.js";



// =====================================
// BOOT
// =====================================

async function bootModules(){

  return ModuleRuntime
  .boot();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownModules(){

  return ModuleRuntime
  .shutdown();

}



// =====================================
// RESET
// =====================================

async function resetModules(){

  return ModuleRuntime
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createModulesSnapshot(){

  return Object.freeze({

    constants:
    ModuleConstants,

    registry:
    ModuleRegistry
    .snapshot(),

    runtime:
    ModuleRuntime
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const Modules =
Object.freeze({

  constants:
  ModuleConstants,

  registry:
  ModuleRegistry,

  activation:
  ModuleActivation,

  runtime:
  ModuleRuntime,

  register:
  null,
  
  initialize:
  initializeModules,

  boot:
  bootModules,

  shutdown:
  shutdownModules,

  reset:
  resetModules,

  snapshot:
  createModulesSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  ModuleConstants,

  ModuleRegistry,

  ModuleActivation,

  ModuleRuntime,
  
  initializeModules,

  bootModules,

  shutdownModules,

  resetModules,

  createModulesSnapshot,

  Modules

};

export default
Modules;
