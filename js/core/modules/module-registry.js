// =====================================
// RIGO AI
// MODULE REGISTRY
// PURE DATA LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import ModuleConstants, {

  MODULE_LIFECYCLES,

  MODULE_PRIORITIES,

  MODULE_STATES

}
from "./module-constants.js";



// =====================================
// INTERNAL STATE (PRIVATE)
// =====================================

const moduleLoaderState =
Object.seal({

  modules:
  new Map(),

  moduleRuntime:
  new Map(),

  instances:
  new Map(),

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  dependencyGraph:
  new Map(),

  reverseDependencies:
  new Map(),

  loadingStack:
  []

});



// =====================================
// HELPERS
// =====================================

function normalizeModuleName(
  moduleName
){

  return String(
    moduleName || ""
  )
  .trim()
  .toLowerCase();

}



function normalizeDependencies(
  dependencies
){

  if(
    !Array.isArray(
      dependencies
    )
  ){

    return [];

  }

  return [

    ...new Set(

      dependencies
      .filter(Boolean)
      .map(
        normalizeModuleName
      )
      .filter(Boolean)

    )

  ];

}



function isValidModuleFactory(
  factory
){

  return typeof factory ===
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



// =====================================
// SAFE DEEP FREEZE
// =====================================

function freezeModuleObject(
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

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    freezeModuleObject(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// VALIDATION
// =====================================

function validateModuleLifecycle(
  lifecycle
){

  return ModuleConstants
  .validateLifecycle(
    lifecycle
  );

}



function validateModulePriority(
  priority
){

  return ModuleConstants
  .validatePriority(
    priority
  );

}



// =====================================
// MODULE DEFINITION CREATION
// =====================================

function createModuleDefinition(
  moduleName,
  factory,
  options = {}
){

  const lifecycle =

    validateModuleLifecycle(
      options.lifecycle
    )

    ?

    options.lifecycle

    :

    MODULE_LIFECYCLES
    .SINGLETON;

  const priority =

    validateModulePriority(
      options.priority
    )

    ?

    options.priority

    :

    MODULE_PRIORITIES
    .NORMAL;

  return Object.seal({

    metadata:
    freezeModuleObject({

      name:
      moduleName,

      dependencies:
      normalizeDependencies(
        options.dependencies
      ),

      lifecycle,

      priority,

      lazy:
      options.lazy ?? false,

      createdAt:
      Date.now()

    }),

    factory

  });

}



// =====================================
// REGISTER MODULE
// =====================================

function registerModuleDefinition(
  moduleName,
  factory,
  options = {}
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

  if(
    !isValidModuleFactory(
      factory
    )
  ){

    return false;

  }

  if(

    moduleLoaderState
    .modules
    .has(
      normalizedName
    )

  ){

    return false;

  }

  const definition =
  createModuleDefinition(

    normalizedName,
    factory,
    options

  );

  moduleLoaderState
  .modules
  .set(

    normalizedName,
    definition

  );

  moduleLoaderState
  .moduleRuntime
  .set(

    normalizedName,

    Object.seal({

      retries:0,

      state:
      MODULE_STATES
      .REGISTERED,

      activatedAt:null,

      failedAt:null,

      recoveredAt:null

    })

  );

  moduleLoaderState
  .dependencyGraph
  .set(

    normalizedName,

    definition
    .metadata
    .dependencies

  );

  definition
  .metadata
  .dependencies
  .forEach((dependency) => {

    if(

      !moduleLoaderState
      .reverseDependencies
      .has(
        dependency
      )

    ){

      moduleLoaderState
      .reverseDependencies
      .set(

        dependency,

        new Set()

      );

    }

    moduleLoaderState
    .reverseDependencies
    .get(
      dependency
    )
    .add(
      normalizedName
    );

  });

  return true;

}



// =====================================
// UNREGISTER MODULE
// =====================================

function unregisterModuleDefinition(
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

  const definition =
  moduleLoaderState
  .modules
  .get(
    normalizedName
  );

  if(
    !definition
  ){

    return false;

  }

  definition
  .metadata
  .dependencies
  .forEach((dependency) => {

    const reverse =
    moduleLoaderState
    .reverseDependencies
    .get(
      dependency
    );

    if(reverse){

      reverse.delete(
        normalizedName
      );

      if(
        reverse.size <= 0
      ){

        moduleLoaderState
        .reverseDependencies
        .delete(
          dependency
        );

      }

    }

  });

  moduleLoaderState
  .modules
  .delete(
    normalizedName
  );

  moduleLoaderState
  .moduleRuntime
  .delete(
    normalizedName
  );

  moduleLoaderState
  .instances
  .delete(
    normalizedName
  );

  moduleLoaderState
  .activeModules
  .delete(
    normalizedName
  );

  moduleLoaderState
  .failedModules
  .delete(
    normalizedName
  );

  moduleLoaderState
  .dependencyGraph
  .delete(
    normalizedName
  );

  return true;

}



// =====================================
// INTERNAL RUNTIME MUTATIONS
// =====================================

function setModuleInstance(
  moduleName,
  instance
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

  moduleLoaderState
  .instances
  .set(

    normalizedName,
    instance

  );

  return true;

}



function removeModuleInstance(
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

  moduleLoaderState
  .instances
  .delete(
    normalizedName
  );

  return true;

}



function markModuleActive(
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

  moduleLoaderState
  .activeModules
  .add(
    normalizedName
  );

  return true;

}



function clearActiveModule(
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

  moduleLoaderState
  .activeModules
  .delete(
    normalizedName
  );

  return true;

}



function markModuleFailed(
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

  moduleLoaderState
  .failedModules
  .add(
    normalizedName
  );

  return true;

}



function clearFailedModule(
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

  moduleLoaderState
  .failedModules
  .delete(
    normalizedName
  );

  return true;

}



function pushLoadingModule(
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

  moduleLoaderState
  .loadingStack
  .push(
    normalizedName
  );

  return true;

}



function removeLoadingModule(
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

  const index =
  moduleLoaderState
  .loadingStack
  .indexOf(
    normalizedName
  );

  if(
    index >= 0
  ){

    moduleLoaderState
    .loadingStack
    .splice(
      index,
      1
    );

  }

  return true;

}



// =====================================
// LOOKUP API
// =====================================

function getRegisteredModule(
  moduleName
){

  return (

    moduleLoaderState
    .modules
    .get(

      normalizeModuleName(
        moduleName
      )

    ) ||

    null

  );

}



function hasRegisteredModule(
  moduleName
){

  return moduleLoaderState
  .modules
  .has(

    normalizeModuleName(
      moduleName
    )

  );

}



function getRegisteredModules(){

  return [

    ...moduleLoaderState
    .modules
    .keys()

  ];

}



function getModuleInstance(
  moduleName
){

  return (

    moduleLoaderState
    .instances
    .get(

      normalizeModuleName(
        moduleName
      )

    ) ||

    null

  );

}



function getModuleRuntimeState(
  moduleName
){

  return (

    moduleLoaderState
    .moduleRuntime
    .get(

      normalizeModuleName(
        moduleName
      )

    ) ||

    null

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function getModuleRegistryDiagnostics(){

  return freezeModuleObject({

    totalModules:

      moduleLoaderState
      .modules
      .size,

    activeModules:

      moduleLoaderState
      .activeModules
      .size,

    failedModules:

      moduleLoaderState
      .failedModules
      .size,

    instances:

      moduleLoaderState
      .instances
      .size,

    dependencyGraphs:

      moduleLoaderState
      .dependencyGraph
      .size,

    reverseDependencies:

      moduleLoaderState
      .reverseDependencies
      .size,

    loadingStackDepth:

      moduleLoaderState
      .loadingStack
      .length,

    timestamp:
    Date.now()

  });

}



// =====================================
// SAFE SNAPSHOT
// =====================================

function createModuleRegistrySnapshot(){

  const reverseDependencies =
  {};

  moduleLoaderState
  .reverseDependencies
  .forEach((value, key) => {

    reverseDependencies[key] =

      [...value];

  });

  const runtimeStates =
  {};

  moduleLoaderState
  .moduleRuntime
  .forEach((value, key) => {

    runtimeStates[key] =
    freezeModuleObject(
      value
    );

  });

  return freezeModuleObject({

    modules:

      [...moduleLoaderState
      .modules
      .keys()],

    activeModules:

      [...moduleLoaderState
      .activeModules],

    failedModules:

      [...moduleLoaderState
      .failedModules],

    dependencyGraph:

      Object.fromEntries(
        moduleLoaderState
        .dependencyGraph
      ),

    reverseDependencies,

    runtimeStates,

    loadingStack:[

      ...moduleLoaderState
      .loadingStack

    ],

    instances:

      moduleLoaderState
      .instances
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ModuleRegistry =
Object.freeze({

  registerModuleDefinition,

  unregisterModuleDefinition,

  setModuleInstance,

  removeModuleInstance,

  markModuleActive,

  clearActiveModule,

  markModuleFailed,

  clearFailedModule,

  pushLoadingModule,

  removeLoadingModule,

  getRegisteredModule,

  hasRegisteredModule,

  getRegisteredModules,

  getModuleInstance,

  getModuleRuntimeState,

  diagnostics:
  getModuleRegistryDiagnostics,

  snapshot:
  createModuleRegistrySnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  moduleLoaderState,

  normalizeModuleName,

  registerModuleDefinition,

  unregisterModuleDefinition,

  setModuleInstance,

  removeModuleInstance,

  markModuleActive,

  clearActiveModule,

  markModuleFailed,

  clearFailedModule,

  pushLoadingModule,

  removeLoadingModule,

  getRegisteredModule,

  hasRegisteredModule,

  getRegisteredModules,

  getModuleInstance,

  getModuleRuntimeState,

  getModuleRegistryDiagnostics,

  createModuleRegistrySnapshot,

  ModuleRegistry

};

export default
ModuleRegistry;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "ModuleRegistry",

    {

      value:
      ModuleRegistry,

      writable:false,

      configurable:false

    }

  );

}
