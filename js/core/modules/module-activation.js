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
// SAFE MODULE EVENT
// =====================================

async function emitModuleEvent(
  eventName,
  payload = {}
){

  try{

    if(
      typeof emitSystemEvent !==
      "function"
    ){

      return false;

    }

    await emitSystemEvent(

      eventName,

      {

        source:
        "module-loader",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// TIMEOUT
// =====================================

function createModuleTimeout(
  timeout =

    MODULE_LOADER_CONFIG
    .MODULE_TIMEOUT
){

  return new Promise((_,reject) => {

    setTimeout(() => {

      reject(

        new Error(
          "MODULE TIMEOUT"
        )

      );

    },

    timeout);

  });

}



// =====================================
// MODULE CONTEXT
// =====================================

function createModuleContext(
  moduleDefinition
){

  return freezeModuleObject({

    name:

      moduleDefinition
      .metadata
      .name,

    lifecycle:

      moduleDefinition
      .metadata
      .lifecycle,

    priority:

      moduleDefinition
      .metadata
      .priority,

    dependencies:

      moduleDefinition
      .metadata
      .dependencies

  });

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

  await emitModuleEvent(

    MODULE_EVENTS
    .DEPENDENCIES_RESOLVED,

    {

      dependencies

    }

  );

  return true;

}



// =====================================
// ACTIVATE MODULE
// =====================================

async function activateModule(
  moduleDefinition
){

  try{

    const startedAt =
    Date.now();

    const moduleContext =
    createModuleContext(
      moduleDefinition
    );

    const moduleInstance =
    await Promise.race([

      moduleDefinition
      .factory({

        module:
        moduleContext,

        container:
        DependencyContainer,

        dependencies:
        DependencySystem,

        state:
        StateManager,

        diagnostics:
        DiagnosticsRuntime,

        events:
        SystemEvents

      }),

      createModuleTimeout(

        MODULE_LOADER_CONFIG
        .ACTIVATION_TIMEOUT

      )

    ]);



    // ================================
    // INSTANCE STORE
    // ================================

    if(
      !moduleLoaderState
      .instances
    ){

      moduleLoaderState
      .instances =
      new Map();

    }

    moduleLoaderState
    .instances
    .set(

      moduleDefinition
      .metadata
      .name,

      moduleInstance

    );



    // ================================
    // ACTIVE
    // ================================

    moduleLoaderState
    .activeModules
    .add(

      moduleDefinition
      .metadata
      .name

    );

    moduleLoaderState
    .failedModules
    .delete(

      moduleDefinition
      .metadata
      .name

    );

    moduleLoaderState
    .diagnostics
    .activated++;

    if(
      typeof trackPerformanceMetric ===
      "function"
    ){

      trackPerformanceMetric(

        "module.activation",

        Date.now() -
        startedAt,

        {

          module:

            moduleDefinition
            .metadata
            .name

        }

      );

    }

    await emitModuleEvent(

      MODULE_EVENTS
      .ACTIVATED,

      {

        module:

          moduleDefinition
          .metadata
          .name

      }

    );

    return moduleInstance;

  }

  catch(error){

    moduleLoaderState
    .failedModules
    .add(

      moduleDefinition
      .metadata
      .name

    );

    moduleLoaderState
    .diagnostics
    .failed++;

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "MODULE ACTIVATION FAILED",

        {

          module:

            moduleDefinition
            .metadata
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
    .INITIALIZING;

    await emitModuleEvent(

      MODULE_EVENTS
      .INITIALIZED,

      {

        module:
        normalizedName

      }

    );

    moduleDefinition.state =
    MODULE_STATES
    .LOADING;



    // ================================
    // DEPENDENCIES
    // ================================

    const dependenciesLoaded =
    await loadModuleDependencies(

      moduleDefinition
      .metadata
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

    await emitModuleEvent(

      MODULE_EVENTS
      .LOADED,

      {

        module:
        normalizedName

      }

    );

    return true;

  }

  catch(error){

    moduleDefinition.retries =
    Number(
      moduleDefinition
      .retries || 0
    ) + 1;

    moduleDefinition.state =
    MODULE_STATES
    .FAILED;

    moduleLoaderState
    .failedModules
    .add(
      normalizedName
    );

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "MODULE LOAD FAILED",

        {

          module:
          normalizedName,

          retries:
          moduleDefinition
          .retries,

          error:
          String(error)

        }

      );

    }



    // ================================
    // RETRY
    // ================================

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

      await new Promise((resolve) => {

        setTimeout(

          resolve,

          MODULE_LOADER_CONFIG
          .RETRY_DELAY

        );

      });

      return loadModule(
        normalizedName
      );

    }

    await emitModuleEvent(

      MODULE_EVENTS
      .FAILED,

      {

        module:
        normalizedName,

        error:
        String(error)

      }

    );

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

  const dependents =

    moduleLoaderState
    .reverseDependencies
    ?.get(
      normalizedName
    );

  if(
    dependents &&
    dependents.size > 0
  ){

    for(
      const dependent
      of dependents
    ){

      await unloadModule(
        dependent
      );

    }

  }

  const moduleDefinition =

    moduleLoaderState
    .modules
    .get(
      normalizedName
    );

  moduleDefinition.state =
  MODULE_STATES
  .UNLOADING;

  await emitModuleEvent(

    MODULE_EVENTS
    .UNLOADING,

    {

      module:
      normalizedName

    }

  );



  // ================================
  // DESTROY INSTANCE
  // ================================

  const moduleInstance =

    moduleLoaderState
    ?.instances
    ?.get(
      normalizedName
    );

  if(
    moduleInstance &&
    typeof moduleInstance
    .destroy ===
    "function"
  ){

    try{

      await moduleInstance
      .destroy();

    }

    catch(error){}

  }

  moduleLoaderState
  ?.instances
  ?.delete(
    normalizedName
  );



  // ================================
  // CLEANUP
  // ================================

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

  moduleDefinition.state =
  MODULE_STATES
  .UNLOADED;

  await emitModuleEvent(

    MODULE_EVENTS
    .UNLOADED,

    {

      module:
      normalizedName

    }

  );

  return true;

}
