// =====================================
// RIGO AI
// MODULE LOADER
// PUBLIC MODULE API
// =====================================



// =====================================
// SNAPSHOT
// =====================================

function createModuleLoaderPublicSnapshot(){

  if(
    typeof createModuleLoaderSnapshot !==
    "function"
  ){

    return null;

  }

  return createModuleLoaderSnapshot();

}



// =====================================
// RECOVERY
// =====================================

async function recoverModule(
  moduleName
){

  try{

    await unloadModule(
      moduleName
    );

    return await loadModule(
      moduleName
    );

  }

  catch(error){

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "MODULE RECOVERY FAILED",

        {

          module:
          moduleName,

          error:
          String(error)

        }

      );

    }

    return false;

  }

}



// =====================================
// INSTANCE ACCESS
// =====================================

function getModuleInstance(
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

  return moduleLoaderState
  ?.instances
  ?.get(
    normalizedName
  )

  || null;

}



// =====================================
// PUBLIC API
// =====================================

const ModuleLoader =
Object.freeze({

  // ===================================
  // LIFECYCLE
  // ===================================

  initialize:
  initializeModuleLoader,

  register:
  registerModule,

  load:
  loadModule,

  unload:
  unloadModule,

  reset:
  resetModuleLoader,



  // ===================================
  // HEALTH
  // ===================================

  health:
  getModuleHealth,

  snapshot:
  createModuleLoaderPublicSnapshot,



  // ===================================
  // RECOVERY
  // ===================================

  recover:
  recoverModule,



  // ===================================
  // INSTANCES
  // ===================================

  instance:
  getModuleInstance

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ModuleLoader =
  ModuleLoader;

}
