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
  new Map(),

  resolutionStack:
  new Set()

});



// =====================================
// CONTAINER API
// =====================================

async function register(
  definition
){

  if(

    !definition ||

    typeof definition !==
    "object"

  ){

    throw new Error(
      "INVALID_SERVICE_DEFINITION"
    );

  }

  const serviceName =
  String(
    definition.name || ""
  )
  .trim();

  if(
    !serviceName
  ){

    throw new Error(
      "INVALID_SERVICE_NAME"
    );

  }

  if(

    typeof definition.factory !==
    "function"

  ){

    throw new Error(
      "INVALID_SERVICE_FACTORY"
    );

  }

  const lifecycle =

    definition.lifecycle ||

    CONTAINER_LIFECYCLE
    .SINGLETON;

  if(

    !Object.values(
      CONTAINER_LIFECYCLE
    )
    .includes(
      lifecycle
    )

  ){

    throw new Error(
      "INVALID_SERVICE_LIFECYCLE"
    );

  }

  const dependencies =

    Array.isArray(
      definition.dependencies
    )

    ?

    definition.dependencies

    :

    [];

  const serviceDefinition =
  Object.freeze({

    name:
    serviceName,

    factory:
    definition.factory,

    dependencies,

    lifecycle

  });

  return registerService(

    containerState,

    serviceName,

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



function createScope(
  scopeName
){

  if(
    !scopeName
  ){

    throw new Error(
      "INVALID_SCOPE_NAME"
    );

  }

  if(

    !containerState
    .scopes
    .has(
      scopeName
    )

  ){

    containerState
    .scopes
    .set(

      scopeName,

      new Map()

    );

  }

  return true;

}



function removeScope(
  scopeName
){

  return containerState
  .scopes
  .delete(
    scopeName
  );

}



function clearScopes(){

  containerState
  .scopes
  .clear();

  return true;

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

  containerState
  .resolutionStack
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



  createScope,



  removeScope,



  clearScopes,



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
