// =====================================
// RIGO AI
// SHARED INDEX
// ENTERPRISE SHARED RUNTIME
// FINAL STABLE EDITION
// =====================================



// =====================================
// SHARED STATE
// =====================================

const sharedRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  crashed:false,

  initializedAt:null,

  lastError:null,

  loadedModules:
  new Set(),

  failedModules:
  new Set()

});



// =====================================
// SHARED MODULES
// =====================================

const SHARED_RUNTIME_MODULES =
Object.freeze([

  {

    name:"utils",

    required:true,

    initialize(){

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

  try{

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

    logSharedInfo(
      "SHARED RUNTIME READY"
    );

    return true;

  }

  catch(error){

    sharedRuntimeState
    .crashed =
    true;

    sharedRuntimeState
    .lastError =
    error;

    logSharedError(

      "SHARED RUNTIME FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    sharedRuntimeState
    .initializing =
    false;

  }

}



// =====================================
// RESET SHARED RUNTIME
// =====================================

async function resetSharedRuntime(){

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

  return initializeSharedRuntime();

}



// =====================================
// SHARED HEALTHCHECK
// =====================================

function runSharedHealthcheck(){

  if(
    !sharedRuntimeState
    .initialized
  ){

    return false;

  }

  return (

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

  switch(
    String(moduleName)
    .toLowerCase()
  ){

    case "utils":

      return (

        typeof SharedUtils !==
        "undefined"

        ?

        SharedUtils

        :

        null

      );

    default:

      return null;

  }

}



// =====================================
// SHARED DIAGNOSTICS
// =====================================

function getSharedDiagnostics(){

  return Object.freeze({

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

      null

  });

}



// =====================================
// PUBLIC API
// =====================================

const SharedRuntime =
Object.freeze({

  initialize:
  initializeSharedRuntime,

  reset:
  resetSharedRuntime,

  healthcheck:
  runSharedHealthcheck,

  get:
  getSharedModule,

  diagnostics:
  getSharedDiagnostics

});
