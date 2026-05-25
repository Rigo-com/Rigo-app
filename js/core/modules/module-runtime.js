// =====================================
// RIGO AI
// MODULE RUNTIME
// ENTERPRISE ORCHESTRATION ENGINE
// =====================================



// =====================================
// STATE
// =====================================

const moduleRuntimeState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  monitoring:false,

  booted:false,

  runtimeLocked:false,

  healthTimer:null,

  startedAt:null,

  completedAt:null,

  lastHealthcheckAt:null,

  lastRecoveryAt:null,

  lastError:null,

  diagnostics:{

    boots:0,

    shutdowns:0,

    recoveries:0,

    healthchecks:0,

    runtimeErrors:0

  }

});



// =====================================
// IMMUTABLE
// =====================================

function freezeModuleRuntime(value, visited = new WeakSet()){

  if(!value || typeof value !== "object") return value;

  if(visited.has(value)) return value;

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach(v => {

    if(v && typeof v === "object"){
      freezeModuleRuntime(v, visited);
    }

  });

  return value;

}



// =====================================
// EVENTS
// =====================================

const MODULE_RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:"module.runtime.initialized",
  BOOT_STARTED:"module.runtime.boot.started",
  BOOT_COMPLETED:"module.runtime.boot.completed",
  SHUTDOWN_STARTED:"module.runtime.shutdown.started",
  SHUTDOWN_COMPLETED:"module.runtime.shutdown.completed",
  RECOVERY_STARTED:"module.runtime.recovery.started",
  RECOVERY_COMPLETED:"module.runtime.recovery.completed",
  HEALTHCHECK:"module.runtime.healthcheck"

});



// =====================================
// EMIT
// =====================================

async function emitModuleRuntimeEvent(eventName, payload = {}){

  try{

    if(typeof emitSystemEvent !== "function") return false;

    await emitSystemEvent(eventName, {
      source:"module-runtime",
      timestamp:Date.now(),
      ...payload
    });

    return true;

  }catch{
    return false;
  }

}



// =====================================
// BOOT MODULES (SAFE)
// =====================================

function getBootableModules(){

  return [...moduleLoaderState.modules.values()]
    .sort((a,b) => a.metadata.priority - b.metadata.priority);

}



async function bootModules(){

  const modules = getBootableModules();

  for(const mod of modules){

    if(mod.metadata.lazy) continue;

    try{

      await loadModule(mod.metadata.name);

    }catch(error){

      // لا توقف النظام بالكامل
      moduleRuntimeState.diagnostics.runtimeErrors++;
      moduleRuntimeState.lastError = error;

      if(typeof logDiagnosticError === "function"){
        await logDiagnosticError(
          "MODULE BOOT ERROR",
          { module: mod.metadata.name, error: String(error) }
        );
      }

    }

  }

  return true;

}



// =====================================
// HEALTHCHECK
// =====================================

async function executeModuleRuntimeHealthcheck(){

  moduleRuntimeState.diagnostics.healthchecks++;
  moduleRuntimeState.lastHealthcheckAt = Date.now();

  const health = await getModuleHealth();

  await emitModuleRuntimeEvent(
    MODULE_RUNTIME_EVENTS.HEALTHCHECK,
    { health }
  );

  if(
    MODULE_LOADER_CONFIG.ENABLE_RECOVERY &&
    !moduleRuntimeState.recovering &&
    moduleRuntimeState.diagnostics.runtimeErrors > 0
  ){
    await recoverModuleRuntime();
  }

  return health;

}



// =====================================
// MONITORING
// =====================================

function startModuleRuntimeMonitoring(){

  if(moduleRuntimeState.healthTimer){
    clearInterval(moduleRuntimeState.healthTimer);
  }

  moduleRuntimeState.monitoring = true;

  moduleRuntimeState.healthTimer =
    setInterval(
      executeModuleRuntimeHealthcheck,
      APP_CORE_CONFIG?.HEALTHCHECK_INTERVAL || 30000
    );

  return true;

}



function stopModuleRuntimeMonitoring(){

  if(moduleRuntimeState.healthTimer){
    clearInterval(moduleRuntimeState.healthTimer);
    moduleRuntimeState.healthTimer = null;
  }

  moduleRuntimeState.monitoring = false;

  return true;

}



// =====================================
// INIT
// =====================================

async function initializeModuleRuntime(){

  if(moduleRuntimeState.initialized) return true;

  const ok = await initializeModuleLoader();

  if(!ok) return false;

  moduleRuntimeState.initialized = true;

  await emitModuleRuntimeEvent(MODULE_RUNTIME_EVENTS.INITIALIZED);

  return true;

}



// =====================================
// BOOT
// =====================================

async function bootModuleRuntime(){

  if(moduleRuntimeState.booting || moduleRuntimeState.runtimeLocked){
    return false;
  }

  moduleRuntimeState.booting = true;
  moduleRuntimeState.runtimeLocked = true;
  moduleRuntimeState.startedAt = Date.now();
  moduleRuntimeState.lastError = null;
  moduleRuntimeState.diagnostics.boots++;

  try{

    await emitModuleRuntimeEvent(MODULE_RUNTIME_EVENTS.BOOT_STARTED);

    const init = await initializeModuleRuntime();

    if(!init) throw new Error("INIT FAILED");

    await bootModules();

    startModuleRuntimeMonitoring();

    moduleRuntimeState.booted = true;
    moduleRuntimeState.completedAt = Date.now();

    await emitModuleRuntimeEvent(
      MODULE_RUNTIME_EVENTS.BOOT_COMPLETED,
      { duration: moduleRuntimeState.completedAt - moduleRuntimeState.startedAt }
    );

    return true;

  }catch(error){

    moduleRuntimeState.lastError = error;
    moduleRuntimeState.diagnostics.runtimeErrors++;

    if(typeof logCriticalError === "function"){
      await logCriticalError(
        "MODULE RUNTIME BOOT FAILED",
        { error: String(error) }
      );
    }

    return false;

  }finally{

    moduleRuntimeState.booting = false;
    moduleRuntimeState.runtimeLocked = false;

  }

}



// =====================================
// RECOVERY (SAFE GUARD)
// =====================================

async function recoverModuleRuntime(){

  if(moduleRuntimeState.recovering) return false;

  moduleRuntimeState.recovering = true;
  moduleRuntimeState.diagnostics.recoveries++;
  moduleRuntimeState.lastRecoveryAt = Date.now();

  try{

    await emitModuleRuntimeEvent(MODULE_RUNTIME_EVENTS.RECOVERY_STARTED);

    const failed = [...moduleLoaderState.failedModules];

    for(const m of failed){

      if(!moduleLoaderState.failedModules.has(m)) continue;

      await recoverModule(m);

    }

    await emitModuleRuntimeEvent(MODULE_RUNTIME_EVENTS.RECOVERY_COMPLETED);

    return true;

  }catch(error){

    moduleRuntimeState.lastError = error;
    return false;

  }finally{

    moduleRuntimeState.recovering = false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownModuleRuntime(){

  if(moduleRuntimeState.shuttingDown) return false;

  moduleRuntimeState.shuttingDown = true;
  moduleRuntimeState.diagnostics.shutdowns++;

  try{

    await emitModuleRuntimeEvent(MODULE_RUNTIME_EVENTS.SHUTDOWN_STARTED);

    stopModuleRuntimeMonitoring();

    await resetModuleLoader();

    moduleRuntimeState.booted = false;

    await emitModuleRuntimeEvent(MODULE_RUNTIME_EVENTS.SHUTDOWN_COMPLETED);

    return true;

  }catch(error){

    moduleRuntimeState.lastError = error;
    return false;

  }finally{

    moduleRuntimeState.shuttingDown = false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createModuleRuntimeSnapshot(){

  return freezeModuleRuntime({

    initialized:moduleRuntimeState.initialized,
    booted:moduleRuntimeState.booted,
    booting:moduleRuntimeState.booting,
    shuttingDown:moduleRuntimeState.shuttingDown,
    recovering:moduleRuntimeState.recovering,
    monitoring:moduleRuntimeState.monitoring,
    startedAt:moduleRuntimeState.startedAt,
    completedAt:moduleRuntimeState.completedAt,
    lastHealthcheckAt:moduleRuntimeState.lastHealthcheckAt,
    lastRecoveryAt:moduleRuntimeState.lastRecoveryAt,
    diagnostics:{...moduleRuntimeState.diagnostics},
    lastError:moduleRuntimeState.lastError ? String(moduleRuntimeState.lastError) : null

  });

}



// =====================================
// PUBLIC API
// =====================================

const ModuleRuntime =
Object.freeze({

  initialize:initializeModuleRuntime,
  boot:bootModuleRuntime,
  shutdown:shutdownModuleRuntime,
  recover:recoverModuleRuntime,
  health:executeModuleRuntimeHealthcheck,
  snapshot:createModuleRuntimeSnapshot

});



// =====================================
// EXPORTS
// =====================================

if(typeof window !== "undefined"){

  window.ModuleRuntime = ModuleRuntime;

  window.initializeModuleRuntime = initializeModuleRuntime;
  window.bootModuleRuntime = bootModuleRuntime;
  window.shutdownModuleRuntime = shutdownModuleRuntime;
  window.recoverModuleRuntime = recoverModuleRuntime;

}
