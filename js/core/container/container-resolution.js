// =====================================
// RIGO AI
// CONTAINER RESOLUTION
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// RESOLVE SERVICES
// =====================================

async function resolveServices(
  services = [],
  scope = "global"
){

  const resolved = {};

  for(
    const service
    of services
  ){

    resolved[
      service
    ] = await resolveService(

      service,

      scope

    );

  }

  return resolved;

}



// =====================================
// CREATE SERVICE INSTANCE
// =====================================

async function createServiceInstance(
  serviceDefinition,
  scope = "global"
){

  const services =
  await resolveServices(

    serviceDefinition
    .dependencies,

    scope

  );

  return await serviceDefinition
  .factory({

    container:
    RIGOContainer,

    services,

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

  containerState
  .diagnostics
  .resolved++;

  containerState
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

  if(
    !normalizedName
  ){

    return createContainerError(
      "INVALID RESOLVE NAME"
    );

  }

  if(

    containerState
    .resolutionStack
    .length >

    CONTAINER_CONFIG
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

      `CIRCULAR DEPENDENCY: ${normalizedName}`

    );

  }

  const serviceDefinition =

    getRegisteredService(
      normalizedName
    );

  if(
    !serviceDefinition
  ){

    return createContainerError(

      `SERVICE NOT FOUND: ${normalizedName}`

    );

  }

  containerState
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

      CONTAINER_LIFECYCLE
      .SINGLETON

    ){

      if(

        containerState
        .singletons
        .has(
          normalizedName
        )

      ){

        return containerState
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

      containerState
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

      CONTAINER_LIFECYCLE
      .SCOPED

    ){

      const scopeContainer =
      getScopeContainer(
        scope
      );

      if(
        !scopeContainer
      ){

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

    createContainerError(

      `SERVICE RESOLUTION FAILED: ${normalizedName}`

    );

    return null;

  }

  finally{

    containerState
    .resolutionStack
    .pop();

  }

}



// =====================================
// PUBLIC API
// =====================================

const RIGOContainerResolution =
Object.freeze({

  resolve:
  resolveService,

  resolveMany:
  resolveServices,

  create:
  createServiceInstance

});



// =====================================
// EXPORTS
// =====================================

export {

  resolveServices,

  createServiceInstance,

  resolveService,

  RIGOContainerResolution

};

export default
RIGOContainerResolution;
