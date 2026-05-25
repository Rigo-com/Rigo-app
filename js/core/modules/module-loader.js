// =====================================
// RIGO AI
// MODULE LOADER
// PUBLIC FACADE LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function normalizeModuleLoaderError(error){

  if(typeof getSafeErrorMessage === "function"){
    return getSafeErrorMessage(error);
  }

  return String(error || "UNKNOWN ERROR");

}



// =====================================
// SNAPSHOT (READ ONLY)
// =====================================

function createModuleLoaderPublicSnapshot(){

  if(typeof createModuleLoaderSnapshot !== "function"){
    return null;
  }

  return createModuleLoaderSnapshot();

}



// =====================================
// RECOVERY (DELEGATED ONLY)
// =====================================

async function recoverModule(moduleName){

  const normalizedName = normalizeModuleName(moduleName);

  if(!normalizedName){
    return false;
  }

  if(typeof recoverModuleRuntime === "function"){
    return await recoverModuleRuntime();
  }

  return false;

}



// =====================================
// INSTANCE ACCESS
// =====================================

function getModuleInstance(moduleName){

  const normalizedName = normalizeModuleName(moduleName);

  if(!normalizedName){
    return null;
  }

  return moduleLoaderState?.instances?.get(normalizedName) || null;

}



// =====================================
// MODULE STATUS (READ ONLY INSPECTOR)
// =====================================

function getModuleStatus(moduleName){

  const moduleDefinition = getRegisteredModule(moduleName);

  if(!moduleDefinition){
    return null;
  }

  return freezeModuleObject({

    name: moduleDefinition.metadata.name,
    state: moduleDefinition.state,
    retries: moduleDefinition.retries,

    dependencies: moduleDefinition.metadata.dependencies,

    active: moduleLoaderState.activeModules.has(moduleDefinition.metadata.name),

    failed: moduleLoaderState.failedModules.has(moduleDefinition.metadata.name)

  });

}



// =====================================
// PUBLIC API (FACADE ONLY)
// =====================================

const ModuleLoader = Object.freeze({

  initialize: initializeModuleLoader,
  register: registerModule,
  load: loadModule,
  unload: unloadModule,
  reset: resetModuleLoader,

  health: getModuleHealth,
  snapshot: createModuleLoaderPublicSnapshot,

  recover: recoverModule,

  status: getModuleStatus,
  instance: getModuleInstance

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(typeof window !== "undefined"){

  window.ModuleLoader = ModuleLoader;

}
