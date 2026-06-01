// =====================================
// RIGO AI
// SERVICE STATE
// PURE STATE LAYER
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const serviceState =
Object.seal({

  definitions:
  new Map(),

  runtime:
  new Map(),

  instances:
  new Map(),

  dependencyGraph:
  new Map(),

  reverseDependencies:
  new Map(),

  synchronized:
  false,

  initialized:
  false,

  startedAt:
  null,

  stoppedAt:
  null

});



// =====================================
// HELPERS
// =====================================

function normalizeServiceName(
  serviceName
){

  return String(
    serviceName || ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// DEFINITIONS
// =====================================

function setServiceDefinition(
  serviceName,
  definition
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

  serviceState
  .definitions
  .set(

    normalizedName,

    definition

  );

  return true;

}



function getServiceDefinition(
  serviceName
){

  return (

    serviceState
    .definitions
    .get(

      normalizeServiceName(
        serviceName
      )

    )

    ||

    null

  );

}



function removeServiceDefinition(
  serviceName
){

  return serviceState
  .definitions
  .delete(

    normalizeServiceName(
      serviceName
    )

  );

}



// =====================================
// RUNTIME
// =====================================

function setServiceRuntime(
  serviceName,
  runtimeState
){

  serviceState
  .runtime
  .set(

    normalizeServiceName(
      serviceName
    ),

    runtimeState

  );

  return true;

}



function getServiceRuntime(
  serviceName
){

  return (

    serviceState
    .runtime
    .get(

      normalizeServiceName(
        serviceName
      )

    )

    ||

    null

  );

}



function removeServiceRuntime(
  serviceName
){

  return serviceState
  .runtime
  .delete(

    normalizeServiceName(
      serviceName
    )

  );

}



// =====================================
// INSTANCES
// =====================================

function setServiceInstance(
  serviceName,
  instance
){

  serviceState
  .instances
  .set(

    normalizeServiceName(
      serviceName
    ),

    instance

  );

  return true;

}



function getServiceInstance(
  serviceName
){

  return (

    serviceState
    .instances
    .get(

      normalizeServiceName(
        serviceName
      )

    )

    ||

    null

  );

}



function removeServiceInstance(
  serviceName
){

  return serviceState
  .instances
  .delete(

    normalizeServiceName(
      serviceName
    )

  );

}



// =====================================
// DEPENDENCIES
// =====================================

function setDependencyGraph(
  serviceName,
  dependencies = []
){

  serviceState
  .dependencyGraph
  .set(

    normalizeServiceName(
      serviceName
    ),

    [...dependencies]

  );

  return true;

}



function getDependencyGraph(
  serviceName
){

  return (

    serviceState
    .dependencyGraph
    .get(

      normalizeServiceName(
        serviceName
      )

    )

    ||

    []

  );

}



function setReverseDependency(
  dependency,
  serviceName
){

  const normalizedDependency =
  normalizeServiceName(
    dependency
  );

  if(

    !serviceState
    .reverseDependencies
    .has(
      normalizedDependency
    )

  ){

    serviceState
    .reverseDependencies
    .set(

      normalizedDependency,

      new Set()

    );

  }

  serviceState
  .reverseDependencies
  .get(
    normalizedDependency
  )
  .add(

    normalizeServiceName(
      serviceName
    )

  );

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createServiceStateSnapshot(){

  return Object.freeze({

    definitions:

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

    reverseDependencies:

      serviceState
      .reverseDependencies
      .size,

    initialized:
    serviceState
    .initialized,

    synchronized:
    serviceState
    .synchronized,

    startedAt:
    serviceState
    .startedAt,

    stoppedAt:
    serviceState
    .stoppedAt,

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

function resetServiceState(){

  serviceState
  .definitions
  .clear();

  serviceState
  .runtime
  .clear();

  serviceState
  .instances
  .clear();

  serviceState
  .dependencyGraph
  .clear();

  serviceState
  .reverseDependencies
  .clear();

  serviceState
  .initialized =
  false;

  serviceState
  .synchronized =
  false;

  serviceState
  .startedAt =
  null;

  serviceState
  .stoppedAt =
  null;

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  serviceState,

  normalizeServiceName,

  setServiceDefinition,
  getServiceDefinition,
  removeServiceDefinition,

  setServiceRuntime,
  getServiceRuntime,
  removeServiceRuntime,

  setServiceInstance,
  getServiceInstance,
  removeServiceInstance,

  setDependencyGraph,
  getDependencyGraph,
  setReverseDependency,

  createServiceStateSnapshot,

  resetServiceState

};

export default
serviceState;
