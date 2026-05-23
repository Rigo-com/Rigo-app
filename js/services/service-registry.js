// =====================================
// RIGO AI
// SERVICE REGISTRY
// ENTERPRISE SERVICE CONTAINER
// FINAL STABLE EDITION
// =====================================



// =====================================
// SERVICE CONFIG
// =====================================

const SERVICE_REGISTRY_CONFIG =
Object.freeze({

  MAX_SERVICES:500,

  ENABLE_FREEZE:true,

  ENABLE_LOGGING:true

});



// =====================================
// SERVICE STATE
// =====================================

const serviceRegistryState =
Object.seal({

  initialized:false,

  createdAt:
  Date.now(),

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
// NORMALIZE NAME
// =====================================

function normalizeServiceName(
  serviceName
){

  return String(
    serviceName || ""
  )
  .normalize("NFKC")
  .trim()
  .toLowerCase();

}



// =====================================
// SAFE METADATA
// =====================================

function sanitizeServiceMetadata(
  metadata = {}
){

  if(
    !metadata ||
    typeof metadata !==
    "object" ||
    Array.isArray(metadata)
  ){

    return {};
  }

  try{

    const cloned =
    JSON.parse(
      JSON.stringify(
        metadata
      )
    );

    return cloned;

  }

  catch(error){

    return {};

  }

}



// =====================================
// LOG
// =====================================

function logServiceRegistryEvent(
  message,
  metadata = null
){

  if(

    SERVICE_REGISTRY_CONFIG
    .ENABLE_LOGGING !== true

  ){

    return false;

  }

  try{

    if(
      typeof logDiagnosticInfo ===
      "function"
    ){

      logDiagnosticInfo(

        "[SERVICE REGISTRY] " +
        String(message),

        metadata || null

      );

    }

    else{

      console.log(

        "[SERVICE REGISTRY]",

        message,

        metadata || ""

      );

    }

  }

  catch(error){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE SERVICE INSTANCE
// =====================================

function validateServiceInstance(
  serviceInstance
){

  return (

    serviceInstance !==
    undefined

    &&

    serviceInstance !==
    null

  );

}



// =====================================
// VALIDATE REGISTRY LIMIT
// =====================================

function validateRegistryLimit(){

  return (

    serviceRegistryState
    .services
    .size <

    SERVICE_REGISTRY_CONFIG
    .MAX_SERVICES

  );

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

  if(

    !validateServiceInstance(
      serviceInstance
    )

  ){

    return false;

  }

  if(

    !hasService(
      normalizedName
    )

    &&

    !validateRegistryLimit()

  ){

    return false;

  }

  const safeMetadata =
  sanitizeServiceMetadata(
    metadata
  );

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

      updatedAt:
      Date.now(),

      name:
      normalizedName,

      ...safeMetadata

    })

  );

  serviceRegistryState
  .failed
  .delete(
    normalizedName
  );

  logServiceRegistryEvent(

    "SERVICE_REGISTERED",

    {

      service:
      normalizedName

    }

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

  if(
    !normalizedName
  ){

    return null;

  }

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
// GET SERVICE METADATA
// =====================================

function getServiceMetadata(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  return (

    serviceRegistryState
    .metadata
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

  serviceRegistryState
  .failed
  .delete(
    normalizedName
  );

  logServiceRegistryEvent(

    "SERVICE_ACTIVATED",

    {

      service:
      normalizedName

    }

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

  if(
    !normalizedName
  ){

    return false;

  }

  serviceRegistryState
  .active
  .delete(
    normalizedName
  );

  serviceRegistryState
  .failed
  .add(
    normalizedName
  );

  logServiceRegistryEvent(

    "SERVICE_FAILED",

    {

      service:
      normalizedName

    }

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

  if(
    !normalizedName
  ){

    return false;

  }

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

  const removed =
  serviceRegistryState
  .services
  .delete(
    normalizedName
  );

  logServiceRegistryEvent(

    "SERVICE_REMOVED",

    {

      service:
      normalizedName

    }

  );

  return removed;

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
// CLEAR REGISTRY
// =====================================

function clearServiceRegistry(){

  serviceRegistryState
  .services
  .clear();

  serviceRegistryState
  .active
  .clear();

  serviceRegistryState
  .failed
  .clear();

  serviceRegistryState
  .metadata
  .clear();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getServiceRegistryDiagnostics(){

  return Object.freeze({

    initialized:

      serviceRegistryState
      .initialized,

    createdAt:

      serviceRegistryState
      .createdAt,

    totalServices:

      serviceRegistryState
      .services
      .size,

    activeServices:

      serviceRegistryState
      .active
      .size,

    failedServices:

      serviceRegistryState
      .failed
      .size,

    active:[

      ...serviceRegistryState
      .active

    ],

    failed:[

      ...serviceRegistryState
      .failed

    ],

    services:
    listServices()

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

  logServiceRegistryEvent(
    "SERVICE_REGISTRY_READY"
  );

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

  getMetadata:
  getServiceMetadata,

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

  clear:
  clearServiceRegistry,

  diagnostics:
  getServiceRegistryDiagnostics

});
