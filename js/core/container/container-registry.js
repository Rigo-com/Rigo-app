// =====================================
// RIGO AI
// CONTAINER REGISTRY
// =====================================



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

  dependencyContainerState
  .diagnostics
  .failed++;

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

  const normalizedDependencies =

    Array.isArray(
      options.dependencies
    )

    ?

    options.dependencies
    .map((dependency) => {

      return normalizeServiceName(
        dependency
      );

    })
    .filter(Boolean)

    :

    [];

  const lifecycle =

    Object.values(
      SERVICE_LIFECYCLE
    )
    .includes(
      options.lifecycle
    )

    ?

    options.lifecycle

    :

    SERVICE_LIFECYCLE
    .SINGLETON;

  const serviceDefinition =
  freezeContainerObject({

    name:
    normalizedName,

    factory,

    dependencies:
    normalizedDependencies,

    lifecycle,

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

  const exists =

    dependencyContainerState
    .services
    .has(
      normalizedName
    );

  if(!exists){

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
// GET SERVICE
// =====================================

function getRegisteredService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(!normalizedName){

    return null;

  }

  return (

    dependencyContainerState
    .services
    .get(
      normalizedName
    )

    ||

    null

  );

}



// =====================================
// GET REGISTERED SERVICES
// =====================================

function getRegisteredServices(){

  return freezeContainerObject([

    ...dependencyContainerState
    .services
    .keys()

  ]);

}



// =====================================
// SERVICE EXISTS
// =====================================

function hasRegisteredService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  return (
    dependencyContainerState
    .services
    .has(
      normalizedName
    )
  );

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.normalizeServiceName =
  normalizeServiceName;

  window.registerService =
  registerService;

  window.removeService =
  removeService;

  window.getRegisteredService =
  getRegisteredService;

  window.getRegisteredServices =
  getRegisteredServices;

  window.hasRegisteredService =
  hasRegisteredService;

}
