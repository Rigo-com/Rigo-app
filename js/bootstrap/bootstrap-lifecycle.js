import Diagnostics from "../debug/diagnostics/index.js";
import { BOOTSTRAP_CONFIG } from "./bootstrap-config.js";
import { bootstrapState } from "./bootstrap-state.js";
import { listBootstrapSystems } from "./bootstrap-registry.js";

function increment(key){
  if(
    BOOTSTRAP_CONFIG.ENABLE_DIAGNOSTICS &&
    Object.prototype.hasOwnProperty.call(bootstrapState.diagnostics,key)
  ){
    bootstrapState.diagnostics[key]++;
  }
}

function withTimeout(operation,systemId){
  let timer;
  return Promise.race([
    operation,
    new Promise((_,reject) => {
      timer = setTimeout(
        () => reject(new Error(`BOOT TIMEOUT: ${systemId}`)),
        BOOTSTRAP_CONFIG.BOOT_TIMEOUT
      );
    })
  ]).finally(() => clearTimeout(timer));
}

async function stopInitializedSystems(){
  const initialized = new Set(bootstrapState.initializedSystems);
  const systems = listBootstrapSystems()
  .filter(system => initialized.has(system.id))
  .reverse();

  for(const system of systems){
    try{
      if(typeof system.shutdown === "function"){
        await system.shutdown();
      }
    }
    catch(error){
      bootstrapState.lastError = error;
    }
    finally{
      bootstrapState.initializedSystems.delete(system.id);
    }
  }
}

export async function bootBootstrapSystems(){
  if(bootstrapState.initialized && bootstrapState.state === "ready"){
    return true;
  }
  if(bootstrapState.startupPromise){
    return bootstrapState.startupPromise;
  }
  if(bootstrapState.shutdownPromise){
    await bootstrapState.shutdownPromise;
  }

  bootstrapState.booting = true;
  bootstrapState.state = "booting";
  bootstrapState.startedAt = Date.now();
  increment("boots");

  const startup = Promise.resolve().then(async () => {
    Diagnostics.recordEvent("bootstrap:boot-started");
    let currentSystem = null;

    try{
      for(const system of listBootstrapSystems()){
        currentSystem = system;
        Diagnostics.recordEvent("bootstrap:system-started",{system:system.id});

        await withTimeout((async () => {
          if(typeof system.initialize === "function"){
            const initialized = await system.initialize();
            if(initialized === false){
              throw new Error(`SYSTEM INITIALIZATION FAILED: ${system.id}`);
            }
          }
          if(typeof system.boot === "function"){
            const booted = await system.boot();
            if(booted === false){
              throw new Error(`SYSTEM BOOT FAILED: ${system.id}`);
            }
          }
        })(),system.id);

        bootstrapState.initializedSystems.add(system.id);
        bootstrapState.failedSystems.delete(system.id);
        increment("initializedSystems");
        Diagnostics.recordEvent("bootstrap:system-success",{system:system.id});
      }

      bootstrapState.initialized = true;
      bootstrapState.completedAt = Date.now();
      bootstrapState.state = "ready";
      bootstrapState.lastError = null;
      bootstrapState.recoveryAttempts = 0;
      Diagnostics.recordEvent("bootstrap:boot-completed");
      return true;
    }
    catch(error){
      increment("failures");
      bootstrapState.lastError = error;
      bootstrapState.state = "failed";
      if(currentSystem){
        bootstrapState.failedSystems.add(currentSystem.id);

        if(
          !bootstrapState.initializedSystems.has(currentSystem.id) &&
          typeof currentSystem.shutdown === "function"
        ){
          try{
            await currentSystem.shutdown();
          }
          catch(shutdownError){}
        }
      }
      Diagnostics.recordEvent("bootstrap:boot-failed",{error:String(error)});
      await stopInitializedSystems();
      bootstrapState.initialized = false;
      return false;
    }
    finally{
      bootstrapState.booting = false;
      bootstrapState.startupPromise = null;
    }
  });

  bootstrapState.startupPromise = startup;
  return startup;
}

export async function shutdownBootstrapSystems(){
  if(bootstrapState.shutdownPromise){
    return bootstrapState.shutdownPromise;
  }
  if(bootstrapState.startupPromise){
    await bootstrapState.startupPromise;
  }

  bootstrapState.shuttingDown = true;
  bootstrapState.state = "shutdown";
  increment("shutdowns");

  const shutdown = (async () => {
    try{
      await stopInitializedSystems();
      bootstrapState.failedSystems.clear();
      bootstrapState.initialized = false;
      bootstrapState.completedAt = null;
      bootstrapState.state = "idle";
      return true;
    }
    finally{
      bootstrapState.shuttingDown = false;
      bootstrapState.shutdownPromise = null;
    }
  })();

  bootstrapState.shutdownPromise = shutdown;
  return shutdown;
}

export async function recoverBootstrapSystems(){
  if(!BOOTSTRAP_CONFIG.ENABLE_RECOVERY){
    return false;
  }
  if(bootstrapState.recoveryPromise){
    return bootstrapState.recoveryPromise;
  }
  if(bootstrapState.recoveryAttempts >= BOOTSTRAP_CONFIG.MAX_RECOVERY_ATTEMPTS){
    bootstrapState.state = "failed";
    return false;
  }

  bootstrapState.recovering = true;
  bootstrapState.state = "recovering";
  bootstrapState.recoveryAttempts++;
  increment("recoveries");

  const recovery = (async () => {
    try{
      await shutdownBootstrapSystems();
      return await bootBootstrapSystems();
    }
    finally{
      bootstrapState.recovering = false;
      bootstrapState.recoveryPromise = null;
    }
  })();

  bootstrapState.recoveryPromise = recovery;
  return recovery;
}

export async function resetBootstrapSystems(){
  await shutdownBootstrapSystems();
  bootstrapState.initializedSystems.clear();
  bootstrapState.failedSystems.clear();
  bootstrapState.lastError = null;
  bootstrapState.startedAt = null;
  bootstrapState.completedAt = null;
  bootstrapState.initialized = false;
  bootstrapState.booting = false;
  bootstrapState.shuttingDown = false;
  bootstrapState.recovering = false;
  bootstrapState.recoveryAttempts = 0;
  bootstrapState.state = "idle";
  for(const key of Object.keys(bootstrapState.diagnostics)){
    bootstrapState.diagnostics[key] = 0;
  }
  return true;
}
