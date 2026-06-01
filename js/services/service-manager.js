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
// REGISTER
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



// =====================================
// UNREGISTER
// =====================================

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
  container,
  serviceName,
  scope = "global"
){

  return resolveService(

    container,
    serviceName,
    scope

  );

}



async function resolveMany(
  container,
  services,
  scope = "global"
){

  return resolveServices(

    container,
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



async function boot(
  container
){

  return ServiceRuntime
  .boot(
    container
  );

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
