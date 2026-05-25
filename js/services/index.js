// =====================================
// RIGO AI
// SERVICES INDEX
// ENTERPRISE SERVICE RUNTIME
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// SERVICES CONFIG
// =====================================

const SERVICES_RUNTIME_CONFIG =
Object.freeze({

  INIT_TIMEOUT:
  15000,

  ENABLE_LOGGING:true,

  ENABLE_EVENTS:true,

  ENABLE_HEALTHCHECK:true

});



// =====================================
// SERVICES STATE
// =====================================

const servicesRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  crashed:false,

  initializedAt:null,

  shutdownAt:null,

  startupPromise:null,

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

    dependencies:[],

    async initialize(){

      return (

        typeof ServiceRegistry !==
        "undefined"

        &&

        typeof ServiceRegistry
        .initialize ===
        "function"

        &&

        await ServiceRegistry
        .initialize()

      );

    },

    async shutdown(){

      return true;

    }

  },



  {

    name:"api",

    required:true,

    dependencies:[
      "registry"
    ],

    async initialize(){

      return (

        typeof APIService !==
        "undefined"

        &&

        typeof APIService
        .initialize ===
        "function"

        &&

        await APIService
        .initialize()

      );

    },

    async shutdown(){

      if(

        typeof APIService !==
        "undefined"

        &&

        typeof APIService
        .cancelAll ===
        "function"

      ){

        APIService
        .cancelAll();

      }

      return true;

    }

  },



  {

    name:"ai",

    required:true,

    dependencies:[
      "registry",
      "api"
    ],

    async initialize(){

      return (

        typeof AIService !==
        "undefined"

        &&

        typeof AIService
        .initialize ===
        "function"

        &&

        await AIService
        .initialize()

      );

    },

    async shutdown(){

      if(

        typeof AIService !==
        "undefined"

        &&

        typeof AIService
        .abort ===
        "function"

      ){

        AIService
        .abort();

      }

      return true;

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

  if(

    SERVICES_RUNTIME_CONFIG
    .ENABLE_LOGGING !== true

  ){

    return false;

  }

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

      return true;

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

  return true;

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

      return true;

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

  return true;

}



// =====================================
// EVENTS
// =====================================

async function emitServicesEvent(
  eventName,
  payload = {}
){

  if(

    !SERVICES_RUNTIME_CONFIG
    .ENABLE_EVENTS

  ){

    return false;

  }

  try{

    if(
      typeof emitRuntimeEvent ===
      "function"
    ){

      await emitRuntimeEvent(
        eventName,
        payload
      );

    }

  }

  catch(error){

    logServicesError(

      "EVENT_EMIT_FAILED",

      {

        event:eventName,

        error:String(error)

      }

    );

  }

  return true;

}



// =====================================
// TIMEOUT WRAPPER
// =====================================

async function executeServiceWithTimeout(
  callback,
  timeout =
  SERVICES_RUNTIME_CONFIG
  .INIT_TIMEOUT
){

  return Promise.race([

    Promise.resolve()
    .then(callback),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(

          new Error(
            "SERVICE_TIMEOUT"
          )

        );

      },

      timeout);

    })

  ]);

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
// VALIDATE DEPENDENCIES
// =====================================

function validateServiceDependencies(
  service
){

  const dependencies =

    Array.isArray(
      service.dependencies
    )

    ?

    service.dependencies

    :

    [];

  return dependencies
  .every((dependency) => {

    return servicesRuntimeState
    .loadedServices
    .has(
      dependency
    );

  });

}



// =====================================
// REGISTER LOADED SERVICE
// =====================================

function registerLoadedService(
  serviceName
){

  const normalizedName =
  String(serviceName);

  servicesRuntimeState
  .loadedServices
  .add(
    normalizedName
  );

  servicesRuntimeState
  .failedServices
  .delete(
    normalizedName
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
    .startupPromise

  ){

    return servicesRuntimeState
    .startupPromise;

  }

  servicesRuntimeState
  .startupPromise =
  (async() => {

    servicesRuntimeState
    .initializing = true;

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

          const dependenciesValid =
          validateServiceDependencies(
            service
          );

          if(
            !dependenciesValid
          ){

            throw new Error(
              "DEPENDENCY_VALIDATION_FAILED"
            );

          }

          const initialized =
          await executeServiceWithTimeout(

            () => {

              return service
              .initialize();

            }

          );

          if(!initialized){

            registerFailedService(
              service.name
            );

            await emitServicesEvent(

              "service.failed",

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

          await emitServicesEvent(

            "service.loaded",

            {

              service:
              service.name

            }

          );

          logServicesInfo(

            "SERVICE_READY",

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

            "SERVICE_CRASHED",

            {

              service:
              service.name,

              error:
              String(error)

            }

          );

          await emitServicesEvent(

            "service.crashed",

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
      .initialized = true;

      servicesRuntimeState
      .initializedAt =
      Date.now();

      await emitServicesEvent(
        "services.ready"
      );

      logServicesInfo(
        "SERVICES_RUNTIME_READY"
      );

      return true;

    }

    catch(error){

      servicesRuntimeState
      .crashed = true;

      servicesRuntimeState
      .lastError = error;

      await emitServicesEvent(

        "services.failed",

        {

          error:
          String(error)

        }

      );

      logServicesError(

        "SERVICES_RUNTIME_FAILED",

        {

          error:
          String(error)

        }

      );

      return false;

    }

    finally{

      servicesRuntimeState
      .initializing = false;

    }

  })();

  try{

    return await servicesRuntimeState
    .startupPromise;

  }

  finally{

    servicesRuntimeState
    .startupPromise = null;

  }

}



// =====================================
// SHUTDOWN SERVICES
// =====================================

async function shutdownServicesRuntime(){

  if(
    servicesRuntimeState
    .shuttingDown
  ){

    return false;

  }

  servicesRuntimeState
  .shuttingDown = true;

  try{

    const reversedServices = [

      ...SERVICES_RUNTIME

    ]
    .reverse();

    for(
      const service of
      reversedServices
    ){

      try{

        if(

          typeof service
          .shutdown ===
          "function"

        ){

          await service
          .shutdown();

        }

      }

      catch(error){

        logServicesError(

          "SERVICE_SHUTDOWN_FAILED",

          {

            service:
            service.name,

            error:
            String(error)

          }

        );

      }

    }

    servicesRuntimeState
    .loadedServices
    .clear();

    servicesRuntimeState
    .failedServices
    .clear();

    servicesRuntimeState
    .initialized = false;

    servicesRuntimeState
    .shutdownAt =
    Date.now();

    await emitServicesEvent(
      "services.shutdown"
    );

    logServicesInfo(
      "SERVICES_RUNTIME_STOPPED"
    );

    return true;

  }

  finally{

    servicesRuntimeState
    .shuttingDown = false;

  }

}



// =====================================
// RESET SERVICES RUNTIME
// =====================================

async function resetServicesRuntime(){

  await shutdownServicesRuntime();

  servicesRuntimeState
  .crashed = false;

  servicesRuntimeState
  .lastError = null;

  return initializeServicesRuntime();

}



// =====================================
// SERVICES HEALTHCHECK
// =====================================

function runServicesHealthcheck(){

  if(

    !SERVICES_RUNTIME_CONFIG
    .ENABLE_HEALTHCHECK

  ){

    return true;

  }

  if(
    !servicesRuntimeState
    .initialized
  ){

    return false;

  }

  if(
    servicesRuntimeState
    .crashed
  ){

    return false;

  }

  const requiredServices =
  SERVICES_RUNTIME
  .filter((service) => {

    return service.required;
  });

  return requiredServices
  .every((service) => {

    return servicesRuntimeState
    .loadedServices
    .has(
      service.name
    );

  });

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

    shuttingDown:
    servicesRuntimeState
    .shuttingDown,

    crashed:
    servicesRuntimeState
    .crashed,

    initializedAt:
    servicesRuntimeState
    .initializedAt,

    shutdownAt:
    servicesRuntimeState
    .shutdownAt,

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

  shutdown:
  shutdownServicesRuntime,

  reset:
  resetServicesRuntime,

  healthcheck:
  runServicesHealthcheck,

  get:
  getRegisteredService,

  diagnostics:
  getServicesDiagnostics

});
