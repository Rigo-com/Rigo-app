// =====================================
// RIGO AI
// SHARED INDEX
// ENTERPRISE SHARED RUNTIME
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./utils.js";



// =====================================
// INTERNAL STATE
// =====================================

const sharedRuntimeState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  crashed:
  false,

  initializedAt:
  null,

  startupDuration:
  null,

  lastError:
  null,

  loadedModules:
  new Set(),

  failedModules:
  new Set(),

  startupPromise:
  null

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



function normalizeSharedError(
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



function safeFreeze(
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

  if(

    value instanceof Date ||

    value instanceof RegExp ||

    value instanceof Map ||

    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined"

      &&

      value instanceof HTMLElement
    )

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

      safeFreeze(

        nestedValue,
        visited

      );

    }

  });

  return value;

}



async function safelyExecuteSharedOperation(
  label,
  operation,
  fallback = null
){

  try{

    if(
      !isFunction(
        operation
      )
    ){

      return fallback;

    }

    return await operation();

  }

  catch(error){

    sharedRuntimeState
    .crashed =
    true;

    sharedRuntimeState
    .lastError =
    normalizeSharedError(
      error
    );

    logSharedError(

      `${label} FAILED`,

      {

        error:
        normalizeSharedError(
          error
        )

      }

    );

    return fallback;

  }

}



// =====================================
// SHARED MODULES
// =====================================

const SHARED_RUNTIME_MODULES =
safeFreeze([

  {

    name:
    "utils",

    required:
    true,

    async initialize(){

      return (

        typeof SharedUtils !==
        "undefined"

      );

    }

  }

]);



// =====================================
// LOG HELPERS
// =====================================

function logSharedInfo(
  message,
  metadata = null
){

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[RIGOSharedRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[RIGOSharedRuntime]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



function logSharedError(
  message,
  metadata = null
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(

        "[RIGOSharedRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[RIGOSharedRuntime]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// MODULE REGISTRY
// =====================================

const sharedModuleRegistry =
safeFreeze({

  utils(){

    return (

      typeof SharedUtils !==
      "undefined"

      ?

      SharedUtils

      :

      null

    );

  }

});



// =====================================
// MODULE REGISTRATION
// =====================================

function registerSharedModule(
  moduleName
){

  sharedRuntimeState
  .loadedModules
  .add(
    String(moduleName)
  );

  sharedRuntimeState
  .failedModules
  .delete(
    String(moduleName)
  );

  return true;

}



function registerFailedSharedModule(
  moduleName
){

  sharedRuntimeState
  .failedModules
  .add(
    String(moduleName)
  );

  return true;

}



// =====================================
// VALIDATION
// =====================================

function validateSharedModules(){

  return SHARED_RUNTIME_MODULES
  .every((module) => {

    return (

      module

      &&

      typeof module ===
      "object"

      &&

      typeof module.name ===
      "string"

      &&

      isFunction(
        module.initialize
      )

    );

  });

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeSharedRuntime(){

  if(
    sharedRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    sharedRuntimeState
    .startupPromise
  ){

    return sharedRuntimeState
    .startupPromise;

  }

  sharedRuntimeState
  .startupPromise =

  safelyExecuteSharedOperation(

    "SHARED_INITIALIZATION",

    async() => {

      if(
        sharedRuntimeState
        .initializing
      ){

        return false;

      }

      sharedRuntimeState
      .initializing =
      true;

      const startedAt =
      Date.now();

      const valid =
      validateSharedModules();

      if(!valid){

        throw new Error(
          "INVALID_SHARED_RUNTIME"
        );

      }

      for(
        const module of
        SHARED_RUNTIME_MODULES
      ){

        try{

          const initialized =
          await module
          .initialize();

          if(!initialized){

            registerFailedSharedModule(
              module.name
            );

            logSharedError(

              "MODULE_INIT_FAILED",

              {

                module:
                module.name

              }

            );

            if(
              module.required
            ){

              throw new Error(

                "REQUIRED_SHARED_MODULE_FAILED"

              );

            }

            continue;

          }

          registerSharedModule(
            module.name
          );

          logSharedInfo(

            "MODULE_READY",

            {

              module:
              module.name

            }

          );

        }

        catch(error){

          registerFailedSharedModule(
            module.name
          );

          logSharedError(

            "MODULE_CRASHED",

            {

              module:
              module.name,

              error:
              normalizeSharedError(
                error
              )

            }

          );

          if(
            module.required
          ){

            throw error;

          }

        }

      }

      sharedRuntimeState
      .initialized =
      true;

      sharedRuntimeState
      .initializedAt =
      Date.now();

      sharedRuntimeState
      .startupDuration =

        sharedRuntimeState
        .initializedAt -

        startedAt;

      logSharedInfo(
        "SHARED_RUNTIME_READY"
      );

      return true;

    },

    false

  );

  const currentPromise =
  sharedRuntimeState
  .startupPromise;

  try{

    return await currentPromise;

  }

  finally{

    sharedRuntimeState
    .initializing =
    false;

    if(

      sharedRuntimeState
      .startupPromise ===
      currentPromise

    ){

      sharedRuntimeState
      .startupPromise =
      null;

    }

  }

}



// =====================================
// RESET
// =====================================

async function resetSharedRuntime(){

  return safelyExecuteSharedOperation(

    "SHARED_RESET",

    async() => {

      sharedRuntimeState
      .loadedModules
      .clear();

      sharedRuntimeState
      .failedModules
      .clear();

      sharedRuntimeState
      .initialized =
      false;

      sharedRuntimeState
      .crashed =
      false;

      sharedRuntimeState
      .lastError =
      null;

      sharedRuntimeState
      .initializedAt =
      null;

      sharedRuntimeState
      .startupDuration =
      null;

      return await
      initializeSharedRuntime();

    },

    false

  );

}



// =====================================
// HEALTHCHECK
// =====================================

function runSharedHealthcheck(){

  return (

    sharedRuntimeState
    .initialized

    &&

    !sharedRuntimeState
    .crashed

    &&

    sharedRuntimeState
    .failedModules
    .size === 0

  );

}



// =====================================
// MODULE ACCESS
// =====================================

function getSharedModule(
  moduleName
){

  const normalizedName =

    String(moduleName || "")
    .trim()
    .toLowerCase();

  if(
    !normalizedName
  ){

    return null;

  }

  const resolver =
  sharedModuleRegistry[
    normalizedName
  ];

  if(
    !isFunction(
      resolver
    )
  ){

    return null;

  }

  return resolver();

}



// =====================================
// SNAPSHOT
// =====================================

function createSharedSnapshot(){

  return safeFreeze({

    initialized:
    sharedRuntimeState
    .initialized,

    initializing:
    sharedRuntimeState
    .initializing,

    crashed:
    sharedRuntimeState
    .crashed,

    initializedAt:
    sharedRuntimeState
    .initializedAt,

    startupDuration:
    sharedRuntimeState
    .startupDuration,

    loadedModules:[

      ...sharedRuntimeState
      .loadedModules

    ],

    failedModules:[

      ...sharedRuntimeState
      .failedModules

    ],

    modulesCount:

      sharedRuntimeState
      .loadedModules
      .size,

    failedCount:

      sharedRuntimeState
      .failedModules
      .size,

    healthcheck:
    runSharedHealthcheck(),

    lastError:

      sharedRuntimeState
      .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOSharedRuntime =
safeFreeze({

  initialize:
  initializeSharedRuntime,



  reset:
  resetSharedRuntime,



  healthcheck:
  runSharedHealthcheck,



  get:
  getSharedModule,



  diagnostics:
  createSharedSnapshot,



  snapshot:
  createSharedSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  SHARED_RUNTIME_MODULES,

  sharedRuntimeState,

  validateSharedModules,

  initializeSharedRuntime,

  resetSharedRuntime,

  runSharedHealthcheck,

  getSharedModule,

  createSharedSnapshot,

  RIGOSharedRuntime

};

export default
RIGOSharedRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOSharedRuntime",

    {

      value:
      RIGOSharedRuntime,

      writable:
      false,

      configurable:
      false

    }

  );

}
