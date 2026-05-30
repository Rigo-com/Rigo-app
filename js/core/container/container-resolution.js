// =====================================
// RIGO AI
// CONTAINER RESOLUTION
// =====================================

import {
  CONTAINER_LIFECYCLE
}
from "./container-types.js";

import {
  normalizeServiceName,
  getService
}
from "./container-registry.js";



// =====================================
// CREATE INSTANCE
// =====================================

async function createServiceInstance(
  container,
  definition,
  scope
){

  const dependencies =
  {};

  for(
    const dependency
    of definition.dependencies
  ){

    dependencies[
      dependency
    ] = await resolveService(

      container,

      dependency,

      scope

    );

  }

  return definition.factory({

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
  services = [],
  scope = "global"
){

  const resolved =
  {};

  for(
    const service
    of services
  ){

    resolved[
      service
    ] = await resolveService(

      container,

      service,

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

  if(

    container.state
    .resolutionStack
    .has(
      normalizedName
    )

  ){

    throw new Error(

      `CIRCULAR_DEPENDENCY:${normalizedName}`

    );

  }

  container.state
  .resolutionStack
  .add(
    normalizedName
  );

  try{

    const definition =
    getService(

      container.state,

      normalizedName

    );

    if(
      !definition
    ){

      throw new Error(
        `SERVICE_NOT_FOUND:${normalizedName}`
      );

    }



    // ===============================
    // SINGLETON
    // ===============================

    if(

      definition.lifecycle ===
      CONTAINER_LIFECYCLE.SINGLETON

    ){

      if(

        container.state
        .singletons
        .has(
          normalizedName
        )

      ){

        return container.state
        .singletons
        .get(
          normalizedName
        );

      }

      const instance =
      await createServiceInstance(

        container,
        definition,
        scope

      );

      container.state
      .singletons
      .set(

        normalizedName,

        instance

      );

      return instance;

    }



    // ===============================
    // SCOPED
    // ===============================

    if(

      definition.lifecycle ===
      CONTAINER_LIFECYCLE.SCOPED

    ){

      if(

        !container.state
        .scopes
        .has(scope)

      ){

        container.state
        .scopes
        .set(

          scope,

          new Map()

        );

      }

      const scopeStore =
      container.state
      .scopes
      .get(
        scope
      );

      if(
        scopeStore.has(
          normalizedName
        )
      ){

        return scopeStore
        .get(
          normalizedName
        );

      }

      const instance =
      await createServiceInstance(

        container,
        definition,
        scope

      );

      scopeStore.set(

        normalizedName,

        instance

      );

      return instance;

    }



    // ===============================
    // TRANSIENT
    // ===============================

    return createServiceInstance(

      container,
      definition,
      scope

    );

  }

  finally{

    container.state
    .resolutionStack
    .delete(
      normalizedName
    );

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  createServiceInstance,

  resolveServices,

  resolveService

};
