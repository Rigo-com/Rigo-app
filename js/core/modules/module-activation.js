// =====================================
// RIGO AI
// MODULE ACTIVATION
// PURE EXECUTION LAYER
// =====================================



// =====================================
// INTERNAL RUNTIME METRICS
// =====================================

const moduleActivationRuntime =
Object.seal({

  diagnostics:
  Object.seal({

    loaded:0,

    failed:0,

    unloaded:0

  }),

  lastLoadedAt:null,

  lastFailedAt:null,

  lastUnloadedAt:null

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}



function normalizeActivationError(
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



function getModuleRuntime(
  moduleName
){

  if(

    typeof ModuleRegistry ===
    "undefined" ||

    !isFunction(
      ModuleRegistry
      .getModuleRuntimeState
    )

  ){

    return null;

  }

  return ModuleRegistry
  .getModuleRuntimeState(
    moduleName
  );

}



function updateModuleRuntime(
  moduleName,
  updates = {}
){

  const runtime =
  getModuleRuntime(
    moduleName
  );

  if(
    !runtime
  ){

    return false;

  }

  Object.assign(
    runtime,
    updates
  );

  return true;

}



// =====================================
// CIRCUIT SAFETY
// =====================================

function detectModuleCircularDependency(
  moduleName
){

  const snapshot =

    ModuleRegistry
    ?.snapshot?.();

  const loadingStack =
    snapshot
    ?.loadingStack || [];

  return loadingStack
  .includes(
    normalizeModuleName(
      moduleName
    )
  );

}



// =====================================
// SAFE EVENT EMITTER
// =====================================

async function emitModuleEvent(
  eventName,
  payload = {}
){

  try{

    if(
      !isFunction(
        emitSystemEvent
      )
    ){

      return false;

    }

    await emitSystemEvent(

      eventName,

      {

        source:
        "module-activation",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    console.warn(

      "[ModuleActivation] Event emission failed:",

      eventName,

      error

    );

    return false;

  }

}



// =====================================
// TIMEOUT WRAPPER
// =====================================

function createModuleTimeout(
  timeout
){

  const duration =

    timeout ??

    MODULE_LOADER_CONFIG
    .ACTIVATION_TIMEOUT;

  let timeoutId =
  null;

  const promise =
  new Promise((_, reject) => {

    timeoutId =
    setTimeout(() => {

      reject(

        new Error(
          "MODULE ACTIVATION TIMEOUT"
        )

      );

    },

    duration);

  });

  return {

    promise,

    clear(){

      if(timeoutId){

        clearTimeout(
          timeoutId
        );

      }

    }

  };

}



// =====================================
// MODULE CONTEXT
// =====================================

function createModuleContext(
  moduleDefinition
){

  const context = {

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
    .dependencies,

    createdAt:
    Date.now()

  };

  if(
    typeof freezeModuleObject ===
    "function"
  ){

    return freezeModuleObject(
      context
    );

  }

  return Object.freeze(
    context
  );

}



// =====================================
// LOAD DEPENDENCIES
// =====================================

async function loadModuleDependencies(
  moduleDefinition
){

  const dependencies =

    moduleDefinition
    .metadata
    .dependencies;

  for(
    const dependency
    of dependencies
  ){

    const loaded =
    await loadModule(
      dependency
    );

    if(
      !loaded
    ){

      throw new Error(

        `DEPENDENCY LOAD FAILED: ${dependency}`

      );

    }

  }

  await emitModuleEvent(

    MODULE_EVENTS
    .DEPENDENCIES_RESOLVED,

    {

      module:
      moduleDefinition
      .metadata
      .name,

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

  const moduleName =

    moduleDefinition
    .metadata
    .name;

  const runtime =
  getModuleRuntime(
    moduleName
  );

  if(
    !runtime
  ){

    return null;

  }

  const startedAt =
  Date.now();

  const context =
  createModuleContext(
    moduleDefinition
  );

  const timeout =
  createModuleTimeout(

    MODULE_LOADER_CONFIG
    .ACTIVATION_TIMEOUT

  );

  try{

    updateModuleRuntime(

      moduleName,

      {

        state:
        MODULE_STATES
        .INITIALIZING

      }

    );

    const container =

      typeof Container !==
      "undefined"

      ?

      Container

      :

      null;

    const state =

      typeof StateManager !==
      "undefined"

      ?

      StateManager

      :

      null;

    const diagnostics =

      typeof DiagnosticsRuntime !==
      "undefined"

      ?

      DiagnosticsRuntime

      :

      null;

    const events =

      typeof SystemEvents !==
      "undefined"

      ?

      SystemEvents

      :

      null;

    const instance =
    await Promise.race([

      moduleDefinition
      .factory({

        module:
        context,

        container,

        state,

        diagnostics,

        events

      }),

      timeout
      .promise

    ]);

    timeout.clear();

    if(instance){

      ModuleRegistry
      .setModuleInstance(

        moduleName,
        instance

      );

    }

    ModuleRegistry
    .markModuleActive(
      moduleName
    );

    ModuleRegistry
    .clearFailedModule(
      moduleName
    );

    updateModuleRuntime(

      moduleName,

      {

        state:
        MODULE_STATES
        .ACTIVE,

        activatedAt:
        Date.now(),

        failedAt:null

      }

    );

    moduleActivationRuntime
    .diagnostics
    .loaded++;

    moduleActivationRuntime
    .lastLoadedAt =
    Date.now();

    if(
      isFunction(
        trackPerformanceMetric
      )
    ){

      trackPerformanceMetric(

        "module.activation",

        Date.now() -
        startedAt,

        {

          module:
          moduleName

        }

      );

    }

    await emitModuleEvent(

      MODULE_EVENTS
      .ACTIVATED,

      {

        module:
        moduleName

      }

    );

    return instance;

  }

  catch(error){

    timeout.clear();

    updateModuleRuntime(

      moduleName,

      {

        state:
        MODULE_STATES
        .FAILED,

        retries:
        runtime.retries + 1,

        failedAt:
        Date.now()

      }

    );

    ModuleRegistry
    .markModuleFailed(
      moduleName
    );

    moduleActivationRuntime
    .diagnostics
    .failed++;

    moduleActivationRuntime
    .lastFailedAt =
    Date.now();

    if(
      isFunction(
        logDiagnosticError
      )
    ){

      await logDiagnosticError(

        "MODULE ACTIVATION FAILED",

        {

          module:
          moduleName,

          error:
          normalizeActivationError(
            error
          )

        }

      );

    }

    await emitModuleEvent(

      MODULE_EVENTS
      .ACTIVATION_FAILED,

      {

        module:
        moduleName,

        error:
        normalizeActivationError(
          error
        )

      }

    );

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

  if(
    !normalizedName
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
  ModuleRegistry
  .getRegisteredModule(
    normalizedName
  );

  if(
    !moduleDefinition
  ){

    return false;

  }

  const runtime =
  getModuleRuntime(
    normalizedName
  );

  if(
    !runtime
  ){

    return false;

  }

  if(

    runtime.state ===
    MODULE_STATES.ACTIVE

  ){

    return true;

  }

  ModuleRegistry
  .pushLoadingModule(
    normalizedName
  );

  try{

    updateModuleRuntime(

      normalizedName,

      {

        state:
        MODULE_STATES
        .INITIALIZING

      }

    );

    await emitModuleEvent(

      MODULE_EVENTS
      .INITIALIZED,

      {

        module:
        normalizedName

      }

    );

    await loadModuleDependencies(
      moduleDefinition
    );

    updateModuleRuntime(

      normalizedName,

      {

        state:
        MODULE_STATES
        .LOADING

      }

    );

    const instance =
    await activateModule(
      moduleDefinition
    );

    if(
      !instance
    ){

      throw new Error(
        "ACTIVATION FAILED"
      );

    }

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

    updateModuleRuntime(

      normalizedName,

      {

        state:
        MODULE_STATES
        .FAILED,

        retries:
        runtime.retries + 1,

        failedAt:
        Date.now()

      }

    );

    ModuleRegistry
    .markModuleFailed(
      normalizedName
    );

    moduleActivationRuntime
    .diagnostics
    .failed++;

    moduleActivationRuntime
    .lastFailedAt =
    Date.now();

    if(
      isFunction(
        logDiagnosticError
      )
    ){

      await logDiagnosticError(

        "MODULE LOAD FAILED",

        {

          module:
          normalizedName,

          retries:
          runtime.retries + 1,

          error:
          normalizeActivationError(
            error
          )

        }

      );

    }

    await emitModuleEvent(

      MODULE_EVENTS
      .LOAD_FAILED,

      {

        module:
        normalizedName,

        error:
        normalizeActivationError(
          error
        )

      }

    );

    if(

      MODULE_LOADER_CONFIG
      .ENABLE_RETRY_LOADING &&

      runtime.retries <

      MODULE_LOADER_CONFIG
      .MAX_RETRIES

    ){

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

    return false;

  }

  finally{

    ModuleRegistry
    .removeLoadingModule(
      normalizedName
    );

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

  if(
    !normalizedName
  ){

    return false;

  }

  const moduleDefinition =
  ModuleRegistry
  .getRegisteredModule(
    normalizedName
  );

  if(
    !moduleDefinition
  ){

    return false;

  }

  const runtime =
  getModuleRuntime(
    normalizedName
  );

  if(
    !runtime
  ){

    return false;

  }

  updateModuleRuntime(

    normalizedName,

    {

      state:
      MODULE_STATES
      .UNLOADING

    }

  );

  await emitModuleEvent(

    MODULE_EVENTS
    .UNLOADING,

    {

      module:
      normalizedName

    }

  );

  const instance =
  ModuleRegistry
  .getModuleInstance(
    normalizedName
  );

  if(

    instance &&

    isFunction(
      instance.destroy
    )

  ){

    try{

      await instance
      .destroy();

    }

    catch(error){

      console.warn(

        "[ModuleActivation] Destroy failed:",

        normalizedName,

        error

      );

    }

  }

  ModuleRegistry
  .removeModuleInstance(
    normalizedName
  );

  ModuleRegistry
  .clearActiveModule(
    normalizedName
  );

  ModuleRegistry
  .clearFailedModule(
    normalizedName
  );

  updateModuleRuntime(

    normalizedName,

    {

      state:
      MODULE_STATES
      .UNLOADED

    }

  );

  moduleActivationRuntime
  .diagnostics
  .unloaded++;

  moduleActivationRuntime
  .lastUnloadedAt =
  Date.now();

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


// =====================================
// PUBLIC API
// =====================================

const ModuleActivation =
Object.freeze({

  load:
  loadModule,

  unload:
  unloadModule,

  activate:
  activateModule

});



// =====================================
// EXPORTS
// =====================================

export {

  loadModule,

  unloadModule,

  activateModule,

  loadModuleDependencies,

  createModuleContext,

  moduleActivationRuntime,

  ModuleActivation

};

export default
ModuleActivation;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "ModuleActivation",

    {

      value:
      ModuleActivation,

      writable:false,

      configurable:false

    }

  );

}
