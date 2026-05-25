// =====================================
// RIGO AI
// MODULE ACTIVATION
// =====================================



// =====================================
// CIRCULAR CHECK
// =====================================

function detectModuleCircularDependency(moduleName){

  const normalized = normalizeModuleName(moduleName);

  return moduleLoaderState.loadingStack
    .map(normalizeModuleName)
    .includes(normalized);

}



// =====================================
// SAFE EVENT
// =====================================

async function emitModuleEvent(eventName, payload = {}){

  try{

    if(typeof emitSystemEvent !== "function"){
      return false;
    }

    await emitSystemEvent(eventName, {
      source:"module-loader",
      timestamp:Date.now(),
      ...payload
    });

    return true;

  }catch{
    return false;
  }

}



// =====================================
// TIMEOUT
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
// CONTEXT
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
// LOAD DEPENDENCIES (SAFE)
// =====================================

async function loadModuleDependencies(dependencies = []){

  for(const dep of dependencies){

    const name = normalizeModuleName(dep);

    const module = moduleLoaderState.modules.get(name);

    if(!module){
      throw new Error("MISSING DEPENDENCY: " + name);
    }

    const loaded = await loadModule(name);

    if(!loaded){
      return false;
    }

  }

  await emitModuleEvent(
    MODULE_EVENTS.DEPENDENCIES_RESOLVED,
    { dependencies }
  );

  return true;

}



// =====================================
// ACTIVATE MODULE
// =====================================

async function activateModule(moduleDefinition){

  try{

    const startedAt = Date.now();

    const moduleContext = createModuleContext(moduleDefinition);

    const moduleInstance = await Promise.race([

      moduleDefinition.factory({
        module: moduleContext,
        container: DependencyContainer,
        dependencies: DependencySystem,
        state: StateManager,
        diagnostics: DiagnosticsRuntime,
        events: SystemEvents
      }),

      createModuleTimeout(
        MODULE_LOADER_CONFIG.ACTIVATION_TIMEOUT
      )

    ]);

    moduleLoaderState.instances.set(
      moduleDefinition.metadata.name,
      moduleInstance
    );

    moduleLoaderState.activeModules.add(
      moduleDefinition.metadata.name
    );

    moduleLoaderState.failedModules.delete(
      moduleDefinition.metadata.name
    );

    moduleLoaderState.diagnostics.activated++;

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

    return moduleInstance;

  }catch(error){

    moduleLoaderState.failedModules.add(
      moduleDefinition.metadata.name
    );

    moduleLoaderState.diagnostics.failed++;

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
// LOAD MODULE
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

    const deps = await loadModuleDependencies(
      moduleDefinition.metadata.dependencies
    );

    if(!deps){
      throw new Error("DEPENDENCY LOAD FAILED");
    }

    const activated = await activateModule(moduleDefinition);

    if(!activated){
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

    if(
      MODULE_LOADER_CONFIG.ENABLE_RETRY_LOADING &&
      moduleDefinition.retries < MODULE_LOADER_CONFIG.MAX_RETRIES
    ){

      await new Promise(r => setTimeout(r, MODULE_LOADER_CONFIG.RETRY_DELAY));
      return loadModule(name);

    }

    await emitModuleEvent(MODULE_EVENTS.FAILED, {
      module: name,
      error: String(error)
    });

    return false;

  }finally{

    moduleLoaderState.loadingStack =
      moduleLoaderState.loadingStack.filter(m => m !== name);

  }

}



// =====================================
// UNLOAD MODULE (SAFE GRAPH)
// =====================================

async function unloadModule(moduleName){

  const name = normalizeModuleName(moduleName);

  if(!name) return false;

  if(!moduleLoaderState.modules.has(name)) return false;

  const moduleDefinition = moduleLoaderState.modules.get(name);

  moduleDefinition.state = MODULE_STATES.UNLOADING;

  await emitModuleEvent(MODULE_EVENTS.UNLOADING, { module: name });

  const instance = moduleLoaderState.instances.get(name);

  if(instance?.destroy){

    try{ await instance.destroy(); }catch{}

  }

  moduleLoaderState.instances.delete(name);
  moduleLoaderState.activeModules.delete(name);
  moduleLoaderState.failedModules.delete(name);

  moduleDefinition.state = MODULE_STATES.UNLOADED;

  await emitModuleEvent(MODULE_EVENTS.UNLOADED, { module: name });

  return true;

}
