// =====================================
// RIGO AI
// CONTAINER RESOLUTION
// =====================================

import {
  CONTAINER_LIFECYCLE
}
from "./container-types.js";

import {
  normalizeContainerScope,
  getDefaultContainerScope
}
from "./container-scopes.js";

import {
  normalizeServiceName,
  getService
}
from "./container-registry.js";


async function createServiceInstance(
  container,
  definition,
  scope
){

  if(!definition){
    throw new Error(
      "INVALID_SERVICE_DEFINITION"
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

  const dependencies = {};
  const dependencyList =
  definition.dependencies || [];

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

  return await definition.factory({
    container,
    services:
    dependencies,
    scope
  });
}


async function resolveServices(
  container,
  services = [],
  scope = getDefaultContainerScope()
){

  const resolved = {};
  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  for(
    const service
    of services
  ){
    resolved[
      service
    ] = await resolveService(
      container,
      service,
      normalizedScope
    );
  }

  return resolved;
}


async function resolveService(
  container,
  serviceName,
  scope = getDefaultContainerScope()
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  const normalizedScope =
  normalizeContainerScope(
    scope
  );

  if(!normalizedName){
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

    if(!definition){
      throw new Error(
        `SERVICE_NOT_FOUND:${normalizedName}`
      );
    }

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
        normalizedScope
      );

      container.state
      .singletons
      .set(
        normalizedName,
        instance
      );

      return instance;
    }

    if(
      definition.lifecycle ===
      CONTAINER_LIFECYCLE.SCOPED
    ){

      if(
        !container.state
        .scopes
        .has(
          normalizedScope
        )
      ){
        container.state
        .scopes
        .set(
          normalizedScope,
          new Map()
        );
      }

      const scopeStore =
      container.state
      .scopes
      .get(
        normalizedScope
      );

      if(
        scopeStore.has(
          normalizedName
        )
      ){
        return scopeStore.get(
          normalizedName
        );
      }

      const instance =
      await createServiceInstance(
        container,
        definition,
        normalizedScope
      );

      scopeStore.set(
        normalizedName,
        instance
      );

      return instance;
    }

    return createServiceInstance(
      container,
      definition,
      normalizedScope
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


export {
  createServiceInstance,
  resolveServices,
  resolveService
};
