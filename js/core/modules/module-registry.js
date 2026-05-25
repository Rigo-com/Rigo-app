// =====================================
// RIGO AI
// MODULE REGISTRY
// PURE DATA LAYER
// =====================================



// =====================================
// INTERNAL STATE (PRIVATE)
// =====================================

const moduleLoaderState = {

  modules:
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

};



// =====================================
// HELPERS
// =====================================

function normalizeModuleName(moduleName){

  return String(moduleName || "")
    .trim()
    .toLowerCase();

}



function normalizeDependencies(dependencies){

  if(!Array.isArray(dependencies)){
    return [];
  }

  return [
    ...new Set(

      dependencies
        .filter(Boolean)
        .map(normalizeModuleName)
        .filter(Boolean)

    )
  ];

}



function isValidModuleFactory(factory){

  return typeof factory === "function";

}



function isPlainObject(value){

  if(!value || typeof value !== "object"){
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
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
    typeof value !== "object"
  ){
    return value;
  }

  if(visited.has(value)){
    return value;
  }

  if(
    value instanceof Map ||
    value instanceof Set ||
    value instanceof Date ||
    value instanceof RegExp
  ){
    return value;
  }

  if(!Array.isArray(value) && !isPlainObject(value)){
    return value;
  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    freezeModuleObject(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// MODULE DEFINITION CREATION
// =====================================

function createModuleDefinition(
  moduleName,
  factory,
  options = {}
){

  return {

    metadata:
    freezeModuleObject({

      name:
      moduleName,

      dependencies:
      normalizeDependencies(
        options.dependencies
      ),

      lifecycle:
      options.lifecycle ??
      MODULE_LIFECYCLES.SINGLETON,

      priority:
      options.priority ??
      MODULE_PRIORITIES.NORMAL,

      lazy:
      options.lazy ?? false,

      createdAt:
      Date.now()

    }),

    factory,

    retries:
    0,

    state:
    MODULE_STATES.REGISTERED

  };

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
    normalizeModuleName(moduleName);

  if(!normalizedName){
    return false;
  }

  if(!isValidModuleFactory(factory)){
    return false;
  }

  if(
    moduleLoaderState.modules.has(
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

  moduleLoaderState.modules.set(
    normalizedName,
    definition
  );

  moduleLoaderState.dependencyGraph.set(
    normalizedName,
    definition.metadata.dependencies
  );

  definition.metadata.dependencies.forEach((dependency) => {

    if(
      !moduleLoaderState.reverseDependencies.has(
        dependency
      )
    ){

      moduleLoaderState.reverseDependencies.set(
        dependency,
        new Set()
      );

    }

    moduleLoaderState.reverseDependencies
      .get(dependency)
      .add(normalizedName);

  });

  return true;

}



// =====================================
// LOOKUP API
// =====================================

function getRegisteredModule(moduleName){

  return (
    moduleLoaderState.modules.get(
      normalizeModuleName(moduleName)
    ) || null
  );

}



function hasRegisteredModule(moduleName){

  return moduleLoaderState.modules.has(
    normalizeModuleName(moduleName)
  );

}



function getRegisteredModules(){

  return [
    ...moduleLoaderState.modules.keys()
  ];

}



// =====================================
// INSTANCE ACCESS
// =====================================

function getModuleInstance(moduleName){

  return (
    moduleLoaderState.instances.get(
      normalizeModuleName(moduleName)
    ) || null
  );

}



// =====================================
// SAFE SNAPSHOT
// =====================================

function createModuleRegistrySnapshot(){

  const reverseDependencies = {};

  moduleLoaderState.reverseDependencies.forEach(
    (value, key) => {

      reverseDependencies[key] =
        [...value];

    }
  );

  return freezeModuleObject({

    modules:
    [...moduleLoaderState.modules.keys()],

    activeModules:
    [...moduleLoaderState.activeModules],

    failedModules:
    [...moduleLoaderState.failedModules],

    dependencyGraph:
    Object.fromEntries(
      moduleLoaderState.dependencyGraph
    ),

    reverseDependencies,

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

  getRegisteredModule,

  hasRegisteredModule,

  getRegisteredModules,

  getModuleInstance,

  createModuleRegistrySnapshot

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "ModuleRegistry",
    {

      value:
      ModuleRegistry,

      writable:
      false,

      configurable:
      false

    }
  );

}
