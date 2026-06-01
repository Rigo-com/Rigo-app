// =====================================
// RIGO AI
// SERVICE MANAGER
// PUBLIC SERVICE API
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  registerService,
  unregisterService,
  hasRegisteredService,
  getRegisteredServices,
  getServiceRegistrationDiagnostics

}
from "./service-registration.js";

import {

  resolveService,
  resolveServices

}
from "./service-resolution.js";

import ServiceRuntime
from "./service-runtime.js";



// =====================================
// REGISTRATION
// =====================================

function register(
  serviceName,
  factory,
  options = {}
){

  return registerService(

    serviceName,
    factory,
    options

  );

}



function unregister(
  serviceName
){

  return unregisterService(
    serviceName
  );

}



// =====================================
// LOOKUP
// =====================================

function has(
  serviceName
){

  return hasRegisteredService(
    serviceName
  );

}



function list(){

  return getRegisteredServices();

}



// =====================================
// RESOLUTION
// =====================================

async function resolve(
  serviceName,
  scope = "global"
){

  return resolveService(

    null,
    serviceName,
    scope

  );

}



async function resolveMany(
  services,
  scope = "global"
){

  return resolveServices(

    null,
    services,
    scope

  );

}



// =====================================
// LIFECYCLE
// =====================================

async function initialize(){

  return ServiceRuntime
  .initialize();

}



async function boot(){

  return ServiceRuntime
  .boot();

}



async function shutdown(){

  return ServiceRuntime
  .shutdown();

}



async function reset(){

  return ServiceRuntime
  .reset();

}



// =====================================
// DIAGNOSTICS
// =====================================

function diagnostics(){

  return Object.freeze({

    registration:

      getServiceRegistrationDiagnostics(),

    runtime:

      ServiceRuntime
      .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ServiceManager =
Object.freeze({

  register,

  unregister,

  has,

  list,

  resolve,

  resolveMany,

  initialize,

  boot,

  shutdown,

  reset,

  diagnostics,

  snapshot:
  diagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  register,
  unregister,

  has,
  list,

  resolve,
  resolveMany,

  initialize,
  boot,
  shutdown,
  reset,

  diagnostics,

  ServiceManager

};

export default
ServiceManager;
