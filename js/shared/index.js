// =====================================
// RIGO AI
// SHARED INDEX
// ENTERPRISE SHARED RUNTIME
// FINAL STABLE EDITION
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
    value instanceof HTMLElement

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

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
      !isFunction(operation)
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
    error;

    logSharedError(

      `${label} FAILED`,

      {

        error:
        String(error)

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

        "[SHARED]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[SHARED]",

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

        "[SHARED]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[SHARED]",

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
// REGISTER MODULE
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



// =====================================
// REGISTER FAILED MODULE
// =====================================

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
// VALIDATE MODULES
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

      typeof module
      .initialize ===
      "function"

    );

  });

}



// =====================================
// INITIALIZE SHARED RUNTIME
// =====================================

async function initializeSharedRuntime(){

  return safelyExecuteSharedOperation(

    "SHARED INITIALIZATION",

    async() => {

      if(
        sharedRuntimeState
        .initialized
      ){

        return true;

      }

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

              "MODULE INIT FAILED",

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

            "MODULE READY",

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

            "MODULE CRASHED",

            {

              module:
              module.name,

              error:
              String(error)

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
        "SHARED RUNTIME READY"
      );

      return true;

    },

    false

  )

  .finally(() => {

    sharedRuntimeState
    .initializing =
    false;

  });

}



// =====================================
// RESET SHARED RUNTIME
// =====================================

async function resetSharedRuntime(){

  return safelyExecuteSharedOperation(

    "SHARED RESET",

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
// SHARED HEALTHCHECK
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
// GET SHARED MODULE
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
    typeof resolver !==
    "function"
  ){

    return null;

  }

  return resolver();

}



// =====================================
// SHARED SNAPSHOT
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
      .lastError

      ?

      String(
        sharedRuntimeState
        .lastError
      )

      :

      null,

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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

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


// =====================================
// EXPORTS
// =====================================

export {

  RIGOSharedRuntime

};

export default
RIGOSharedRuntime;
