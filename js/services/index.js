// =====================================
// RIGO AI
// SERVICES INDEX
// ENTERPRISE SERVICE RUNTIME
// FINAL STABLE EDITION
// =====================================



// =====================================
// SERVICES STATE
// =====================================

const servicesRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  crashed:false,

  initializedAt:null,

  lastError:null,

  loadedServices:
  new Set(),

  failedServices:
  new Set()

});



// =====================================
// SERVICE DEFINITIONS
// =====================================

const SERVICES_RUNTIME =
Object.freeze([

  {

    name:"registry",

    required:true,

    initialize(){

      return (

        typeof ServiceRegistry !==
        "undefined"

        &&

        typeof ServiceRegistry
        .initialize ===
        "function"

        &&

        ServiceRegistry
        .initialize()

      );

    }

  },



  {

    name:"api",

    required:true,

    initialize(){

      return (

        typeof APIService !==
        "undefined"

        &&

        typeof APIService
        .initialize ===
        "function"

        &&

        APIService
        .initialize()

      );

    }

  },



  {

    name:"ai",

    required:true,

    initialize(){

      return (

        typeof AIService !==
        "undefined"

        &&

        typeof AIService
        .initialize ===
        "function"

        &&

        AIService
        .initialize()

      );

    }

  }

]);



// =====================================
// LOG HELPERS
// =====================================

function logServicesInfo(
  message,
  metadata = null
){

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[SERVICES]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[SERVICES]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



function logServicesError(
  message,
  metadata = null
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(

        "[SERVICES]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[SERVICES]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// VALIDATE RUNTIME
// =====================================

function validateServicesRuntime(){

  return SERVICES_RUNTIME
  .every((service) => {

    return (

      service

      &&

      typeof service ===
      "object"

      &&

      typeof service.name ===
      "string"

      &&

      typeof service
      .initialize ===
      "function"

    );

  });

}



// =====================================
// REGISTER LOADED SERVICE
// =====================================

function registerLoadedService(
  serviceName
){

  servicesRuntimeState
  .loadedServices
  .add(
    String(serviceName)
  );

  servicesRuntimeState
  .failedServices
  .delete(
    String(serviceName)
  );

  return true;

}



// =====================================
// REGISTER FAILED SERVICE
// =====================================

function registerFailedService(
  serviceName
){

  servicesRuntimeState
  .failedServices
  .add(
    String(serviceName)
  );

  return true;

}



// =====================================
// INITIALIZE SERVICES
// =====================================

async function initializeServicesRuntime(){

  if(
    servicesRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    servicesRuntimeState
    .initializing
  ){

    return false;

  }

  servicesRuntimeState
  .initializing =
  true;

  try{

    const valid =
    validateServicesRuntime();

    if(!valid){

      throw new Error(
        "INVALID_SERVICES_RUNTIME"
      );

    }

    for(
      const service of
      SERVICES_RUNTIME
    ){

      try{

        const initialized =
        await service
        .initialize();

        if(!initialized){

          registerFailedService(
            service.name
          );

          logServicesError(

            "SERVICE INIT FAILED",

            {

              service:
              service.name

            }

          );

          if(
            service.required
          ){

            throw new Error(

              "REQUIRED_SERVICE_FAILED"

            );

          }

          continue;

        }

        registerLoadedService(
          service.name
        );

        logServicesInfo(

          "SERVICE READY",

          {

            service:
            service.name

          }

        );

      }

      catch(error){

        registerFailedService(
          service.name
        );

        logServicesError(

          "SERVICE CRASHED",

          {

            service:
            service.name,

            error:
            String(error)

          }

        );

        if(
          service.required
        ){

          throw error;

        }

      }

    }

    servicesRuntimeState
    .initialized =
    true;

    servicesRuntimeState
    .initializedAt =
    Date.now();

    logServicesInfo(
      "SERVICES RUNTIME READY"
    );

    return true;

  }

  catch(error){

    servicesRuntimeState
    .crashed =
    true;

    servicesRuntimeState
    .lastError =
    error;

    logServicesError(

      "SERVICES RUNTIME FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    servicesRuntimeState
    .initializing =
    false;

  }

}



// =====================================
// RESET SERVICES RUNTIME
// =====================================

async function resetServicesRuntime(){

  servicesRuntimeState
  .loadedServices
  .clear();

  servicesRuntimeState
  .failedServices
  .clear();

  servicesRuntimeState
  .initialized =
  false;

  servicesRuntimeState
  .crashed =
  false;

  servicesRuntimeState
  .lastError =
  null;

  return initializeServicesRuntime();

}



// =====================================
// SERVICES HEALTHCHECK
// =====================================

function runServicesHealthcheck(){

  if(
    !servicesRuntimeState
    .initialized
  ){

    return false;

  }

  return (

    servicesRuntimeState
    .failedServices
    .size === 0

  );

}



// =====================================
// GET SERVICE INSTANCE
// =====================================

function getRegisteredService(
  serviceName
){

  if(
    typeof ServiceRegistry ===
    "undefined"
  ){

    return null;

  }

  if(

    typeof ServiceRegistry.get !==
    "function"

  ){

    return null;

  }

  return ServiceRegistry
  .get(
    serviceName
  );

}



// =====================================
// SERVICES DIAGNOSTICS
// =====================================

function getServicesDiagnostics(){

  return Object.freeze({

    initialized:
    servicesRuntimeState
    .initialized,

    initializing:
    servicesRuntimeState
    .initializing,

    crashed:
    servicesRuntimeState
    .crashed,

    initializedAt:
    servicesRuntimeState
    .initializedAt,

    loadedServices:[

      ...servicesRuntimeState
      .loadedServices

    ],

    failedServices:[

      ...servicesRuntimeState
      .failedServices

    ],

    servicesCount:

      servicesRuntimeState
      .loadedServices
      .size,

    failedCount:

      servicesRuntimeState
      .failedServices
      .size,

    healthcheck:
    runServicesHealthcheck(),

    lastError:

      servicesRuntimeState
      .lastError

      ?

      String(
        servicesRuntimeState
        .lastError
      )

      :

      null

  });

}



// =====================================
// PUBLIC API
// =====================================

const ServicesRuntime =
Object.freeze({

  initialize:
  initializeServicesRuntime,

  reset:
  resetServicesRuntime,

  healthcheck:
  runServicesHealthcheck,

  get:
  getRegisteredService,

  diagnostics:
  getServicesDiagnostics

});
