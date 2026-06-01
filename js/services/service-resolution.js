// =====================================
// RIGO AI
// SERVICE RESOLUTION
// RESOLUTION LAYER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  SERVICE_LIFECYCLES

}
from "./service-types.js";

import {

  normalizeServiceName,

  getServiceDefinition,

  getServiceInstance,

  setServiceInstance

}
from "./service-state.js";



// =====================================
// CREATE INSTANCE
// =====================================

async function createServiceInstance(
  container,
  definition,
  scope = "global"
){

  if(
    !definition
  ){

    throw new Error(
      "INVALID_SERVICE_DEFINITION"
    );

  }

  const dependencies =
  {};

  const dependencyList =

    definition
    .metadata
    .dependencies

    ||

    [];

  for(
    const dependency
    of dependencyList
  ){

    dependencies[
      dependency
    ] = await resolveService(

      container,
      dependency,
      scope

    );

  }

  return definition
  .factory({

    container,

    services:
    dependencies,

    scope

  });

}



// =====================================
// RESOLVE MANY
// =====================================

async function resolveServices(
  container,
  serviceNames = [],
  scope = "global"
){

  const resolved =
  {};

  for(
    const serviceName
    of serviceNames
  ){

    resolved[
      serviceName
    ] = await resolveService(

      container,
      serviceName,
      scope

    );

  }

  return resolved;

}



// =====================================
// RESOLVE
// =====================================

async function resolveService(
  container,
  serviceName,
  scope = "global"
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    throw new Error(
      "INVALID_SERVICE_NAME"
    );

  }

  const definition =
  getServiceDefinition(
    normalizedName
  );

  if(
    !definition
  ){

    throw new Error(

      `SERVICE_NOT_FOUND:${normalizedName}`

    );

  }

  const lifecycle =

    definition
    .metadata
    .lifecycle;



  // ==========================
  // SINGLETON
  // ==========================

  if(

    lifecycle ===

    SERVICE_LIFECYCLES
    .SINGLETON

  ){

    const existing =
    getServiceInstance(
      normalizedName
    );

    if(
      existing
    ){

      return existing;

    }

    const instance =
    await createServiceInstance(

      container,
      definition,
      scope

    );

    setServiceInstance(

      normalizedName,
      instance

    );

    return instance;

  }



  // ==========================
  // TRANSIENT
  // ==========================

  if(

    lifecycle ===

    SERVICE_LIFECYCLES
    .TRANSIENT

  ){

    return createServiceInstance(

      container,
      definition,
      scope

    );

  }



  // ==========================
  // SCOPED
  // ==========================

  if(

    lifecycle ===

    SERVICE_LIFECYCLES
    .SCOPED

  ){

    return createServiceInstance(

      container,
      definition,
      scope

    );

  }

  throw new Error(
    "INVALID_SERVICE_LIFECYCLE"
  );

}



// =====================================
// EXPORTS
// =====================================

export {

  createServiceInstance,

  resolveService,

  resolveServices

};
