// =====================================
// RIGO AI
// DEPENDENCY CONTAINER
// ENTERPRISE KERNEL FINAL
// =====================================



// =====================================
// CONTAINER CONFIG
// =====================================

const DEPENDENCY_CONTAINER_CONFIG =
Object.freeze({

  ENABLE_SINGLETONS:true,

  ENABLE_LAZY_LOADING:true,

  ENABLE_SCOPES:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_CIRCULAR_PROTECTION:true,

  ENABLE_LIFECYCLE_EVENTS:true,

  MAX_SERVICES:
  1000,

  MAX_RESOLUTION_DEPTH:
  50

});



// =====================================
// SERVICE LIFECYCLE
// =====================================

const SERVICE_LIFECYCLE =
Object.freeze({

  SINGLETON:"singleton",

  TRANSIENT:"transient",

  SCOPED:"scoped"

});



// =====================================
// CONTAINER EVENTS
// =====================================

const CONTAINER_EVENTS =
Object.freeze({

  INITIALIZED:
  "container.initialized",

  REGISTERED:
  "container.registered",

  RESOLVED:
  "container.resolved",

  REMOVED:
  "container.removed",

  RESET:
  "container.reset",

  ERROR:
  "container.error"

});



// =====================================
// CONTAINER STATE
// =====================================

const dependencyContainerState =
Object.seal({

  initialized:false,

  services:
  new Map(),

  singletons:
  new Map(),

  scopes:
  new Map(),

  resolutionStack:[],

  diagnostics:{

    registered:0,

    resolved:0,

    failed:0,

    removed:0,

    scopes:0

  },

  lastResolvedAt:null

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



function isValidFactory(
  factory
){

  return (
    typeof factory ===
    "function"
  );

}



function createContainerError(
  message,
  metadata = {}
){

  if(
    typeof logDiagnosticError ===
    "function"
  ){

    logDiagnosticError(
      message,
      metadata
    );

  }

  return false;

}



// =====================================
// IMMUTABLE
// =====================================

function freezeContainerObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeContainerObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// REGISTER SERVICE
// =====================================

async function registerService(
  serviceName,
  factory,
  options = {}
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(!normalizedName){

    return createContainerError(
      "INVALID SERVICE NAME"
    );

  }

  if(
    !isValidFactory(
      factory
    )
  ){

    return createContainerError(
      "INVALID SERVICE FACTORY"
    );

  }

  if(

    dependencyContainerState
    .services
    .size >=

    DEPENDENCY_CONTAINER_CONFIG
    .MAX_SERVICES

  ){

    return createContainerError(
      "MAX SERVICES REACHED"
    );

  }

  const serviceDefinition =
  freezeContainerObject({

    name:
    normalizedName,

    factory,

    dependencies:

      Array.isArray(
        options.dependencies
      )

      ? options.dependencies

      : [],

    lifecycle:

      options.lifecycle ||

      SERVICE_LIFECYCLE
      .SINGLETON,

    lazy:

      options.lazy !==
      false,

    createdAt:
    Date.now()

  });

  dependencyContainerState
  .services
  .set(

    normalizedName,

    serviceDefinition

  );

  dependencyContainerState
  .diagnostics
  .registered++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      CONTAINER_EVENTS
      .REGISTERED,

      {

        service:
        normalizedName

      }

    );

  }

  return true;

}



// =====================================
// CIRCULAR CHECK
// =====================================

function detectCircularDependency(
  serviceName
){

  if(

    !DEPENDENCY_CONTAINER_CONFIG
    .ENABLE_CIRCULAR_PROTECTION

  ){

    return false;

  }

  return (

    dependencyContainerState
    .resolutionStack
    .includes(
      serviceName
    )

  );

}



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
// SCOPES
// =====================================

function getScopeContainer(
  scope
){

  const normalizedScope =
  normalizeServiceName(
    scope
  );

  if(
    !normalizedScope
  ){

    return null;

  }

  if(

    !dependencyContainerState
    .scopes
    .has(
      normalizedScope
    )

  ){

    dependencyContainerState
    .scopes
    .set(

      normalizedScope,

      new Map()

    );

    dependencyContainerState
    .diagnostics
    .scopes++;

  }

  return dependencyContainerState
  .scopes
  .get(
    normalizedScope
  );

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



// =====================================
// REMOVE SERVICE
// =====================================

async function removeService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(!normalizedName){

    return false;

  }

  dependencyContainerState
  .services
  .delete(
    normalizedName
  );

  dependencyContainerState
  .singletons
  .delete(
    normalizedName
  );

  dependencyContainerState
  .scopes
  .forEach((scopeContainer) => {

    scopeContainer.delete(
      normalizedName
    );

  });

  dependencyContainerState
  .diagnostics
  .removed++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      CONTAINER_EVENTS
      .REMOVED,

      {

        service:
        normalizedName

      }

    );

  }

  return true;

}



// =====================================
// RESET CONTAINER
// =====================================

async function resetDependencyContainer(){

  dependencyContainerState
  .services
  .clear();

  dependencyContainerState
  .singletons
  .clear();

  dependencyContainerState
  .scopes
  .clear();

  dependencyContainerState
  .resolutionStack =
  [];

  dependencyContainerState
  .diagnostics = {

    registered:0,

    resolved:0,

    failed:0,

    removed:0,

    scopes:0

  };

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(
      CONTAINER_EVENTS.RESET
    );

  }

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getContainerDiagnostics(){

  return freezeContainerObject({

    initialized:
    dependencyContainerState
    .initialized,

    services:

      dependencyContainerState
      .services
      .size,

    singletons:

      dependencyContainerState
      .singletons
      .size,

    scopes:

      dependencyContainerState
      .scopes
      .size,

    activeResolutions:

      dependencyContainerState
      .resolutionStack
      .length,

    diagnostics:

      dependencyContainerState
      .diagnostics,

    lastResolvedAt:

      dependencyContainerState
      .lastResolvedAt

  });

}



// =====================================
// INITIALIZE
// =====================================

async function initializeDependencyContainer(){

  if(
    dependencyContainerState
    .initialized
  ){

    return true;

  }

  dependencyContainerState
  .initialized =
  true;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      CONTAINER_EVENTS
      .INITIALIZED

    );

  }

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const DependencyContainer =
Object.freeze({

  initialize:
  initializeDependencyContainer,

  register:
  registerService,

  resolve:
  resolveService,

  remove:
  removeService,

  reset:
  resetDependencyContainer,

  diagnostics:
  getContainerDiagnostics,

  lifecycles:
  SERVICE_LIFECYCLE

});
