// =====================================
// RIGO AI
// MODULE LOADER
// PUBLIC FACADE LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function normalizeModuleLoaderError(error){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(error);

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



function isFunction(value){

  return typeof value === "function";

}



function safeFreeze(value){

  if(
    typeof freezeModuleObject ===
    "function"
  ){

    return freezeModuleObject(value);

  }

  return Object.freeze(value);

}



// =====================================
// SNAPSHOT (READ ONLY)
// =====================================

function createModuleLoaderPublicSnapshot(){

  if(
    !isFunction(createModuleLoaderSnapshot)
  ){
    return null;
  }

  try{

    return createModuleLoaderSnapshot();

  }catch(error){

    console.error(
      "[ModuleLoader] Snapshot failed:",
      normalizeModuleLoaderError(error)
    );

    return null;

  }

}



// =====================================
// RECOVERY (DELEGATED)
// =====================================

async function recoverModule(moduleName){

  const normalizedName =
    normalizeModuleName(moduleName);

  if(!normalizedName){
    return false;
  }

  if(
    !isFunction(recoverModuleRuntime)
  ){
    return false;
  }

  try{

    return await recoverModuleRuntime(
      normalizedName
    );

  }catch(error){

    console.error(
      "[ModuleLoader] Recovery failed:",
      normalizedName,
      normalizeModuleLoaderError(error)
    );

    return false;

  }

}



// =====================================
// INSTANCE ACCESS
// =====================================

function getModuleLoaderInstance(moduleName){

  const normalizedName =
    normalizeModuleName(moduleName);

  if(!normalizedName){
    return null;
  }

  if(
    typeof ModuleRegistry !== "undefined" &&
    isFunction(ModuleRegistry.getModuleInstance)
  ){

    return ModuleRegistry.getModuleInstance(
      normalizedName
    );

  }

  return null;

}



// =====================================
// MODULE STATUS
// =====================================

function getModuleStatus(moduleName){

  if(
    !isFunction(getRegisteredModule)
  ){
    return null;
  }

  const moduleDefinition =
    getRegisteredModule(moduleName);

  if(!moduleDefinition){
    return null;
  }

  return safeFreeze({

    name:
    moduleDefinition.metadata.name,

    state:
    moduleDefinition.state,

    retries:
    moduleDefinition.retries,

    dependencies:
    moduleDefinition.metadata.dependencies,

    lifecycle:
    moduleDefinition.metadata.lifecycle,

    priority:
    moduleDefinition.metadata.priority,

    lazy:
    moduleDefinition.metadata.lazy,

    createdAt:
    moduleDefinition.metadata.createdAt,

    active:
    typeof moduleLoaderState !== "undefined"
      ? moduleLoaderState.activeModules.has(
          moduleDefinition.metadata.name
        )
      : false,

    failed:
    typeof moduleLoaderState !== "undefined"
      ? moduleLoaderState.failedModules.has(
          moduleDefinition.metadata.name
        )
      : false

  });

}



// =====================================
// SAFE WRAPPERS
// =====================================

async function safeInitializeModuleLoader(){

  if(
    !isFunction(initializeModuleLoader)
  ){
    return false;
  }

  return await initializeModuleLoader();

}



async function safeRegisterModule(
  ...args
){

  if(
    !isFunction(registerModule)
  ){
    return false;
  }

  return await registerModule(...args);

}



async function safeLoadModule(
  ...args
){

  if(
    !isFunction(loadModule)
  ){
    return false;
  }

  return await loadModule(...args);

}



async function safeUnloadModule(
  ...args
){

  if(
    !isFunction(unloadModule)
  ){
    return false;
  }

  return await unloadModule(...args);

}



async function safeResetModuleLoader(){

  if(
    !isFunction(resetModuleLoader)
  ){
    return false;
  }

  return await resetModuleLoader();

}



// =====================================
// PUBLIC API
// =====================================

const ModuleLoader =
Object.freeze({

  initialize:
  safeInitializeModuleLoader,

  register:
  safeRegisterModule,

  load:
  safeLoadModule,

  unload:
  safeUnloadModule,

  reset:
  safeResetModuleLoader,

  health:
  typeof getModuleHealth === "function"
    ? getModuleHealth
    : () => null,

  snapshot:
  createModuleLoaderPublicSnapshot,

  recover:
  recoverModule,

  status:
  getModuleStatus,

  instance:
  getModuleLoaderInstance

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "ModuleLoader",
    {

      value:
      ModuleLoader,

      writable:
      false,

      configurable:
      false

    }
  );

}
