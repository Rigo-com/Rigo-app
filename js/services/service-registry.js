// =====================================
// RIGO AI
// SERVICE REGISTRY
// SERVICE CONTAINER LAYER
// =====================================



// =====================================
// CONFIG
// =====================================

const SERVICE_REGISTRY_CONFIG =
Object.freeze({

  MAX_SERVICES:
  500

});



// =====================================
// STATE
// =====================================

const serviceRegistryState =
Object.seal({

  services:
  new Map()

});



// =====================================
// HELPERS
// =====================================

function normalizeServiceName(
  serviceName
){

  return String(
    serviceName ?? ""
  )
  .normalize("NFKC")
  .trim()
  .toLowerCase();

}



// =====================================
// REGISTER
// =====================================

function registerService(
  serviceName,
  serviceInstance
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  if(

    serviceInstance ===
    undefined ||

    serviceInstance ===
    null

  ){

    return false;

  }

  if(

    serviceRegistryState
    .services
    .size >=

    SERVICE_REGISTRY_CONFIG
    .MAX_SERVICES

  ){

    return false;

  }

  if(

    serviceRegistryState
    .services
    .has(
      normalizedName
    )

  ){

    return false;

  }

  serviceRegistryState
  .services
  .set(

    normalizedName,

    serviceInstance

  );

  return true;

}



// =====================================
// GET
// =====================================

function getService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  return (

    serviceRegistryState
    .services
    .get(
      normalizedName
    )

    ||

    null

  );

}



// =====================================
// HAS
// =====================================

function hasService(
  serviceName
){

  return serviceRegistryState
  .services
  .has(

    normalizeServiceName(
      serviceName
    )

  );

}



// =====================================
// REMOVE
// =====================================

function removeService(
  serviceName
){

  return serviceRegistryState
  .services
  .delete(

    normalizeServiceName(
      serviceName
    )

  );

}



// =====================================
// LIST
// =====================================

function listServices(){

  return Object.freeze([

    ...serviceRegistryState
    .services
    .keys()

  ]);

}



// =====================================
// CLEAR
// =====================================

function clearServices(){

  serviceRegistryState
  .services
  .clear();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getServiceRegistryDiagnostics(){

  return Object.freeze({

    totalServices:

      serviceRegistryState
      .services
      .size,

    services:
    listServices(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ServiceRegistry =
Object.freeze({

  register:
  registerService,

  get:
  getService,

  has:
  hasService,

  remove:
  removeService,

  list:
  listServices,

  clear:
  clearServices,

  diagnostics:
  getServiceRegistryDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  SERVICE_REGISTRY_CONFIG,

  registerService,

  getService,

  hasService,

  removeService,

  listServices,

  clearServices,

  getServiceRegistryDiagnostics,

  ServiceRegistry

};

export default
ServiceRegistry;
