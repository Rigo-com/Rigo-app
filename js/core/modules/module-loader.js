// =====================================
// RIGO AI
// MODULE LOADER
// PUBLIC MODULE API
// =====================================



// =====================================
// HELPERS
// =====================================

function normalizeModuleLoaderError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



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

  const normalizedName =
  normalizeModuleName(
    moduleName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  try{

    await unloadModule(
      normalizedName
    );

    const recovered =
    await loadModule(
      normalizedName
    );

    if(
      recovered
    ){

      if(
        typeof emitSystemEvent ===
        "function"
      ){

        await emitSystemEvent(

          MODULE_EVENTS
          .RECOVERED,

          {

            module:
            normalizedName

          }

        );

      }

      moduleLoaderState
      .failedModules
      .delete(
        normalizedName
      );

    }

    return recovered;

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
          normalizedName,

          error:
          normalizeModuleLoaderError(
            error
          )

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
// MODULE STATUS
// =====================================

function getModuleStatus(
  moduleName
){

  const moduleDefinition =
  getRegisteredModule(
    moduleName
  );

  if(
    !moduleDefinition
  ){

    return null;

  }

  return freezeModuleObject({

    name:

      moduleDefinition
      .metadata
      .name,

    state:
    moduleDefinition
    .state,

    retries:
    moduleDefinition
    .retries,

    dependencies:

      moduleDefinition
      .metadata
      .dependencies,

    active:

      moduleLoaderState
      .activeModules
      .has(

        moduleDefinition
        .metadata
        .name

      ),

    failed:

      moduleLoaderState
      .failedModules
      .has(

        moduleDefinition
        .metadata
        .name

      )

  });

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
  // STATUS
  // ===================================

  status:
  getModuleStatus,



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
