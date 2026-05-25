// =====================================
// RIGO AI
// MODULE KERNEL
// SINGLE ORCHESTRATION LAYER
// =====================================

const ModuleKernelState = Object.seal({

  initialized:false,
  booted:false,
  shuttingDown:false,
  recovering:false,

  startedAt:null,
  completedAt:null,

  lastError:null,

  diagnostics:{

    boots:0,
    shutdowns:0,
    recoveries:0,
    errors:0

  }

});



// =====================================
// INTERNAL REFERENCES
// (يربط كل الطبقات بدون exposure)
// =====================================

const _Registry = {
  register: registerModule,
  get: getRegisteredModule,
  has: hasRegisteredModule
};

const _Loader = {
  load: loadModule,
  unload: unloadModule
};

const _Runtime = {
  boot: bootModuleRuntime,
  shutdown: shutdownModuleRuntime,
  recover: recoverModuleRuntime,
  health: executeModuleRuntimeHealthcheck
};



// =====================================
// KERNEL CORE
// =====================================

async function kernelInitialize(){

  if(ModuleKernelState.initialized) return true;

  const ok = await initializeModuleLoader();

  if(!ok) return false;

  ModuleKernelState.initialized = true;

  return true;
}



// =====================================
// BOOT
// =====================================

async function kernelBoot(){

  if(ModuleKernelState.booted || ModuleKernelState.booted === true) return false;

  ModuleKernelState.boots++;
  ModuleKernelState.startedAt = Date.now();
  ModuleKernelState.lastError = null;

  try{

    await kernelInitialize();

    await _Runtime.boot();

    ModuleKernelState.booted = true;
    ModuleKernelState.completedAt = Date.now();

    return true;

  }catch(error){

    ModuleKernelState.lastError = error;
    ModuleKernelState.diagnostics.errors++;

    return false;

  }
}



// =====================================
// REGISTER
// =====================================

function kernelRegister(name, factory, options){

  return _Registry.register(name, factory, options);

}



// =====================================
// HEALTH
// =====================================

async function kernelHealth(){

  return _Runtime.health();

}



// =====================================
// SHUTDOWN
// =====================================

async function kernelShutdown(){

  if(ModuleKernelState.shuttingDown) return false;

  ModuleKernelState.shuttingDown = true;

  try{

    await _Runtime.shutdown();

    ModuleKernelState.booted = false;

    return true;

  }catch(error){

    ModuleKernelState.lastError = error;
    ModuleKernelState.diagnostics.errors++;

    return false;

  }finally{

    ModuleKernelState.shuttingDown = false;
  }

}



// =====================================
// RECOVER
// =====================================

async function kernelRecover(){

  if(ModuleKernelState.recovering) return false;

  ModuleKernelState.recovering = true;

  try{

    await _Runtime.recover();

    return true;

  }catch(error){

    ModuleKernelState.lastError = error;

    return false;

  }finally{

    ModuleKernelState.recovering = false;
  }

}



// =====================================
// PUBLIC API
// =====================================

const ModuleKernel = Object.freeze({

  initialize: kernelInitialize,
  boot: kernelBoot,
  shutdown: kernelShutdown,
  recover: kernelRecover,
  health: kernelHealth,
  register: kernelRegister,

  state: ModuleKernelState

});



// =====================================
// GLOBAL EXPORT (ONLY ONE ENTRY)
// =====================================

if(typeof window !== "undefined"){

  window.ModuleKernel = ModuleKernel;

}
