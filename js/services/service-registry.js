// =====================================
// RIGO AI
// SERVICE REGISTRY
// ENTERPRISE SERVICE CONTAINER
// FINAL STABLE PATCHED EDITION
// =====================================



// =====================================
// SERVICE CONFIG
// =====================================

const SERVICE_REGISTRY_CONFIG =
Object.freeze({

  MAX_SERVICES:500,

  ENABLE_FREEZE:true,

  ENABLE_LOGGING:true,

  ENABLE_DUPLICATE_PROTECTION:true,

  ENABLE_ASYNC_BOOT:true,

  ENABLE_LIFECYCLE_TRACKING:true,

  ENABLE_FAILURE_TRACKING:true,

  ENABLE_IMMUTABLE_SERVICES:true

});



// =====================================
// SERVICE STATE
// =====================================

const serviceRegistryState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  createdAt:
  Date.now(),

  services:
  new Map(),

  active:
  new Set(),

  failed:
  new Set(),

  immutable:
  new Set(),

  metadata:
  new Map(),

  requirements:
  new Map(),

  lifecycle:
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

    return JSON.parse(
      JSON.stringify(
        metadata
      )
    );

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
// VALIDATE INSTANCE
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
// VALIDATE REQUIREMENTS
// =====================================

function validateServiceRequirements(
  requirements = []
){

  if(
    !Array.isArray(
      requirements
    )
  ){

    return false;

  }

  return requirements.every((requirement) => {

    return Boolean(
      normalizeServiceName(
        requirement
      )
    );

  });

}



// =====================================
// CHECK CIRCULAR REQUIREMENTS
// =====================================

function hasCircularRequirement(
  serviceName,
  requirements = []
){

  const normalizedService =
  normalizeServiceName(
    serviceName
  );

  return requirements.some((requirement) => {

    return (

      normalizeServiceName(
        requirement
      ) === normalizedService

    );

  });

}



// =====================================
// CREATE LIFECYCLE
// =====================================

function createServiceLifecycle(
  serviceName
){

  return Object.freeze({

    service:
    serviceName,

    createdAt:
    Date.now(),

    activatedAt:null,

    failedAt:null,

    removedAt:null,

    restartCount:0,

    status:"registered"

  });

}



// =====================================
// REGISTER SERVICE
// =====================================

function registerService(
  serviceName,
  serviceInstance,
  metadata = {}
){

  try{

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

    if(

      SERVICE_REGISTRY_CONFIG
      .ENABLE_DUPLICATE_PROTECTION

      &&

      hasService(
        normalizedName
      )

      &&

      serviceRegistryState
      .immutable
      .has(
        normalizedName
      )

    ){

      return false;

    }

    const safeMetadata =
    sanitizeServiceMetadata(
      metadata
    );

    const requirements =
    Array.isArray(
      safeMetadata.requirements
    )

    ? safeMetadata.requirements

    : [];

    if(

      !validateServiceRequirements(
        requirements
      )

    ){

      return false;

    }

    if(

      hasCircularRequirement(

        normalizedName,

        requirements

      )

    ){

      return false;

    }

    const previousMetadata =
    serviceRegistryState
    .metadata
    .get(
      normalizedName
    );



    // ===================================
    // REGISTER INSTANCE
    // ===================================

    serviceRegistryState
    .services
    .set(

      normalizedName,

      serviceInstance

    );



    // ===================================
    // IMMUTABLE
    // ===================================

    if(

      SERVICE_REGISTRY_CONFIG
      .ENABLE_IMMUTABLE_SERVICES

      &&

      safeMetadata.immutable ===
      true

    ){

      serviceRegistryState
      .immutable
      .add(
        normalizedName
      );

    }



    // ===================================
    // REQUIREMENTS
    // ===================================

    serviceRegistryState
    .requirements
    .set(

      normalizedName,

      Object.freeze([
        ...requirements
      ])

    );



    // ===================================
    // METADATA
    // ===================================

    serviceRegistryState
    .metadata
    .set(

      normalizedName,

      Object.freeze({

        registeredAt:

          previousMetadata
          ?.registeredAt ||

          Date.now(),

        updatedAt:
        Date.now(),

        version:
        safeMetadata.version ||
        "1.0.0",

        status:
        "registered",

        name:
        normalizedName,

        ...previousMetadata,

        ...safeMetadata

      })

    );



    // ===================================
    // LIFECYCLE
    // ===================================

    if(

      SERVICE_REGISTRY_CONFIG
      .ENABLE_LIFECYCLE_TRACKING

    ){

      if(

        !serviceRegistryState
        .lifecycle
        .has(
          normalizedName
        )

      ){

        serviceRegistryState
        .lifecycle
        .set(

          normalizedName,

          createServiceLifecycle(
            normalizedName
          )

        );

      }

    }

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

  catch(error){

    return false;

  }

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
// GET REQUIREMENTS
// =====================================

function getServiceRequirements(
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  return [

    ...(serviceRegistryState
    .requirements
    .get(
      normalizedName
    ) || [])

  ];

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

  const lifecycle =
  serviceRegistryState
  .lifecycle
  .get(
    normalizedName
  );

  if(lifecycle){

    serviceRegistryState
    .lifecycle
    .set(

      normalizedName,

      Object.freeze({

        ...lifecycle,

        activatedAt:
        Date.now(),

        status:"active"

      })

    );

  }

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

  const lifecycle =
  serviceRegistryState
  .lifecycle
  .get(
    normalizedName
  );

  if(lifecycle){

    serviceRegistryState
    .lifecycle
    .set(

      normalizedName,

      Object.freeze({

        ...lifecycle,

        failedAt:
        Date.now(),

        status:"failed"

      })

    );

  }

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

  try{

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

      serviceRegistryState
      .immutable
      .has(
        normalizedName
      )

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
    .immutable
    .delete(
      normalizedName
    );

    serviceRegistryState
    .metadata
    .delete(
      normalizedName
    );

    serviceRegistryState
    .requirements
    .delete(
      normalizedName
    );

    const lifecycle =
    serviceRegistryState
    .lifecycle
    .get(
      normalizedName
    );

    if(lifecycle){

      serviceRegistryState
      .lifecycle
      .set(

        normalizedName,

        Object.freeze({

          ...lifecycle,

          removedAt:
          Date.now(),

          status:"removed"

        })

      );

    }

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

  catch(error){

    return false;

  }

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
// BOOT SERVICES
// =====================================

async function bootRegisteredServices(){

  if(

    !SERVICE_REGISTRY_CONFIG
    .ENABLE_ASYNC_BOOT

  ){

    return true;

  }

  if(
    serviceRegistryState
    .booting
  ){

    return false;

  }

  serviceRegistryState
  .booting = true;

  try{

    for(

      const [

        serviceName,

        serviceInstance

      ]

      of

      serviceRegistryState
      .services

    ){

      try{

        if(

          serviceInstance &&

          typeof serviceInstance
          .initialize ===
          "function"

        ){

          await serviceInstance
          .initialize();

        }

        activateService(
          serviceName
        );

      }

      catch(error){

        failService(
          serviceName
        );

      }

    }

    return true;

  }

  catch(error){

    return false;

  }

  finally{

    serviceRegistryState
    .booting = false;

  }

}



// =====================================
// CLEAR REGISTRY
// =====================================

function clearServiceRegistry(
  force = false
){

  if(
    force !== true
  ){

    return false;

  }

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
  .immutable
  .clear();

  serviceRegistryState
  .metadata
  .clear();

  serviceRegistryState
  .requirements
  .clear();

  serviceRegistryState
  .lifecycle
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

    booting:

      serviceRegistryState
      .booting,

    shuttingDown:

      serviceRegistryState
      .shuttingDown,

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

    immutableServices:

      serviceRegistryState
      .immutable
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

async function initializeServiceRegistry(){

  if(
    serviceRegistryState
    .initialized
  ){

    return true;

  }

  serviceRegistryState
  .initialized =
  true;

  await bootRegisteredServices();

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

  getRequirements:
  getServiceRequirements,

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

  boot:
  bootRegisteredServices,

  clear:
  clearServiceRegistry,

  diagnostics:
  getServiceRegistryDiagnostics,

  snapshot:
  getServiceRegistryDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ServiceRegistry",

    {

      value:
      ServiceRegistry,

      writable:false,

      configurable:false

    }

  );

}
