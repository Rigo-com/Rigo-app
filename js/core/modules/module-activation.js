// =====================================
// RIGO AI
// MODULE ACTIVATION
// =====================================



// =====================================
// CIRCULAR CHECK
// =====================================

function detectModuleCircularDependency(
  moduleName
){

  return (

    moduleLoaderState
    .loadingStack
    .includes(
      moduleName
    )

  );

}



// =====================================
// LOAD DEPENDENCIES
// =====================================

async function loadModuleDependencies(
  dependencies = []
){

  for(
    const dependency
    of dependencies
  ){

    const loaded =
    await loadModule(
      dependency
    );

    if(!loaded){

      return false;

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

  try{

    const moduleInstance =
    await moduleDefinition
    .factory({

      container:
      DependencyContainer,

      state:
      StateManager,

      diagnostics:
      diagnosticsState,

      events:
      SystemEvents

    });

    moduleLoaderState
    .activeModules
    .add(
      moduleDefinition
      .name
    );

    moduleLoaderState
    .diagnostics
    .activated++;

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        MODULE_EVENTS
        .ACTIVATED,

        {

          module:
          moduleDefinition
          .name

        }

      );

    }

    return moduleInstance;

  }

  catch(error){

    moduleLoaderState
    .failedModules
    .add(
      moduleDefinition
      .name
    );

    moduleLoaderState
    .diagnostics
    .failed++;

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "MODULE ACTIVATION FAILED",

        {

          module:
          moduleDefinition
          .name,

          error:
          String(error)

        }

      );

    }

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

  if(!normalizedName){

    return false;

  }

  if(

    moduleLoaderState
    .loadingStack
    .length >

    MODULE_LOADER_CONFIG
    .MAX_BOOT_DEPTH

  ){

    return false;

  }

  if(

    detectModuleCircularDependency(
      normalizedName
    )

  ){

    return false;

  }

  const moduleDefinition =

    moduleLoaderState
    .modules
    .get(
      normalizedName
    );

  if(!moduleDefinition){

    return false;

  }

  if(

    moduleLoaderState
    .activeModules
    .has(
      normalizedName
    )

  ){

    return true;

  }

  moduleLoaderState
  .loadingStack
  .push(
    normalizedName
  );

  try{

    moduleDefinition.state =
    MODULE_STATES
    .LOADING;



    // ================================
    // LOAD DEPENDENCIES
    // ================================

    const dependenciesLoaded =
    await loadModuleDependencies(

      moduleDefinition
      .dependencies

    );

    if(!dependenciesLoaded){

      throw new Error(
        "DEPENDENCY LOAD FAILED"
      );

    }



    // ================================
    // ACTIVATE
    // ================================

    const activated =
    await activateModule(
      moduleDefinition
    );

    if(!activated){

      throw new Error(
        "MODULE ACTIVATION FAILED"
      );

    }

    moduleDefinition.state =
    MODULE_STATES
    .ACTIVE;

    moduleLoaderState
    .diagnostics
    .loaded++;

    moduleLoaderState
    .lastLoadedAt =
    Date.now();

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        MODULE_EVENTS
        .LOADED,

        {

          module:
          normalizedName

        }

      );

    }

    return true;

  }

  catch(error){

    moduleDefinition.retries++;

    moduleDefinition.state =
    MODULE_STATES
    .FAILED;

    moduleLoaderState
    .failedModules
    .add(
      normalizedName
    );

    if(

      MODULE_LOADER_CONFIG
      .ENABLE_RETRY_LOADING &&

      moduleDefinition.retries <

      MODULE_LOADER_CONFIG
      .MAX_RETRIES

    ){

      moduleLoaderState
      .diagnostics
      .retries++;

      return loadModule(
        normalizedName
      );

    }

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        MODULE_EVENTS
        .FAILED,

        {

          module:
          normalizedName,

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    moduleLoaderState
    .loadingStack =

    moduleLoaderState
    .loadingStack
    .filter((item) => {

      return (
        item !==
        normalizedName
      );

    });

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

  if(!normalizedName){

    return false;

  }

  if(

    !moduleLoaderState
    .modules
    .has(
      normalizedName
    )

  ){

    return false;

  }

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

  const moduleDefinition =

    moduleLoaderState
    .modules
    .get(
      normalizedName
    );

  moduleDefinition.state =
  MODULE_STATES
  .DISABLED;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      MODULE_EVENTS
      .UNLOADED,

      {

        module:
        normalizedName

      }

    );

  }

  return true;

}
