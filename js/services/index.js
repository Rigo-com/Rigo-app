// =====================================
// RIGO AI
// SERVICES INDEX
// ENTERPRISE SERVICE RUNTIME
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./service-registry.js";
import "./api-service.js";
import "./ai-service.js";



// =====================================
// REQUIRED SERVICES
// =====================================

const REQUIRED_SERVICES =
Object.freeze([

  "ServiceRegistry",
  "APIService",
  "AIService"

]);



// =====================================
// SERVICES CONFIG
// =====================================

const SERVICES_RUNTIME_CONFIG =
Object.freeze({

  INIT_TIMEOUT:
  15000,

  ENABLE_LOGGING:
  true,

  ENABLE_EVENTS:
  true,

  ENABLE_HEALTHCHECK:
  true

});



// =====================================
// SERVICES STATE
// =====================================

const servicesRuntimeState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  shuttingDown:
  false,

  crashed:
  false,

  initializedAt:
  null,

  shutdownAt:
  null,

  startupPromise:
  null,

  lastError:
  null,

  loadedServices:
  new Set(),

  failedServices:
  new Set()

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



function validateServicesAvailability(){

  if(
    typeof globalThis ===
    "undefined"
  ){

    return false;

  }

  return REQUIRED_SERVICES
  .every((serviceName) => {

    return (

      typeof globalThis[
        serviceName
      ] !==
      "undefined"

    );

  });

}



function normalizeServiceError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN_ERROR"
  );

}



function logServicesInfo(
  message,
  metadata = null
){

  if(

    SERVICES_RUNTIME_CONFIG
    .ENABLE_LOGGING !==
    true

  ){

    return false;

  }

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[RIGOServicesRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return true;

    }

    console.info(

      "[RIGOServicesRuntime]",

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

        "[RIGOServicesRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return true;

    }

    console.error(

      "[RIGOServicesRuntime]",

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

    SERVICES_RUNTIME_CONFIG
    .ENABLE_EVENTS !==
    true

  ){

    return false;

  }

  try{

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        eventName,

        {

          source:
          "services-runtime",

          timestamp:
          Date.now(),

          ...payload

        }

      );

    }

  }

  catch(error){

    logServicesError(

      "EVENT_EMIT_FAILED",

      {

        event:
        eventName,

        error:
        normalizeServiceError(
          error
        )

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
// SERVICE DEFINITIONS
// =====================================

const SERVICES_RUNTIME =
Object.freeze([

  {

    name:
    "registry",

    required:
    true,

    dependencies:
    [],

    async initialize(){

      return (

        typeof ServiceRegistry !==
        "undefined"

        &&

        isFunction(
          ServiceRegistry
          .initialize
        )

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

    name:
    "api",

    required:
    true,

    dependencies:[
      "registry"
    ],

    async initialize(){

      return (

        typeof APIService !==
        "undefined"

        &&

        isFunction(
          APIService
          .initialize
        )

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

        isFunction(
          APIService
          .cancelAll
        )

      ){

        APIService
        .cancelAll();

      }

      return true;

    }

  },



  {

    name:
    "ai",

    required:
    true,

    dependencies:[
      "registry",
      "api"
    ],

    async initialize(){

      return (

        typeof AIService !==
        "undefined"

        &&

        isFunction(
          AIService
          .initialize
        )

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

        isFunction(
          AIService
          .abort
        )

      ){

        AIService
        .abort();

      }

      return true;

    }

  }

]);



// =====================================
// VALIDATION
// =====================================

function validateServicesRuntime(){

  if(
    !validateServicesAvailability()
  ){

    return false;

  }

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

      isFunction(
        service.initialize
      )

    );

  });

}



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
// SERVICE REGISTRATION
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
// INITIALIZATION
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
              normalizeServiceError(
                error
              )

            }

          );

          await emitServicesEvent(

            "service.crashed",

            {

              service:
              service.name,

              error:
              normalizeServiceError(
                error
              )

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
      .crashed =
      false;

      servicesRuntimeState
      .initialized =
      true;

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
      .crashed =
      true;

      servicesRuntimeState
      .lastError =
      normalizeServiceError(
        error
      );

      await emitServicesEvent(

        "services.failed",

        {

          error:
          normalizeServiceError(
            error
          )

        }

      );

      logServicesError(

        "SERVICES_RUNTIME_FAILED",

        {

          error:
          normalizeServiceError(
            error
          )

        }

      );

      return false;

    }

    finally{

      servicesRuntimeState
      .initializing =
      false;

    }

  })();

  const currentPromise =
  servicesRuntimeState
  .startupPromise;

  try{

    return await currentPromise;

  }

  finally{

    if(

      servicesRuntimeState
      .startupPromise ===
      currentPromise

    ){

      servicesRuntimeState
      .startupPromise =
      null;

    }

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownServicesRuntime(){

  if(
    servicesRuntimeState
    .shuttingDown
  ){

    return false;

  }

  servicesRuntimeState
  .shuttingDown =
  true;

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

          isFunction(
            service.shutdown
          )

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
            normalizeServiceError(
              error
            )

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
    .initialized =
    false;

    servicesRuntimeState
    .lastError =
    null;

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
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET
// =====================================

async function resetServicesRuntime(){

  await shutdownServicesRuntime();

  servicesRuntimeState
  .crashed =
  false;

  servicesRuntimeState
  .lastError =
  null;

  return initializeServicesRuntime();

}



// =====================================
// HEALTHCHECK
// =====================================

function runServicesHealthcheck(){

  if(

    SERVICES_RUNTIME_CONFIG
    .ENABLE_HEALTHCHECK !==
    true

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
// SERVICE ACCESS
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

    !isFunction(
      ServiceRegistry.get
    )

  ){

    return null;

  }

  return ServiceRegistry
  .get(
    serviceName
  );

}



// =====================================
// DIAGNOSTICS
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

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOServicesRuntime =
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
  getServicesDiagnostics,

  snapshot:
  getServicesDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  REQUIRED_SERVICES,

  SERVICES_RUNTIME_CONFIG,

  servicesRuntimeState,

  SERVICES_RUNTIME,

  validateServicesAvailability,

  validateServicesRuntime,

  validateServiceDependencies,

  registerLoadedService,

  registerFailedService,

  initializeServicesRuntime,

  shutdownServicesRuntime,

  resetServicesRuntime,

  runServicesHealthcheck,

  getRegisteredService,

  getServicesDiagnostics,

  RIGOServicesRuntime

};

export default
RIGOServicesRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOServicesRuntime",

    {

      value:
      RIGOServicesRuntime,

      writable:
      false,

      configurable:
      false,

      enumerable:
      false

    }

  );

}
