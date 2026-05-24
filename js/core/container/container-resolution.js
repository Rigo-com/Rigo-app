// =====================================
// RIGO AI
// CONTAINER RESOLUTION
// =====================================



// =====================================
// RESOLVE DEPENDENCIES
// =====================================

async function resolveDependencies(
  dependencies = [],
  scope = "global"
){

  const resolved = {};

  for(
    const dependency
    of dependencies
  ){

    resolved[
      dependency
    ] = await resolveService(

      dependency,

      scope

    );

  }

  return resolved;

}



// =====================================
// CREATE INSTANCE
// =====================================

async function createServiceInstance(
  serviceDefinition,
  scope = "global"
){

  const dependencies =
  await resolveDependencies(

    serviceDefinition
    .dependencies,

    scope

  );

  return await serviceDefinition
  .factory({

    container:
    DependencyContainer,

    dependencies,

    scope

  });

}



// =====================================
// RESOLUTION EVENT
// =====================================

async function emitResolutionEvent(
  service,
  lifecycle,
  scope
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      CONTAINER_EVENTS
      .RESOLVED,

      {

        service,

        lifecycle,

        scope

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// RESOLUTION SUCCESS
// =====================================

async function finalizeResolution(
  serviceDefinition,
  serviceName,
  scope,
  instance
){

  dependencyContainerState
  .diagnostics
  .resolved++;

  dependencyContainerState
  .lastResolvedAt =
  Date.now();

  await emitResolutionEvent(

    serviceName,

    serviceDefinition
    .lifecycle,

    scope

  );

  return instance;

}



// =====================================
// RESOLVE SERVICE
// =====================================

async function resolveService(
  serviceName,
  scope = "global"
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(!normalizedName){

    return createContainerError(
      "INVALID RESOLVE NAME"
    );

  }

  if(

    dependencyContainerState
    .resolutionStack
    .length >

    DEPENDENCY_CONTAINER_CONFIG
    .MAX_RESOLUTION_DEPTH

  ){

    return createContainerError(
      "MAX RESOLUTION DEPTH"
    );

  }

  if(

    detectCircularDependency(
      normalizedName
    )

  ){

    return createContainerError(

      "CIRCULAR DEPENDENCY",

      {

        service:
        normalizedName

      }

    );

  }

  const serviceDefinition =

    getRegisteredService(
      normalizedName
    );

  if(!serviceDefinition){

    return createContainerError(

      "SERVICE NOT FOUND",

      {

        service:
        normalizedName

      }

    );

  }

  dependencyContainerState
  .resolutionStack
  .push(
    normalizedName
  );

  try{



    // ================================
    // SINGLETON
    // ================================

    if(

      serviceDefinition
      .lifecycle ===

      SERVICE_LIFECYCLE
      .SINGLETON

    ){

      if(

        dependencyContainerState
        .singletons
        .has(
          normalizedName
        )

      ){

        return dependencyContainerState
        .singletons
        .get(
          normalizedName
        );

      }

      const singleton =
      await createServiceInstance(

        serviceDefinition,

        scope

      );

      dependencyContainerState
      .singletons
      .set(

        normalizedName,

        singleton

      );

      return finalizeResolution(

        serviceDefinition,

        normalizedName,

        scope,

        singleton

      );

    }



    // ================================
    // SCOPED
    // ================================

    if(

      serviceDefinition
      .lifecycle ===

      SERVICE_LIFECYCLE
      .SCOPED

    ){

      const scopeContainer =
      getScopeContainer(
        scope
      );

      if(!scopeContainer){

        return createContainerError(
          "INVALID SCOPE"
        );

      }

      if(
        scopeContainer.has(
          normalizedName
        )
      ){

        return scopeContainer
        .get(
          normalizedName
        );

      }

      const scopedInstance =
      await createServiceInstance(

        serviceDefinition,

        scope

      );

      scopeContainer.set(

        normalizedName,

        scopedInstance

      );

      return finalizeResolution(

        serviceDefinition,

        normalizedName,

        scope,

        scopedInstance

      );

    }



    // ================================
    // TRANSIENT
    // ================================

    const transientInstance =
    await createServiceInstance(

      serviceDefinition,

      scope

    );

    return finalizeResolution(

      serviceDefinition,

      normalizedName,

      scope,

      transientInstance

    );

  }

  catch(error){

    dependencyContainerState
    .diagnostics
    .failed++;

    createContainerError(

      "SERVICE RESOLUTION FAILED",

      {

        service:
        normalizedName,

        error:
        String(error)

      }

    );

    return null;

  }

  finally{

    dependencyContainerState
    .resolutionStack
    .pop();

  }

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.resolveDependencies =
  resolveDependencies;

  window.createServiceInstance =
  createServiceInstance;

  window.resolveService =
  resolveService;

}
