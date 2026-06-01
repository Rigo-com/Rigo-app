// =====================================
// RIGO AI
// SERVICE REGISTRATION
// REGISTRY LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  SERVICE_LIFECYCLES,
  SERVICE_PRIORITIES,
  SERVICE_STATES,
  isValidServiceLifecycle,
  isValidServicePriority

}
from "./service-types.js";

import {

  serviceState,

  normalizeServiceName,

  setServiceDefinition,
  getServiceDefinition,
  removeServiceDefinition,

  setServiceRuntime,
  getServiceRuntime,
  removeServiceRuntime,

  setDependencyGraph,
  setReverseDependency

}
from "./service-state.js";



// =====================================
// HELPERS
// =====================================

function normalizeDependencies(
  dependencies
){

  if(
    !Array.isArray(
      dependencies
    )
  ){

    return [];
  }

  return [

    ...new Set(

      dependencies
      .filter(Boolean)
      .map(
        normalizeServiceName
      )

    )

  ];

}



function isValidServiceFactory(
  factory
){

  return typeof factory ===
  "function";

}



// =====================================
// DEFINITION
// =====================================

function createServiceDefinition(
  serviceName,
  factory,
  options = {}
){

  return Object.freeze({

    metadata:
    Object.freeze({

      name:
      serviceName,

      dependencies:
      normalizeDependencies(
        options.dependencies
      ),

      lifecycle:

        isValidServiceLifecycle(
          options.lifecycle
        )

        ?

        options.lifecycle

        :

        SERVICE_LIFECYCLES
        .SINGLETON,

      priority:

        isValidServicePriority(
          options.priority
        )

        ?

        options.priority

        :

        SERVICE_PRIORITIES
        .NORMAL,

      lazy:
      options.lazy ?? false,

      createdAt:
      Date.now()

    }),

    factory

  });

}



// =====================================
// RUNTIME
// =====================================

function createServiceRuntimeState(
  serviceName
){

  const runtime =
  Object.seal({

    state:
    SERVICE_STATES
    .REGISTERED,

    retries:0,

    initializedAt:null,

    failedAt:null,

    recoveredAt:null

  });

  setServiceRuntime(
    serviceName,
    runtime
  );

  return runtime;

}



// =====================================
// REGISTER
// =====================================

function registerService(
  serviceName,
  factory,
  options = {}
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  if(
    !isValidServiceFactory(
      factory
    )
  ){

    return false;

  }

  if(
    getServiceDefinition(
      normalizedName
    )
  ){

    return false;

  }

  const definition =
  createServiceDefinition(

    normalizedName,
    factory,
    options

  );

  setServiceDefinition(

    normalizedName,
    definition

  );

  createServiceRuntimeState(
    normalizedName
  );

  const dependencies =
  definition
  .metadata
  .dependencies;

  setDependencyGraph(

    normalizedName,
    dependencies

  );

  for(
    const dependency
    of dependencies
  ){

    setReverseDependency(

      dependency,
      normalizedName

    );

  }

  return true;

}



// =====================================
// UNREGISTER
// =====================================

function unregisterService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  const definition =
  getServiceDefinition(
    normalizedName
  );

  if(
    !definition
  ){

    return false;

  }

  removeServiceDefinition(
    normalizedName
  );

  removeServiceRuntime(
    normalizedName
  );

  serviceState
  .instances
  .delete(
    normalizedName
  );

  serviceState
  .dependencyGraph
  .delete(
    normalizedName
  );

  return true;

}



// =====================================
// LOOKUP
// =====================================

function hasRegisteredService(
  serviceName
){

  return Boolean(

    getServiceDefinition(
      serviceName
    )

  );

}



function getRegisteredServices(){

  return [

    ...serviceState
    .definitions
    .keys()

  ];

}



// =====================================
// DIAGNOSTICS
// =====================================

function getServiceRegistrationDiagnostics(){

  return Object.freeze({

    services:

      serviceState
      .definitions
      .size,

    runtime:

      serviceState
      .runtime
      .size,

    instances:

      serviceState
      .instances
      .size,

    dependencyGraph:

      serviceState
      .dependencyGraph
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  createServiceDefinition,

  createServiceRuntimeState,

  registerService,

  unregisterService,

  hasRegisteredService,

  getRegisteredServices,

  getServiceRegistrationDiagnostics

};
