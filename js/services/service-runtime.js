// =====================================
// RIGO AI
// SERVICE RUNTIME
// LIFECYCLE RUNTIME
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  RIGOContainer
}
from "../core/container/index.js";

import {
  SERVICE_STATES
}
from "./service-types.js";

import {
  serviceState
}
from "./service-state.js";

import {
  getRegisteredServices
}
from "./service-registration.js";



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

  stoppedAt:null,

  runtime:
  new Map()

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
  serviceName
){

  try{

    serviceRuntimeState
    .runtime
    .set(

      serviceName,

      {

        state:
        SERVICE_STATES
        .INITIALIZING,

        initializedAt:
        null,

        failedAt:
        null

      }

    );

    await RIGOContainer
    .resolve(
      serviceName
    );

    serviceRuntimeState
    .runtime
    .set(

      serviceName,

      {

        state:
        SERVICE_STATES
        .ACTIVE,

        initializedAt:
        Date.now(),

        failedAt:
        null

      }

    );

    serviceState
    .diagnostics
    .started++;

    return true;

  }

  catch(error){

    serviceRuntimeState
    .runtime
    .set(

      serviceName,

      {

        state:
        SERVICE_STATES
        .FAILED,

        initializedAt:
        null,

        failedAt:
        Date.now()

      }

    );

    serviceState
    .diagnostics
    .failed++;

    return false;

  }

}



// =====================================
// BOOT
// =====================================

async function bootServiceRuntime(){

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

      const started =
      await startService(
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
    .booted =
    true;

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

    serviceRuntimeState
    .runtime
    .forEach((runtime) => {

      runtime.state =
      SERVICE_STATES
      .STOPPED;

    });

    serviceRuntimeState
    .booted =
    false;

    serviceRuntimeState
    .stoppedAt =
    Date.now();

    serviceState
    .booted =
    false;

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
    .runtime
    .clear();

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

    services:

      serviceRuntimeState
      .runtime
      .size,

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
