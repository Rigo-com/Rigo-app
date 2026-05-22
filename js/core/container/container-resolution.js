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

    dependencyContainerState
    .services
    .get(
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

      dependencyContainerState
      .diagnostics
      .resolved++;

      dependencyContainerState
      .lastResolvedAt =
      Date.now();

      return singleton;

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

      dependencyContainerState
      .diagnostics
      .resolved++;

      return scopedInstance;

    }



    // ================================
    // TRANSIENT
    // ================================

    const transientInstance =
    await createServiceInstance(

      serviceDefinition,

      scope

    );

    dependencyContainerState
    .diagnostics
    .resolved++;

    dependencyContainerState
    .lastResolvedAt =
    Date.now();

    return transientInstance;

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
    .resolutionStack =
    dependencyContainerState
    .resolutionStack
    .filter((item) => {

      return (
        item !==
        normalizedName
      );

    });

  }

}
