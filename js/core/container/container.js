// =====================================
// RIGO AI
// CORE CONTAINER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  CONTAINER_LIFECYCLE
}
from "./container-types.js";

import {

  registerService,
  removeService,
  hasService,
  getService,
  getServices

}
from "./container-registry.js";

import {

  resolveService,
  resolveServices

}
from "./container-resolution.js";



// =====================================
// CONTAINER STATE
// =====================================

const containerState =
Object.seal({

  services:
  new Map(),

  singletons:
  new Map(),

  scopes:
  new Map()

});



// =====================================
// CONTAINER API
// =====================================

async function register(
  definition
){

  if(
    !definition
  ){

    throw new Error(
      "INVALID_SERVICE_DEFINITION"
    );

  }

  const serviceDefinition =
  Object.freeze({

    name:
    definition.name,

    factory:
    definition.factory,

    dependencies:

    Array.isArray(
      definition.dependencies
    )

    ?

    definition.dependencies

    :

    [],

    lifecycle:

    definition.lifecycle ||

    CONTAINER_LIFECYCLE
    .SINGLETON

  });

  return registerService(

    containerState,

    definition.name,

    serviceDefinition

  );

}



function remove(
  serviceName
){

  return removeService(

    containerState,

    serviceName

  );

}



function has(
  serviceName
){

  return hasService(

    containerState,

    serviceName

  );

}



function get(
  serviceName
){

  return getService(

    containerState,

    serviceName

  );

}



function services(){

  return getServices(
    containerState
  );

}



async function resolve(
  serviceName,
  scope = "global"
){

  return resolveService(

    RIGOContainer,

    serviceName,

    scope

  );

}



async function resolveMany(
  serviceNames,
  scope = "global"
){

  return resolveServices(

    RIGOContainer,

    serviceNames,

    scope

  );

}



function clear(){

  containerState
  .services
  .clear();

  containerState
  .singletons
  .clear();

  containerState
  .scopes
  .clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RIGOContainer =
Object.freeze({

  state:
  containerState,



  register,



  remove,



  has,



  get,



  services,



  resolve,



  resolveMany,



  clear,



  lifecycles:
  CONTAINER_LIFECYCLE

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGOContainer,

  containerState

};

export default
RIGOContainer;
