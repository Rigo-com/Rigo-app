// =====================================
// RIGO AI
// MODULE ACTIVATION
// PURE EXECUTION LAYER
// =====================================



// =====================================
// INTERNAL RUNTIME METRICS
// =====================================

const moduleActivationRuntime = {

  diagnostics: {

    loaded:
    0

  },

  lastLoadedAt:
  null

};



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value === "function";

}



function getActivationDependency(name){

  if(typeof window === "undefined"){
    return null;
  }

  return window[name] || null;

}



// =====================================
// CIRCUIT SAFETY
// =====================================

function detectModuleCircularDependency(moduleName){

  const name =
    normalizeModuleName(moduleName);

  return moduleLoaderState.loadingStack
    .includes(name);

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
      !isFunction(emitSystemEvent)
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

  }catch(error){

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

function createModuleTimeout(timeout){

  const duration =
    timeout ??
    MODULE_LOADER_CONFIG.ACTIVATION_TIMEOUT;

  let timeoutId = null;

  const promise = new Promise((_, reject) => {

    timeoutId = setTimeout(() => {

      reject(
        new Error("MODULE ACTIVATION TIMEOUT")
      );

    }, duration);

  });

  return {

    promise,

    clear(){

      if(timeoutId){
        clearTimeout(timeoutId);
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

  if(
    typeof freezeModuleObject ===
    "function"
  ){

    return freezeModuleObject({

      name:
      moduleDefinition.metadata.name,

      lifecycle:
      moduleDefinition.metadata.lifecycle,

      priority:
      moduleDefinition.metadata.priority,

      dependencies:
      moduleDefinition.metadata.dependencies

    });

  }

  return Object.freeze({

    name:
    moduleDefinition.metadata.name,

    lifecycle:
    moduleDefinition.metadata.lifecycle,

    priority:
    moduleDefinition.metadata.priority,

    dependencies:
    moduleDefinition.metadata.dependencies

  });

}



// =====================================
// EXECUTE MODULE
// =====================================

async function activateModule(
  moduleDefinition
){

  const startedAt =
    Date.now();

  const context =
    createModuleContext(
      moduleDefinition
    );

  const timeout =
    createModuleTimeout(
      MODULE_LOADER_CONFIG.ACTIVATION_TIMEOUT
    );

  try{

    const container =
      getActivationDependency(
        "DependencyContainer"
      );

    const state =
      getActivationDependency(
        "StateManager"
      );

    const diagnostics =
      getActivationDependency(
        "DiagnosticsRuntime"
      );

    const events =
      getActivationDependency(
        "SystemEvents"
      );

    const instance =
      await Promise.race([

        moduleDefinition.factory({

          module:
          context,

          container,

          state,

          diagnostics,

          events

        }),

        timeout.promise

      ]);

    timeout.clear();

    if(instance){

      moduleLoaderState.instances.set(
        moduleDefinition.metadata.name,
        instance
      );

    }

    moduleLoaderState.activeModules.add(
      moduleDefinition.metadata.name
    );

    moduleLoaderState.failedModules.delete(
      moduleDefinition.metadata.name
    );

    moduleDefinition.state =
      MODULE_STATES.ACTIVE;

    moduleActivationRuntime.diagnostics.loaded++;

    moduleActivationRuntime.lastLoadedAt =
      Date.now();

    if(
      isFunction(trackPerformanceMetric)
    ){

      trackPerformanceMetric(
        "module.activation",
        Date.now() - startedAt,
        {

          module:
          moduleDefinition.metadata.name

        }
      );

    }

    await emitModuleEvent(

      MODULE_EVENTS.ACTIVATED,

      {

        module:
        moduleDefinition.metadata.name

      }

    );

    return instance;

  }catch(error){

    timeout.clear();

    moduleDefinition.state =
      MODULE_STATES.FAILED;

    moduleLoaderState.failedModules.add(
      moduleDefinition.metadata.name
    );

    if(
      isFunction(logDiagnosticError)
    ){

      await logDiagnosticError(

        "MODULE ACTIVATION FAILED",

        {

          module:
          moduleDefinition.metadata.name,

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

async function loadModule(moduleName){

  const name =
    normalizeModuleName(moduleName);

  if(!name){
    return false;
  }

  if(
    detectModuleCircularDependency(name)
  ){
    return false;
  }

  if(
    moduleLoaderState.activeModules.has(name)
  ){
    return true;
  }

  const moduleDefinition =
    moduleLoaderState.modules.get(name);

  if(!moduleDefinition){
    return false;
  }

  moduleLoaderState.loadingStack.push(
    name
  );

  try{

    moduleDefinition.state =
      MODULE_STATES.INITIALIZING;

    await emitModuleEvent(

      MODULE_EVENTS.INITIALIZED,

      {

        module:
        name

      }

    );

    moduleDefinition.state =
      MODULE_STATES.LOADING;

    const instance =
      await activateModule(
        moduleDefinition
      );

    if(!instance){

      throw new Error(
        "ACTIVATION FAILED"
      );

    }

    await emitModuleEvent(

      MODULE_EVENTS.LOADED,

      {

        module:
        name

      }

    );

    return true;

  }catch(error){

    moduleDefinition.retries =
      (moduleDefinition.retries || 0) + 1;

    moduleDefinition.state =
      MODULE_STATES.FAILED;

    moduleLoaderState.failedModules.add(
      name
    );

    if(
      isFunction(logDiagnosticError)
    ){

      await logDiagnosticError(

        "MODULE LOAD FAILED",

        {

          module:
          name,

          retries:
          moduleDefinition.retries,

          error:
          String(error)

        }

      );

    }

    return false;

  }finally{

    moduleLoaderState.loadingStack =
      moduleLoaderState.loadingStack
        .filter((module) => {

          return module !== name;

        });

  }

}



// =====================================
// UNLOAD MODULE
// =====================================

async function unloadModule(moduleName){

  const name =
    normalizeModuleName(moduleName);

  if(!name){
    return false;
  }

  if(
    !moduleLoaderState.modules.has(name)
  ){
    return false;
  }

  const moduleDefinition =
    moduleLoaderState.modules.get(name);

  const instance =
    moduleLoaderState.instances.get(name);

  moduleDefinition.state =
    MODULE_STATES.UNLOADING;

  await emitModuleEvent(

    MODULE_EVENTS.UNLOADING,

    {

      module:
      name

    }

  );

  if(
    instance &&
    isFunction(instance.destroy)
  ){

    try{

      await instance.destroy();

    }catch(error){

      console.warn(
        "[ModuleActivation] Destroy failed:",
        name,
        error
      );

    }

  }

  moduleLoaderState.instances.delete(
    name
  );

  moduleLoaderState.activeModules.delete(
    name
  );

  moduleLoaderState.failedModules.delete(
    name
  );

  moduleDefinition.state =
    MODULE_STATES.UNLOADED;

  await emitModuleEvent(

    MODULE_EVENTS.UNLOADED,

    {

      module:
      name

    }

  );

  return true;

}
