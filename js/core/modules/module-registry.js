// =====================================
// RIGO AI
// MODULE REGISTRY
// PURE DATA LAYER
// =====================================



// =====================================
// STATE (DATA ONLY)
// =====================================

const moduleLoaderState = Object.seal({

  modules: new Map(),
  instances: new Map(),

  activeModules: new Set(),
  failedModules: new Set(),

  dependencyGraph: new Map(),
  reverseDependencies: new Map(),

  loadingStack: []

});



// =====================================
// HELPERS (PURE)
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

  Object.values(value).forEach((v) => {

    if(v && typeof v === "object"){
      freezeModuleObject(v, visited);
    }

  });

  return value;

}



// =====================================
// MODULE DEFINITION CREATION
// =====================================

function createModuleDefinition(moduleName, factory, options = {}){

  return {

    metadata: freezeModuleObject({

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

      createdAt: Date.now()

    }),

    factory,

    retries: 0,

    state: MODULE_STATES.REGISTERED

  };

}



// =====================================
// REGISTER (NO SIDE EFFECTS)
// =====================================

function registerModuleDefinition(moduleName, factory, options = {}){

  const normalizedName = normalizeModuleName(moduleName);

  if(!normalizedName){
    return false;
  }

  if(!isValidModuleFactory(factory)){
    return false;
  }

  if(moduleLoaderState.modules.has(normalizedName)){
    return false;
  }

  const definition =
    createModuleDefinition(normalizedName, factory, options);

  moduleLoaderState.modules.set(normalizedName, definition);

  moduleLoaderState.dependencyGraph.set(
    normalizedName,
    definition.metadata.dependencies
  );

  definition.metadata.dependencies.forEach(dep => {

    const normalizedDep = normalizeModuleName(dep);

    if(!moduleLoaderState.reverseDependencies.has(normalizedDep)){
      moduleLoaderState.reverseDependencies.set(normalizedDep, new Set());
    }

    moduleLoaderState.reverseDependencies.get(normalizedDep).add(normalizedName);

  });

  return true;

}



// =====================================
// LOOKUP API
// =====================================

function getRegisteredModule(moduleName){

  const normalizedName = normalizeModuleName(moduleName);

  return moduleLoaderState.modules.get(normalizedName) || null;

}



function hasRegisteredModule(moduleName){

  return moduleLoaderState.modules.has(
    normalizeModuleName(moduleName)
  );

}



function getRegisteredModules(){

  return [...moduleLoaderState.modules.keys()];

}



// =====================================
// INSTANCE ACCESS (READ ONLY)
// =====================================

function getModuleInstance(moduleName){

  const normalizedName = normalizeModuleName(moduleName);

  return moduleLoaderState.instances.get(normalizedName) || null;

}



// =====================================
// SNAPSHOT (READ ONLY SAFE VIEW)
// =====================================

function createModuleRegistrySnapshot(){

  return freezeModuleObject({

    modules: [...moduleLoaderState.modules.keys()],
    activeModules: [...moduleLoaderState.activeModules],
    failedModules: [...moduleLoaderState.failedModules],
    dependencyGraph: Object.fromEntries(moduleLoaderState.dependencyGraph),
    reverseDependencies: Object.fromEntries(moduleLoaderState.reverseDependencies),

    timestamp: Date.now()

  });

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof window !== "undefined"){

  window.moduleLoaderState = moduleLoaderState;

  window.registerModuleDefinition = registerModuleDefinition;

  window.getRegisteredModule = getRegisteredModule;

  window.hasRegisteredModule = hasRegisteredModule;

  window.getRegisteredModules = getRegisteredModules;

  window.getModuleInstance = getModuleInstance;

  window.createModuleRegistrySnapshot = createModuleRegistrySnapshot;

}
