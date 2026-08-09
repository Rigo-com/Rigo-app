// =====================================
// RIGO AI
// MODULE ACTIVATION
// LIFECYCLE EXECUTION LAYER
// =====================================


import {
  MODULE_STATES
}
from "./module-constants.js";

import ModuleRegistry, {
  normalizeModuleName
}
from "./module-registry.js";


// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}


function createModuleContext(
  moduleDefinition
){

  return Object.freeze({

    name:
    moduleDefinition
    .metadata
    .name,

    lifecycle:
    moduleDefinition
    .metadata
    .lifecycle,

    priority:
    moduleDefinition
    .metadata
    .priority,

    dependencies:
    moduleDefinition
    .metadata
    .dependencies

  });

}


async function initializeModuleInstance(
  instance,
  context
){

  if(
    !instance
  ){

    return false;

  }

  if(
    isFunction(
      instance.initialize
    )
  ){

    await instance
    .initialize(
      context
    );

  }

  if(
    isFunction(
      instance.boot
    )
  ){

    await instance
    .boot(
      context
    );

  }
  else if(
    isFunction(
      instance.start
    )
  ){

    await instance
    .start(
      context
    );

  }

  return true;

}


async function shutdownModuleInstance(
  instance
){

  if(
    !instance
  ){

    return true;

  }

  if(
    isFunction(
      instance.shutdown
    )
  ){

    await instance
    .shutdown();

    return true;

  }

  if(
    isFunction(
      instance.stop
    )
  ){

    await instance
    .stop();

    return true;

  }

  if(
    isFunction(
      instance.destroy
    )
  ){

    await instance
    .destroy();

  }

  return true;

}


// =====================================
// DEPENDENCY LOADING
// =====================================

async function loadModuleDependencies(
  moduleDefinition
){

  const dependencies =
  moduleDefinition
  .metadata
  .dependencies;

  for(
    const dependency
    of dependencies
  ){

    const loaded =
    await loadModule(
      dependency
    );

    if(
      !loaded
    ){

      throw new Error(
        `DEPENDENCY LOAD FAILED: ${dependency}`
      );

    }

  }

  return true;

}


// =====================================
// ACTIVATE MODULE
// =====================================

async function activateModule(
  moduleDefinition
){

  const moduleName =
  moduleDefinition
  .metadata
  .name;

  const runtimeState =
  ModuleRegistry
  .getModuleRuntimeState(
    moduleName
  );

  if(
    !runtimeState
  ){

    return null;

  }

  try{

    ModuleRegistry
    .updateModuleRuntimeState(
      moduleName,
      {
        state:
        MODULE_STATES
        .INITIALIZING
      }
    );

    const context =
    createModuleContext(
      moduleDefinition
    );

    const instance =
    await moduleDefinition
    .factory(
      context
    );

    if(
      !instance
    ){

      throw new Error(
        `MODULE FACTORY RETURNED EMPTY INSTANCE: ${moduleName}`
      );

    }

    await initializeModuleInstance(
      instance,
      context
    );

    ModuleRegistry
    .setModuleInstance(
      moduleName,
      instance
    );

    ModuleRegistry
    .updateModuleRuntimeState(
      moduleName,
      {
        state:
        MODULE_STATES
        .ACTIVE,

        activatedAt:
        Date.now(),

        failedAt:
        null
      }
    );

    return instance;

  }
  catch(error){

    ModuleRegistry
    .updateModuleRuntimeState(
      moduleName,
      {
        state:
        MODULE_STATES
        .FAILED,

        retries:
        runtimeState
        .retries + 1,

        failedAt:
        Date.now()
      }
    );

    return null;

  }

}


// =====================================
// LOAD MODULE
// =====================================

async function loadModule(
  moduleName
){

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  const moduleDefinition =
  ModuleRegistry
  .getRegisteredModule(
    normalizedName
  );

  if(
    !moduleDefinition
  ){

    return false;

  }

  const runtimeState =
  ModuleRegistry
  .getModuleRuntimeState(
    normalizedName
  );

  if(
    !runtimeState
  ){

    return false;

  }

  if(
    runtimeState.state ===
    MODULE_STATES.ACTIVE
  ){

    return true;

  }

  try{

    ModuleRegistry
    .updateModuleRuntimeState(
      normalizedName,
      {
        state:
        MODULE_STATES
        .LOADING
      }
    );

    await loadModuleDependencies(
      moduleDefinition
    );

    const instance =
    await activateModule(
      moduleDefinition
    );

    if(
      !instance
    ){

      throw new Error(
        `ACTIVATION FAILED: ${normalizedName}`
      );

    }

    return true;

  }
  catch(error){

    ModuleRegistry
    .updateModuleRuntimeState(
      normalizedName,
      {
        state:
        MODULE_STATES
        .FAILED,

        retries:
        runtimeState
        .retries + 1,

        failedAt:
        Date.now()
      }
    );

    return false;

  }

}


// =====================================
// UNLOAD MODULE
// =====================================

async function unloadModule(
  moduleName
){

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  const runtimeState =
  ModuleRegistry
  .getModuleRuntimeState(
    normalizedName
  );

  if(
    !runtimeState
  ){

    return false;

  }

  const instance =
  ModuleRegistry
  .getModuleInstance(
    normalizedName
  );

  ModuleRegistry
  .updateModuleRuntimeState(
    normalizedName,
    {
      state:
      MODULE_STATES
      .UNLOADING
    }
  );

  try{

    await shutdownModuleInstance(
      instance
    );

  }
  catch(error){}

  ModuleRegistry
  .removeModuleInstance(
    normalizedName
  );

  ModuleRegistry
  .updateModuleRuntimeState(
    normalizedName,
    {
      state:
      MODULE_STATES
      .UNLOADED
    }
  );

  return true;

}


// =====================================
// PUBLIC API
// =====================================

const ModuleActivation =
Object.freeze({

  load:
  loadModule,

  unload:
  unloadModule,

  activate:
  activateModule

});


// =====================================
// EXPORTS
// =====================================

export {
  loadModule,
  unloadModule,
  activateModule,
  loadModuleDependencies,
  createModuleContext,
  initializeModuleInstance,
  shutdownModuleInstance,
  ModuleActivation
};

export default
ModuleActivation;
