// =====================================
// RIGO AI
// CONTAINER REGISTRY
// FINAL STABILIZED EDITION
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
  message
){

  containerState
  .diagnostics
  .failed++;

  console.warn(
    `[RIGOContainer] ${message}`
  );

  return false;

}



// =====================================
// REGISTER SERVICE
// =====================================

function registerService(
  serviceName,
  factory,
  options = {}
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

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

    containerState
    .services
    .has(
      normalizedName
    )

  ){

    return createContainerError(
      "SERVICE ALREADY REGISTERED"
    );

  }

  if(

    containerState
    .services
    .size >=

    CONTAINER_CONFIG
    .MAX_SERVICES

  ){

    return createContainerError(
      "MAX SERVICES REACHED"
    );

  }

  const dependencies =

    Array.isArray(
      options.dependencies
    )

    ?

    options.dependencies
    .map(normalizeServiceName)
    .filter(Boolean)

    :

    [];

  const lifecycle =

    Object.values(
      CONTAINER_LIFECYCLE
    )
    .includes(
      options.lifecycle
    )

    ?

    options.lifecycle

    :

    CONTAINER_LIFECYCLE
    .SINGLETON;

  const serviceDefinition =
  freezeContainerObject({

    name:
    normalizedName,

    factory,

    dependencies,

    lifecycle,

    lazy:
    options.lazy !== false,

    createdAt:
    Date.now()

  });

  containerState
  .services
  .set(
    normalizedName,
    serviceDefinition
  );

  containerState
  .diagnostics
  .registered++;

  return true;

}



// =====================================
// REMOVE SERVICE
// =====================================

function removeService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    return createContainerError(
      "INVALID SERVICE NAME"
    );

  }

  const exists =

    containerState
    .services
    .has(
      normalizedName
    );

  if(
    !exists
  ){

    return createContainerError(
      "SERVICE NOT FOUND"
    );

  }

  containerState
  .services
  .delete(
    normalizedName
  );

  containerState
  .singletons
  .delete(
    normalizedName
  );

  containerState
  .scopes
  .forEach((scopeContainer) => {

    scopeContainer.delete(
      normalizedName
    );

  });

  containerState
  .diagnostics
  .removed++;

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

  if(
    !normalizedName
  ){

    return null;

  }

  return (

    containerState
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

    ...containerState
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
    containerState
    .services
    .has(
      normalizedName
    )
  );

}



// =====================================
// PUBLIC API
// =====================================

const RIGOContainerRegistry =
Object.freeze({

  register:
  registerService,

  remove:
  removeService,

  get:
  getRegisteredService,

  getAll:
  getRegisteredServices,

  has:
  hasRegisteredService

});



// =====================================
// EXPORTS
// =====================================

export {

  normalizeServiceName,

  registerService,

  removeService,

  getRegisteredService,

  getRegisteredServices,

  hasRegisteredService,

  RIGOContainerRegistry

};

export default
RIGOContainerRegistry;
