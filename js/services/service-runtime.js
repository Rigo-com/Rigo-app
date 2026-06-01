// =====================================
// RIGO AI
// SERVICE RUNTIME
// RUNTIME LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  SERVICE_STATES

}
from "./service-types.js";

import {

  serviceState,

  getServiceDefinition,

  getServiceRuntime,

  getRegisteredServices

}
from "./service-registration.js";

import {

  resolveService

}
from "./service-resolution.js";



// =====================================
// INTERNAL STATE
// =====================================

const serviceRuntimeState =
Object.seal({

  initialized:false,

  booted:false,

  booting:false,

  shuttingDown:false,

  resetting:false,

  startedAt:null,

  stoppedAt:null

});



// =====================================
// HELPERS
// =====================================

function isRuntimeBusy(){

  return (

    serviceRuntimeState
    .booting ||

    serviceRuntimeState
    .shuttingDown ||

    serviceRuntimeState
    .resetting

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeServiceRuntime(){

  if(
    serviceRuntimeState
    .initialized
  ){

    return true;

  }

  serviceRuntimeState
  .initialized =
  true;

  serviceState
  .initialized =
  true;

  return true;

}



// =====================================
// START SERVICE
// =====================================

async function startService(
  container,
  serviceName
){

  const definition =
  getServiceDefinition(
    serviceName
  );

  if(
    !definition
  ){

    return false;

  }

  const runtime =
  getServiceRuntime(
    serviceName
  );

  if(
    !runtime
  ){

    return false;

  }

  try{

    runtime.state =
    SERVICE_STATES
    .INITIALIZING;

    await resolveService(

      container,

      serviceName

    );

    runtime.state =
    SERVICE_STATES
    .ACTIVE;

    runtime.initializedAt =
    Date.now();

    runtime.failedAt =
    null;

    return true;

  }

  catch(error){

    runtime.state =
    SERVICE_STATES
    .FAILED;

    runtime.failedAt =
    Date.now();

    runtime.retries++;

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootServiceRuntime(
  container
){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  if(
    serviceRuntimeState
    .booted
  ){

    return true;

  }

  serviceRuntimeState
  .booting =
  true;

  try{

    await initializeServiceRuntime();

    const services =
    getRegisteredServices();

    for(
      const serviceName
      of services
    ){

      const definition =
      getServiceDefinition(
        serviceName
      );

      if(
        !definition
      ){

        continue;

      }

      if(
        definition
        .metadata
        .lazy
      ){

        continue;

      }

      const started =
      await startService(

        container,

        serviceName

      );

      if(
        !started
      ){

        return false;

      }

    }

    serviceRuntimeState
    .booted =
    true;

    serviceRuntimeState
    .startedAt =
    Date.now();

    serviceState
    .startedAt =
    Date.now();

    return true;

  }

  finally{

    serviceRuntimeState
    .booting =
    false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownServiceRuntime(){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  if(
    !serviceRuntimeState
    .booted
  ){

    return true;

  }

  serviceRuntimeState
  .shuttingDown =
  true;

  try{

    const services =

      getRegisteredServices()
      .reverse();

    for(
      const serviceName
      of services
    ){

      const runtime =
      getServiceRuntime(
        serviceName
      );

      if(
        runtime
      ){

        runtime.state =
        SERVICE_STATES
        .STOPPED;

      }

    }

    serviceRuntimeState
    .booted =
    false;

    serviceRuntimeState
    .stoppedAt =
    Date.now();

    serviceState
    .stoppedAt =
    Date.now();

    return true;

  }

  finally{

    serviceRuntimeState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET
// =====================================

async function resetServiceRuntime(){

  if(
    isRuntimeBusy()
  ){

    return false;

  }

  serviceRuntimeState
  .resetting =
  true;

  try{

    await shutdownServiceRuntime();

    serviceRuntimeState
    .booted =
    false;

    serviceRuntimeState
    .startedAt =
    null;

    serviceRuntimeState
    .stoppedAt =
    null;

    return true;

  }

  finally{

    serviceRuntimeState
    .resetting =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createServiceRuntimeSnapshot(){

  return Object.freeze({

    initialized:
    serviceRuntimeState
    .initialized,

    booted:
    serviceRuntimeState
    .booted,

    booting:
    serviceRuntimeState
    .booting,

    shuttingDown:
    serviceRuntimeState
    .shuttingDown,

    resetting:
    serviceRuntimeState
    .resetting,

    startedAt:
    serviceRuntimeState
    .startedAt,

    stoppedAt:
    serviceRuntimeState
    .stoppedAt,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ServiceRuntime =
Object.freeze({

  initialize:
  initializeServiceRuntime,

  boot:
  bootServiceRuntime,

  shutdown:
  shutdownServiceRuntime,

  reset:
  resetServiceRuntime,

  startService,

  snapshot:
  createServiceRuntimeSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeServiceRuntime,

  bootServiceRuntime,

  shutdownServiceRuntime,

  resetServiceRuntime,

  startService,

  createServiceRuntimeSnapshot,

  ServiceRuntime

};

export default
ServiceRuntime;
