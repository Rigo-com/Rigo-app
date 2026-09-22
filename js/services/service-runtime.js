import { RIGOContainer } from "../core/container/index.js";
import { SERVICE_STATES } from "./service-types.js";
import { serviceState } from "./service-state.js";
import { getRegisteredServices } from "./service-registration.js";

const serviceRuntimeState = Object.seal({
  initialized:false,
  booted:false,
  booting:false,
  shuttingDown:false,
  resetting:false,
  startedAt:null,
  stoppedAt:null,
  runtime:new Map()
});

async function initializeServiceRuntime(){
  if(serviceRuntimeState.initialized) return true;
  serviceRuntimeState.initialized = true;
  serviceState.initialized = true;
  return true;
}

function resolveServiceStartOrder(){
  const order = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(serviceName){
    const normalizedName = String(serviceName ?? "").trim().toLowerCase();
    if(!normalizedName || visited.has(normalizedName)) return;

    if(visiting.has(normalizedName)){
      throw new Error(`CIRCULAR_SERVICE_DEPENDENCY:${normalizedName}`);
    }

    if(!RIGOContainer.has(normalizedName)){
      throw new Error(`SERVICE_NOT_FOUND:${normalizedName}`);
    }

    visiting.add(normalizedName);

    const definition = RIGOContainer.get(normalizedName);
    for(const dependency of definition?.dependencies || []){
      visit(dependency);
    }

    visiting.delete(normalizedName);
    visited.add(normalizedName);
    order.push(normalizedName);
  }

  for(const serviceName of getRegisteredServices()){
    visit(serviceName);
  }

  return order;
}

async function startService(serviceName){
  const normalizedName = String(serviceName ?? "").trim().toLowerCase();
  if(!normalizedName) return false;

  const current = serviceRuntimeState.runtime.get(normalizedName);
  if(current?.state === SERVICE_STATES.ACTIVE) return true;

  let instance = null;

  try{
    serviceRuntimeState.runtime.set(normalizedName, {
      state:SERVICE_STATES.INITIALIZING,
      initializedAt:null,
      failedAt:null,
      instance:null
    });

    instance = await RIGOContainer.resolve(normalizedName);

    if(typeof instance?.initialize === "function"){
      const initialized = await instance.initialize();
      if(initialized === false) throw new Error("SERVICE_INITIALIZE_FAILED");
    }

    if(typeof instance?.boot === "function"){
      const booted = await instance.boot();
      if(booted === false) throw new Error("SERVICE_BOOT_FAILED");
    }

    serviceRuntimeState.runtime.set(normalizedName, {
      state:SERVICE_STATES.ACTIVE,
      initializedAt:Date.now(),
      failedAt:null,
      instance
    });

    serviceState.diagnostics.started++;
    return true;
  }catch(error){
    if(instance && typeof instance.shutdown === "function"){
      try{ await instance.shutdown(); }catch{}
    }

    serviceRuntimeState.runtime.set(normalizedName, {
      state:SERVICE_STATES.FAILED,
      initializedAt:null,
      failedAt:Date.now(),
      instance:null,
      error:String(error?.message || error)
    });

    serviceState.diagnostics.failed++;
    return false;
  }
}

async function stopService(serviceName, runtime){
  if(!runtime) return true;

  runtime.state = SERVICE_STATES.SHUTTING_DOWN;

  try{
    if(runtime.instance && typeof runtime.instance.shutdown === "function"){
      const stopped = await runtime.instance.shutdown();
      if(stopped === false) throw new Error("SERVICE_SHUTDOWN_FAILED");
    }

    runtime.state = SERVICE_STATES.STOPPED;
    runtime.stoppedAt = Date.now();
    runtime.instance = null;
    return true;
  }catch(error){
    runtime.state = SERVICE_STATES.FAILED;
    runtime.failedAt = Date.now();
    runtime.error = String(error?.message || error);
    return false;
  }
}

async function bootServiceRuntime(){
  if(serviceRuntimeState.booting || serviceRuntimeState.shuttingDown || serviceRuntimeState.resetting) return false;
  if(serviceRuntimeState.booted) return true;

  serviceRuntimeState.booting = true;
  const startedNames = [];

  try{
    await initializeServiceRuntime();

    let startOrder;
    try{
      startOrder = resolveServiceStartOrder();
    }catch(error){
      serviceState.diagnostics.failed++;
      return false;
    }

    for(const serviceName of startOrder){
      const started = await startService(serviceName);
      if(!started){
        for(const name of [...startedNames].reverse()){
          await stopService(name, serviceRuntimeState.runtime.get(name));
        }
        serviceRuntimeState.booted = false;
        serviceState.booted = false;
        return false;
      }
      startedNames.push(serviceName);
    }

    serviceRuntimeState.booted = true;
    serviceRuntimeState.startedAt = Date.now();
    serviceState.booted = true;
    serviceState.startedAt = serviceRuntimeState.startedAt;
    return true;
  }finally{
    serviceRuntimeState.booting = false;
  }
}

async function shutdownServiceRuntime(){
  if(serviceRuntimeState.booting || serviceRuntimeState.shuttingDown) return false;
  if(!serviceRuntimeState.booted && serviceRuntimeState.runtime.size === 0) return true;

  serviceRuntimeState.shuttingDown = true;
  let success = true;

  try{
    const names = [...serviceRuntimeState.runtime.keys()].reverse();
    for(const name of names){
      const stopped = await stopService(name, serviceRuntimeState.runtime.get(name));
      if(!stopped) success = false;
    }

    serviceRuntimeState.booted = false;
    serviceRuntimeState.stoppedAt = Date.now();
    serviceState.booted = false;
    serviceState.stoppedAt = serviceRuntimeState.stoppedAt;
    return success;
  }finally{
    serviceRuntimeState.shuttingDown = false;
  }
}

async function resetServiceRuntime(){
  if(serviceRuntimeState.booting || serviceRuntimeState.shuttingDown) return false;

  serviceRuntimeState.resetting = true;
  try{
    const names = [...serviceRuntimeState.runtime.keys()].reverse();
    for(const name of names){
      await stopService(name, serviceRuntimeState.runtime.get(name));
    }

    serviceRuntimeState.runtime.clear();
    serviceRuntimeState.booted = false;
    serviceRuntimeState.initialized = false;
    serviceRuntimeState.startedAt = null;
    serviceRuntimeState.stoppedAt = null;

    serviceState.initialized = false;
    serviceState.booted = false;
    serviceState.startedAt = null;
    serviceState.stoppedAt = null;
    serviceState.diagnostics.started = 0;
    serviceState.diagnostics.failed = 0;
    return true;
  }finally{
    serviceRuntimeState.resetting = false;
  }
}

function createServiceRuntimeSnapshot(){
  return Object.freeze({
    initialized:serviceRuntimeState.initialized,
    booted:serviceRuntimeState.booted,
    booting:serviceRuntimeState.booting,
    shuttingDown:serviceRuntimeState.shuttingDown,
    resetting:serviceRuntimeState.resetting,
    services:serviceRuntimeState.runtime.size,
    serviceStates:Object.freeze(
      Object.fromEntries(
        [...serviceRuntimeState.runtime.entries()].map(([name, value]) => [
          name,
          Object.freeze({
            state:value.state,
            initializedAt:value.initializedAt ?? null,
            stoppedAt:value.stoppedAt ?? null,
            failedAt:value.failedAt ?? null,
            error:value.error ?? null
          })
        ])
      )
    ),
    startedAt:serviceRuntimeState.startedAt,
    stoppedAt:serviceRuntimeState.stoppedAt,
    timestamp:Date.now()
  });
}

const ServiceRuntime = Object.freeze({
  initialize:initializeServiceRuntime,
  boot:bootServiceRuntime,
  shutdown:shutdownServiceRuntime,
  reset:resetServiceRuntime,
  startService,
  snapshot:createServiceRuntimeSnapshot
});

export {
  initializeServiceRuntime,
  bootServiceRuntime,
  shutdownServiceRuntime,
  resetServiceRuntime,
  startService,
  createServiceRuntimeSnapshot,
  ServiceRuntime
};
export default ServiceRuntime;
