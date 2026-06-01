// =====================================
// RIGO AI
// SERVICE REGISTRATION
// CONTAINER ADAPTER LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  RIGOContainer
}
from "../core/container/index.js";

import {
  SERVICE_LIFECYCLES
}
from "./service-types.js";

import {
  serviceState
}
from "./service-state.js";



// =====================================
// REGISTER
// =====================================

async function registerService(
  serviceName,
  factory,
  options = {}
){

  await RIGOContainer
  .register({

    name:
    serviceName,

    factory,

    dependencies:

      options
      .dependencies ||

      [],

    lifecycle:

      options
      .lifecycle ||

      SERVICE_LIFECYCLES
      .SINGLETON

  });

  serviceState
  .diagnostics
  .registered++;

  return true;

}



// =====================================
// UNREGISTER
// =====================================

function unregisterService(
  serviceName
){

  return RIGOContainer
  .remove(
    serviceName
  );

}



// =====================================
// LOOKUP
// =====================================

function hasRegisteredService(
  serviceName
){

  return RIGOContainer
  .has(
    serviceName
  );

}



function getRegisteredServices(){

  return RIGOContainer
  .services();

}



// =====================================
// DIAGNOSTICS
// =====================================

function getServiceRegistrationDiagnostics(){

  return Object.freeze({

    registered:

      RIGOContainer
      .services()
      .length,

    timestamp:
    Date.now()

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  registerService,

  unregisterService,

  hasRegisteredService,

  getRegisteredServices,

  getServiceRegistrationDiagnostics

};
