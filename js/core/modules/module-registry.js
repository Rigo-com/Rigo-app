// =====================================
// RIGO AI
// MODULE REGISTRY
// PURE DATA LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  MODULE_LIFECYCLES,

  MODULE_PRIORITIES,

  MODULE_STATES,

  isValidModuleLifecycle,

  isValidModulePriority

}
from "./module-constants.js";



// =====================================
// INTERNAL STATE
// =====================================

const moduleRegistryState =
Object.seal({

  modules:
  new Map(),

  runtime:
  new Map(),

  instances:
  new Map(),

  dependencyGraph:
  new Map(),

  reverseDependencies:
  new Map()

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

    )

  ];

}



function isValidModuleFactory(
  factory
){

  return typeof factory ===
  "function";

}



// =====================================
// MODULE DEFINITION
// =====================================

function createModuleDefinition(
  moduleName,
  factory,
  options = {}
){

  return Object.freeze({

    metadata:
    Object.freeze({

      name:
      moduleName,

      dependencies:
      normalizeDependencies(
        options.dependencies
      ),

      lifecycle:

        isValidModuleLifecycle(
          options.lifecycle
        )

        ?

        options.lifecycle

        :

        MODULE_LIFECYCLES
        .SINGLETON,

      priority:

        isValidModulePriority(
          options.priority
        )

        ?

        options.priority

        :

        MODULE_PRIORITIES
        .NORMAL,

      lazy:
      options.lazy ?? false,

      createdAt:
      Date.now()

    }),

    factory

  });

}



// =====================================
// RUNTIME STATE
// =====================================

function createModuleRuntimeState(
  moduleName
){

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(
    !normalizedName
  ){

    return null;

  }

  const runtimeState =
  Object.seal({

    state:
    MODULE_STATES
    .REGISTERED,

    retries:0,

    activatedAt:null,

    failedAt:null,

    recoveredAt:null

  });

  moduleRegistryState
  .runtime
  .set(

    normalizedName,
    runtimeState

  );

  return runtimeState;

}



function getModuleRuntimeState(
  moduleName
){

  return (

    moduleRegistryState
    .runtime
    .get(

      normalizeModuleName(
        moduleName
      )

    ) ||

    null

  );

}



function updateModuleRuntimeState(
  moduleName,
  updates = {}
){

  const runtimeState =
  getModuleRuntimeState(
    moduleName
  );

  if(
    !runtimeState
  ){

    return false;

  }

  Object.assign(
    runtimeState,
    updates
  );

  return true;

}



// =====================================
// MODULE REGISTRATION
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

    moduleRegistryState
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

  moduleRegistryState
  .modules
  .set(

    normalizedName,
    definition

  );

  createModuleRuntimeState(
    normalizedName
  );

  moduleRegistryState
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

      !moduleRegistryState
      .reverseDependencies
      .has(
        dependency
      )

    ){

      moduleRegistryState
      .reverseDependencies
      .set(

        dependency,

        new Set()

      );

    }

    moduleRegistryState
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
  moduleRegistryState
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
    moduleRegistryState
    .reverseDependencies
    .get(
      dependency
    );

    if(
      reverse
    ){

      reverse.delete(
        normalizedName
      );

      if(
        reverse.size <= 0
      ){

        moduleRegistryState
        .reverseDependencies
        .delete(
          dependency
        );

      }

    }

  });

  moduleRegistryState
  .modules
  .delete(
    normalizedName
  );

  moduleRegistryState
  .runtime
  .delete(
    normalizedName
  );

  moduleRegistryState
  .instances
  .delete(
    normalizedName
  );

  moduleRegistryState
  .dependencyGraph
  .delete(
    normalizedName
  );

  return true;

}



// =====================================
// INSTANCE MANAGEMENT
// =====================================

function setModuleInstance(
  moduleName,
  instance
){

  moduleRegistryState
  .instances
  .set(

    normalizeModuleName(
      moduleName
    ),

    instance

  );

  return true;

}



function getModuleInstance(
  moduleName
){

  return (

    moduleRegistryState
    .instances
    .get(

      normalizeModuleName(
        moduleName
      )

    ) ||

    null

  );

}



function removeModuleInstance(
  moduleName
){

  moduleRegistryState
  .instances
  .delete(

    normalizeModuleName(
      moduleName
    )

  );

  return true;

}



// =====================================
// LOOKUP
// =====================================

function hasRegisteredModule(
  moduleName
){

  return moduleRegistryState
  .modules
  .has(

    normalizeModuleName(
      moduleName
    )

  );

}



function getRegisteredModule(
  moduleName
){

  return (

    moduleRegistryState
    .modules
    .get(

      normalizeModuleName(
        moduleName
      )

    ) ||

    null

  );

}



function getRegisteredModules(){

  return [

    ...moduleRegistryState
    .modules
    .keys()

  ];

}



// =====================================
// DIAGNOSTICS
// =====================================

function getModuleRegistryDiagnostics(){

  return Object.freeze({

    modules:

      moduleRegistryState
      .modules
      .size,

    runtime:

      moduleRegistryState
      .runtime
      .size,

    instances:

      moduleRegistryState
      .instances
      .size,

    dependencyGraphs:

      moduleRegistryState
      .dependencyGraph
      .size,

    reverseDependencies:

      moduleRegistryState
      .reverseDependencies
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleRegistrySnapshot(){

  return Object.freeze({

    modules:

      getRegisteredModules(),

    runtimeStates:

      Object.fromEntries(
        moduleRegistryState
        .runtime
      ),

    dependencyGraph:

      Object.fromEntries(
        moduleRegistryState
        .dependencyGraph
      ),

    instances:

      moduleRegistryState
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

  hasRegisteredModule,

  getRegisteredModule,

  getRegisteredModules,

  createModuleRuntimeState,

  getModuleRuntimeState,

  updateModuleRuntimeState,

  setModuleInstance,

  getModuleInstance,

  removeModuleInstance,

  diagnostics:
  getModuleRegistryDiagnostics,

  snapshot:
  createModuleRegistrySnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  normalizeModuleName,

  registerModuleDefinition,

  unregisterModuleDefinition,

  hasRegisteredModule,

  getRegisteredModule,

  getRegisteredModules,

  createModuleRuntimeState,

  getModuleRuntimeState,

  updateModuleRuntimeState,

  setModuleInstance,

  getModuleInstance,

  removeModuleInstance,

  getModuleRegistryDiagnostics,

  createModuleRegistrySnapshot,

  ModuleRegistry

};

export default
ModuleRegistry;
