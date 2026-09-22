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
  scope,
  resolutionPath
){
  if(!definition){
    throw new Error("INVALID_SERVICE_DEFINITION");
  }

  if(typeof definition.factory !== "function"){
    throw new Error("INVALID_SERVICE_FACTORY");
  }

  const dependencies = {};
  const dependencyList = definition.dependencies || [];

  for(const dependency of dependencyList){
    dependencies[dependency] = await resolveService(
      container,
      dependency,
      scope,
      resolutionPath
    );
  }

  return await definition.factory({
    container,
    services:dependencies,
    scope
  });
}

async function resolveServices(
  container,
  services = [],
  scope = getDefaultContainerScope()
){
  const resolved = {};
  const normalizedScope = normalizeContainerScope(scope);

  for(const service of services){
    resolved[service] = await resolveService(
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
  scope = getDefaultContainerScope(),
  resolutionPath = new Set()
){
  const normalizedName = normalizeServiceName(serviceName);
  const normalizedScope = normalizeContainerScope(scope);

  if(!normalizedName){
    throw new Error("INVALID_SERVICE_NAME");
  }

  if(resolutionPath.has(normalizedName)){
    throw new Error(`CIRCULAR_DEPENDENCY:${normalizedName}`);
  }

  const definition = getService(container.state, normalizedName);
  if(!definition){
    throw new Error(`SERVICE_NOT_FOUND:${normalizedName}`);
  }

  const nextPath = new Set(resolutionPath);
  nextPath.add(normalizedName);

  if(definition.lifecycle === CONTAINER_LIFECYCLE.SINGLETON){
    if(container.state.singletons.has(normalizedName)){
      return container.state.singletons.get(normalizedName);
    }

    if(container.state.singletonPromises.has(normalizedName)){
      return container.state.singletonPromises.get(normalizedName);
    }

    const creationPromise = createServiceInstance(
      container,
      definition,
      normalizedScope,
      nextPath
    );

    container.state.singletonPromises.set(normalizedName, creationPromise);

    try{
      const instance = await creationPromise;
      container.state.singletons.set(normalizedName, instance);
      return instance;
    }finally{
      container.state.singletonPromises.delete(normalizedName);
    }
  }

  if(definition.lifecycle === CONTAINER_LIFECYCLE.SCOPED){
    if(!container.state.scopes.has(normalizedScope)){
      container.state.scopes.set(normalizedScope, new Map());
    }

    if(!container.state.scopedPromises.has(normalizedScope)){
      container.state.scopedPromises.set(normalizedScope, new Map());
    }

    const scopeStore = container.state.scopes.get(normalizedScope);
    const pendingStore = container.state.scopedPromises.get(normalizedScope);

    if(scopeStore.has(normalizedName)){
      return scopeStore.get(normalizedName);
    }

    if(pendingStore.has(normalizedName)){
      return pendingStore.get(normalizedName);
    }

    const creationPromise = createServiceInstance(
      container,
      definition,
      normalizedScope,
      nextPath
    );

    pendingStore.set(normalizedName, creationPromise);

    try{
      const instance = await creationPromise;
      scopeStore.set(normalizedName, instance);
      return instance;
    }finally{
      pendingStore.delete(normalizedName);
      if(pendingStore.size === 0){
        container.state.scopedPromises.delete(normalizedScope);
      }
    }
  }

  return createServiceInstance(
    container,
    definition,
    normalizedScope,
    nextPath
  );
}

export {
  createServiceInstance,
  resolveServices,
  resolveService
};
