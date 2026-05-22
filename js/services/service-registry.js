// =====================================
// RIGO AI
// SERVICE REGISTRY
// ENTERPRISE SERVICE CONTAINER
// =====================================



// =====================================
// SERVICE STATE
// =====================================

const serviceRegistryState =
Object.seal({

  initialized:false,

  services:
  new Map(),

  active:
  new Set(),

  failed:
  new Set(),

  metadata:
  new Map()

});



// =====================================
// VALIDATE NAME
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



// =====================================
// REGISTER SERVICE
// =====================================

function registerService(
  serviceName,
  serviceInstance,
  metadata = {}
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

  serviceRegistryState
  .services
  .set(

    normalizedName,

    serviceInstance

  );

  serviceRegistryState
  .metadata
  .set(

    normalizedName,

    Object.freeze({

      registeredAt:
      Date.now(),

      ...metadata

    })

  );

  return true;

}



// =====================================
// GET SERVICE
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
// ACTIVATE SERVICE
// =====================================

function activateService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !serviceRegistryState
    .services
    .has(
      normalizedName
    )
  ){

    return false;

  }

  serviceRegistryState
  .active
  .add(
    normalizedName
  );

  return true;

}



// =====================================
// FAIL SERVICE
// =====================================

function failService(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  serviceRegistryState
  .failed
  .add(
    normalizedName
  );

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

  serviceRegistryState
  .active
  .delete(
    normalizedName
  );

  serviceRegistryState
  .failed
  .delete(
    normalizedName
  );

  serviceRegistryState
  .metadata
  .delete(
    normalizedName
  );

  return serviceRegistryState
  .services
  .delete(
    normalizedName
  );

}



// =====================================
// HAS SERVICE
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
// LIST SERVICES
// =====================================

function listServices(){

  return Object.freeze([

    ...serviceRegistryState
    .services
    .keys()

  ]);

}



// =====================================
// DIAGNOSTICS
// =====================================

function getServiceRegistryDiagnostics(){

  return Object.freeze({

    initialized:

      serviceRegistryState
      .initialized,

    totalServices:

      serviceRegistryState
      .services
      .size,

    active:[

      ...serviceRegistryState
      .active

    ],

    failed:[

      ...serviceRegistryState
      .failed

    ]

  });

}



// =====================================
// INITIALIZE
// =====================================

function initializeServiceRegistry(){

  if(
    serviceRegistryState
    .initialized
  ){

    return true;

  }

  serviceRegistryState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ServiceRegistry =
Object.freeze({

  initialize:
  initializeServiceRegistry,

  register:
  registerService,

  get:
  getService,

  activate:
  activateService,

  fail:
  failService,

  remove:
  removeService,

  has:
  hasService,

  list:
  listServices,

  diagnostics:
  getServiceRegistryDiagnostics

});
