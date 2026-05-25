// =====================================
// RIGO AI
// MODULE KERNEL
// FINAL PRODUCTION CORE
// =====================================



// =====================================
// STATE (READ ONLY OUTSIDE)
// =====================================

const moduleRuntimeState = Object.seal({

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
// INTERNAL SAFETY
// =====================================

function assertKernelReady(){

  if(typeof window === "undefined"){
    throw new Error("KERNEL RUNS ONLY IN BROWSER ENV");
  }

}



// =====================================
// FREEZE UTILITY
// =====================================

function freeze(obj, seen = new WeakSet()){

  if(!obj || typeof obj !== "object") return obj;

  if(seen.has(obj)) return obj;

  seen.add(obj);

  Object.freeze(obj);

  Object.values(obj).forEach(v => {

    if(v && typeof v === "object"){
      freeze(v, seen);
    }

  });

  return obj;

}



// =====================================
// EVENTS
// =====================================

const EVENTS = Object.freeze({

  INIT:"module.runtime.initialized",
  BOOT_START:"module.runtime.boot.started",
  BOOT_END:"module.runtime.boot.completed",
  SHUTDOWN_START:"module.runtime.shutdown.started",
  SHUTDOWN_END:"module.runtime.shutdown.completed",
  RECOVERY_START:"module.runtime.recovery.started",
  RECOVERY_END:"module.runtime.recovery.completed",
  HEALTH:"module.runtime.healthcheck"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emit(event, payload = {}){

  try{

    if(typeof emitSystemEvent !== "function") return;

    await emitSystemEvent(event, {
      source:"module-kernel",
      timestamp:Date.now(),
      ...payload
    });

  }catch{}

}



// =====================================
// CORE OPERATIONS WRAPPERS
// =====================================

async function bootModules(){

  const mods = [...moduleLoaderState.modules.values()]
    .sort((a,b)=>a.metadata.priority-b.metadata.priority);

  for(const m of mods){

    if(m.metadata.lazy) continue;

    try{
      await loadModule(m.metadata.name);
    }catch{

      moduleRuntimeState.diagnostics.runtimeErrors++;

    }

  }

  return true;

}



// =====================================
// HEALTH
// =====================================

async function health(){

  moduleRuntimeState.diagnostics.healthchecks++;

  moduleRuntimeState.lastHealthcheckAt = Date.now();

  const result = await getModuleHealth();

  await emit(EVENTS.HEALTH, { result });

  return result;

}



// =====================================
// BOOT
// =====================================

async function boot(){

  if(moduleRuntimeState.booting || moduleRuntimeState.runtimeLocked){
    return false;
  }

  moduleRuntimeState.booting = true;
  moduleRuntimeState.runtimeLocked = true;

  moduleRuntimeState.startedAt = Date.now();
  moduleRuntimeState.lastError = null;

  moduleRuntimeState.diagnostics.boots++;

  try{

    await emit(EVENTS.BOOT_START);

    await initializeModuleLoader();

    await bootModules();

    moduleRuntimeState.booted = true;
    moduleRuntimeState.completedAt = Date.now();

    await emit(EVENTS.BOOT_END, {
      duration: moduleRuntimeState.completedAt - moduleRuntimeState.startedAt
    });

    return true;

  }catch(e){

    moduleRuntimeState.lastError = e;
    moduleRuntimeState.diagnostics.runtimeErrors++;

    return false;

  }finally{

    moduleRuntimeState.booting = false;
    moduleRuntimeState.runtimeLocked = false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recover(){

  if(moduleRuntimeState.recovering) return false;

  moduleRuntimeState.recovering = true;

  moduleRuntimeState.diagnostics.recoveries++;

  moduleRuntimeState.lastRecoveryAt = Date.now();

  try{

    await emit(EVENTS.RECOVERY_START);

    for(const m of [...moduleLoaderState.failedModules]){

      if(moduleLoaderState.failedModules.has(m)){
        await recoverModule(m);
      }

    }

    await emit(EVENTS.RECOVERY_END);

    return true;

  }catch(e){

    moduleRuntimeState.lastError = e;

    return false;

  }finally{

    moduleRuntimeState.recovering = false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  if(moduleRuntimeState.shuttingDown) return false;

  moduleRuntimeState.shuttingDown = true;

  moduleRuntimeState.diagnostics.shutdowns++;

  try{

    await emit(EVENTS.SHUTDOWN_START);

    if(typeof stopModuleRuntimeMonitoring === "function"){
      stopModuleRuntimeMonitoring();
    }

    if(typeof resetModuleLoader === "function"){
      await resetModuleLoader();
    }

    moduleRuntimeState.booted = false;

    await emit(EVENTS.SHUTDOWN_END);

    return true;

  }catch(e){

    moduleRuntimeState.lastError = e;

    return false;

  }finally{

    moduleRuntimeState.shuttingDown = false;

  }

}



// =====================================
// KERNEL API (ONLY PUBLIC SURFACE)
// =====================================

const ModuleKernel = Object.freeze({

  boot,
  shutdown,
  recover,
  health,
  state: moduleRuntimeState

});



// =====================================
// EXPORT (ONLY ONE ENTRY)
// =====================================

if(typeof window !== "undefined"){

  window.ModuleKernel = ModuleKernel;

}
