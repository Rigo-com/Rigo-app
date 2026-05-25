// =====================================
// RIGO AI
// MODULE ACTIVATION
// PURE EXECUTION LAYER
// =====================================



// =====================================
// CIRCUIT SAFETY
// =====================================

function detectModuleCircularDependency(moduleName){

  const name = normalizeModuleName(moduleName);

  return moduleLoaderState.loadingStack
    .map(normalizeModuleName)
    .includes(name);

}



// =====================================
// SAFE EVENT EMITTER
// =====================================

async function emitModuleEvent(eventName, payload = {}){

  try{

    if(typeof emitSystemEvent !== "function"){
      return false;
    }

    await emitSystemEvent(eventName, {
      source:"module-activation",
      timestamp:Date.now(),
      ...payload
    });

    return true;

  }catch{
    return false;
  }

}



// =====================================
// TIMEOUT WRAPPER
// =====================================

function createModuleTimeout(timeout){

  const t = timeout ?? MODULE_LOADER_CONFIG.MODULE_TIMEOUT;

  return new Promise((_, reject) => {

    setTimeout(() => {
      reject(new Error("MODULE TIMEOUT"));
    }, t);

  });

}



// =====================================
// MODULE CONTEXT (READ ONLY)
// =====================================

function createModuleContext(moduleDefinition){

  return freezeModuleObject({

    name: moduleDefinition.metadata.name,
    lifecycle: moduleDefinition.metadata.lifecycle,
    priority: moduleDefinition.metadata.priority,
    dependencies: moduleDefinition.metadata.dependencies

  });

}



// =====================================
// EXECUTE MODULE (ONLY FACTORY RUN)
// =====================================

async function activateModule(moduleDefinition){

  const startedAt = Date.now();

  const context = createModuleContext(moduleDefinition);

  try{

    const instance = await Promise.race([

      moduleDefinition.factory({
        module: context,
        container: DependencyContainer,
        state: StateManager,
        diagnostics: DiagnosticsRuntime,
        events: SystemEvents
      }),

/* timeout */ createModuleTimeout(
        MODULE_LOADER_CONFIG.ACTIVATION_TIMEOUT
      )

    ]);

    if(instance && typeof moduleLoaderState.instances !== "undefined"){
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

    if(typeof trackPerformanceMetric === "function"){
      trackPerformanceMetric(
        "module.activation",
        Date.now() - startedAt,
        { module: moduleDefinition.metadata.name }
      );
    }

    await emitModuleEvent(
      MODULE_EVENTS.ACTIVATED,
      { module: moduleDefinition.metadata.name }
    );

    return instance;

  }catch(error){

    moduleLoaderState.failedModules.add(
      moduleDefinition.metadata.name
    );

    if(typeof logDiagnosticError === "function"){

      await logDiagnosticError(
        "MODULE ACTIVATION FAILED",
        {
          module: moduleDefinition.metadata.name,
          error: String(error)
        }
      );

    }

    return null;

  }

}



// =====================================
// LOAD MODULE (ORCHESTRATED EXECUTION ONLY)
// =====================================

async function loadModule(moduleName){

  const name = normalizeModuleName(moduleName);

  if(!name) return false;

  if(detectModuleCircularDependency(name)) return false;

  if(moduleLoaderState.activeModules.has(name)) return true;

  const moduleDefinition = moduleLoaderState.modules.get(name);

  if(!moduleDefinition) return false;

  moduleLoaderState.loadingStack.push(name);

  try{

    moduleDefinition.state = MODULE_STATES.INITIALIZING;

    await emitModuleEvent(MODULE_EVENTS.INITIALIZED, { module: name });

    moduleDefinition.state = MODULE_STATES.LOADING;

    // dependencies are assumed pre-resolved by loader layer
    const instance = await activateModule(moduleDefinition);

    if(!instance){
      throw new Error("ACTIVATION FAILED");
    }

    moduleDefinition.state = MODULE_STATES.ACTIVE;

    moduleLoaderState.diagnostics.loaded++;
    moduleLoaderState.lastLoadedAt = Date.now();

    await emitModuleEvent(MODULE_EVENTS.LOADED, { module: name });

    return true;

  }catch(error){

    moduleDefinition.retries = (moduleDefinition.retries || 0) + 1;
    moduleDefinition.state = MODULE_STATES.FAILED;

    moduleLoaderState.failedModules.add(name);

    if(typeof logDiagnosticError === "function"){

      await logDiagnosticError(
        "MODULE LOAD FAILED",
        {
          module: name,
          retries: moduleDefinition.retries,
          error: String(error)
        }
      );

    }

    return false;

  }finally{

    moduleLoaderState.loadingStack =
      moduleLoaderState.loadingStack.filter(m => m !== name);

  }

}



// =====================================
// UNLOAD MODULE (EXECUTION CLEANUP ONLY)
// =====================================

async function unloadModule(moduleName){

  const name = normalizeModuleName(moduleName);

  if(!name) return false;

  if(!moduleLoaderState.modules.has(name)) return false;

  const instance = moduleLoaderState.instances.get(name);

  if(instance?.destroy){

    try{
      await instance.destroy();
    }catch{}

  }

  moduleLoaderState.instances.delete(name);
  moduleLoaderState.activeModules.delete(name);
  moduleLoaderState.failedModules.delete(name);

  await emitModuleEvent(
    MODULE_EVENTS.UNLOADING,
    { module: name }
  );

  await emitModuleEvent(
    MODULE_EVENTS.UNLOADED,
    { module: name }
  );

  return true;

}
