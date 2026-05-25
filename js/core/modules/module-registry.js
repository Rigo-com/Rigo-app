// =====================================
// RIGO AI
// MODULE REGISTRY
// =====================================



// =====================================
// MODULE STATE
// =====================================

const moduleLoaderState =
Object.seal({

  initialized:false,

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

  loadingStack:[],

  diagnostics:{

    registered:0,

    loaded:0,

    activated:0,

    failed:0,

    retries:0

  },

  lastLoadedAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeModuleName(moduleName){

  return String(moduleName || "")
    .trim()
    .toLowerCase();

}



function isValidModuleFactory(factory){

  return typeof factory === "function";

}



function freezeModuleObject(value, visited = new WeakSet()){

  if(!value || typeof value !== "object"){
    return value;
  }

  if(visited.has(value)){
    return value;
  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(nestedValue && typeof nestedValue === "object"){
      freezeModuleObject(nestedValue, visited);
    }

  });

  return value;

}



// =====================================
// ERROR HANDLER
// =====================================

function createModuleError(message, metadata = {}){

  if(typeof logDiagnosticError === "function"){

    logDiagnosticError(message, metadata);

  }

  return false;

}



// =====================================
// DEPENDENCY GRAPH
// =====================================

function registerReverseDependencies(moduleName, dependencies = []){

  dependencies.forEach((dependency) => {

    const normalizedDependency =
      normalizeModuleName(dependency);

    if(!moduleLoaderState.reverseDependencies.has(normalizedDependency)){

      moduleLoaderState.reverseDependencies.set(
        normalizedDependency,
        new Set()
      );

    }

    moduleLoaderState.reverseDependencies
      .get(normalizedDependency)
      .add(moduleName);

  });

  return true;

}



// =====================================
// CREATE MODULE DEFINITION
// =====================================

function createModuleDefinition(moduleName, factory, options = {}){

  return {

    metadata:
    freezeModuleObject({

      name: moduleName,

      dependencies: Array.isArray(options.dependencies)
        ? options.dependencies.filter(Boolean)
        : [],

      lifecycle:
        options.lifecycle ?? MODULE_LIFECYCLES.SINGLETON,

      priority:
        options.priority ?? MODULE_PRIORITIES.NORMAL,

      lazy:
        options.lazy ?? false,

      createdAt:
        Date.now()

    }),

    factory,

    retries:0,

    state:
    MODULE_STATES.REGISTERED

  };

}



// =====================================
// REGISTER MODULE
// =====================================

async function registerModule(moduleName, factory, options = {}){

  const normalizedName = normalizeModuleName(moduleName);

  if(!normalizedName){
    return createModuleError("INVALID MODULE NAME");
  }

  if(!isValidModuleFactory(factory)){
    return createModuleError("INVALID MODULE FACTORY", { module: normalizedName });
  }

  if(moduleLoaderState.modules.size >= MODULE_LOADER_CONFIG.MAX_MODULES){
    return createModuleError("MAX MODULES REACHED");
  }

  if(moduleLoaderState.modules.has(normalizedName)){
    return createModuleError("MODULE ALREADY REGISTERED", { module: normalizedName });
  }

  const moduleDefinition =
    createModuleDefinition(normalizedName, factory, options);

  moduleLoaderState.modules.set(normalizedName, moduleDefinition);

  moduleLoaderState.dependencyGraph.set(
    normalizedName,
    moduleDefinition.metadata.dependencies
  );

  registerReverseDependencies(
    normalizedName,
    moduleDefinition.metadata.dependencies
  );

  moduleLoaderState.diagnostics.registered++;

  if(typeof emitSystemEvent === "function"){

    await emitSystemEvent(
      MODULE_EVENTS.REGISTERED,
      { module: normalizedName }
    );

  }

  return true;

}



// =====================================
// GET MODULE
// =====================================

function getRegisteredModule(moduleName){

  const normalizedName = normalizeModuleName(moduleName);

  return moduleLoaderState.modules.get(normalizedName) || null;

}



// =====================================
// HAS MODULE
// =====================================

function hasRegisteredModule(moduleName){

  return moduleLoaderState.modules.has(
    normalizeModuleName(moduleName)
  );

}



// =====================================
// GET ALL MODULES
// =====================================

function getRegisteredModules(){

  return [...moduleLoaderState.modules.keys()];

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof window !== "undefined"){

  window.moduleLoaderState = moduleLoaderState;

  window.registerModule = registerModule;

  window.getRegisteredModule = getRegisteredModule;

  window.hasRegisteredModule = hasRegisteredModule;

  window.getRegisteredModules = getRegisteredModules;

}
