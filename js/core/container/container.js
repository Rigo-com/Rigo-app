// =====================================
// RIGO AI
// CORE CONTAINER
// =====================================

import {
  CONTAINER_LIFECYCLE
}
from "./container-types.js";

import {
  normalizeContainerScope,
  isValidContainerScope,
  getDefaultContainerScope
}
from "./container-scopes.js";

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

  if(!serviceName){
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
  CONTAINER_LIFECYCLE.SINGLETON;

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
  ? definition.dependencies
  : [];

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

  const removed =
  removeService(
    containerState,
    serviceName
  );

  if(!removed){
    return false;
  }

  const normalizedName =
  String(
    serviceName || ""
  )
  .trim()
  .toLowerCase();

  containerState
  .singletons
  .delete(
    normalizedName
  );

  containerState
  .scopes
  .forEach((scopeStore) => {
    scopeStore.delete(
      normalizedName
    );
  });

  return true;
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
  scope = getDefaultContainerScope()
){

  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  if(
    !isValidContainerScope(
      normalizedScope
    )
  ){
    throw new Error(
      "INVALID_SCOPE_NAME"
    );
  }

  return resolveService(
    RIGOContainer,
    serviceName,
    normalizedScope
  );
}


async function resolveMany(
  serviceNames,
  scope = getDefaultContainerScope()
){

  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  if(
    !isValidContainerScope(
      normalizedScope
    )
  ){
    throw new Error(
      "INVALID_SCOPE_NAME"
    );
  }

  return resolveServices(
    RIGOContainer,
    serviceNames,
    normalizedScope
  );
}


function createScope(
  scopeName
){

  const normalizedScope =
  normalizeContainerScope(
    scopeName
  );

  if(
    !isValidContainerScope(
      normalizedScope
    )
  ){
    throw new Error(
      "INVALID_SCOPE_NAME"
    );
  }

  if(
    !containerState
    .scopes
    .has(
      normalizedScope
    )
  ){
    containerState
    .scopes
    .set(
      normalizedScope,
      new Map()
    );
  }

  return normalizedScope;
}


function removeScope(
  scopeName
){

  const normalizedScope =
  normalizeContainerScope(
    scopeName
  );

  return containerState
  .scopes
  .delete(
    normalizedScope
  );
}


function clearScopes(){
  containerState
  .scopes
  .clear();

  return true;
}


function clear(){
  containerState.services.clear();
  containerState.singletons.clear();
  containerState.scopes.clear();
  containerState.resolutionStack.clear();

  return true;
}


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
  CONTAINER_LIFECYCLE,

  scopes:
  Object.freeze({
    normalize:
    normalizeContainerScope,

    validate:
    isValidContainerScope,

    getDefault:
    getDefaultContainerScope
  })

});


export {
  RIGOContainer,
  containerState
};

export default
RIGOContainer;
