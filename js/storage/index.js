// =====================================
// RIGO AI
// STORAGE INDEX
// ENTERPRISE STORAGE ORCHESTRATOR
// FINAL STABLE EDITION
// =====================================



// =====================================
// STORAGE RUNTIME STATE
// =====================================

const storageRuntimeIndexState =
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
// STORAGE MODULES
// =====================================

const STORAGE_RUNTIME_MODULES =
Object.freeze([

  {

    name:"config",

    required:true,

    validate(){

      return (

        typeof STORAGE_CONFIG !==
        "undefined"

      );

    }

  },



  {

    name:"utils",

    required:true,

    validate(){

      return (

        typeof deepClone ===
        "function"

      );

    }

  },



  {

    name:"validators",

    required:true,

    validate(){

      return (

        typeof validateStorageKey ===
        "function"

      );

    }

  },



  {

    name:"state",

    required:true,

    validate(){

      return (

        typeof storageState !==
        "undefined"

      );

    }

  },



  {

    name:"engine",

    required:true,

    validate(){

      return (

        typeof initializeStorageEngine ===
        "function"

      );

    }

  },



  {

    name:"queue",

    required:true,

    validate(){

      return (

        typeof processStorageQueue ===
        "function"

      );

    }

  },



  {

    name:"chat",

    required:true,

    validate(){

      return (

        typeof saveChats ===
        "function"

        &&

        typeof loadChats ===
        "function"

      );

    }

  },



  {

    name:"memory",

    required:true,

    validate(){

      return (

        typeof saveMemory ===
        "function"

        &&

        typeof loadMemory ===
        "function"

      );

    }

  },



  {

    name:"runtime",

    required:true,

    validate(){

      return (

        typeof initializeStorageRuntime ===
        "function"

      );

    }

  }

]);



// =====================================
// LOG HELPERS
// =====================================

function logStorageIndexInfo(
  message,
  metadata = null
){

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[STORAGE]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[STORAGE]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



function logStorageIndexError(
  message,
  metadata = null
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(

        "[STORAGE]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[STORAGE]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// REGISTER LOADED MODULE
// =====================================

function registerLoadedStorageModule(
  moduleName
){

  storageRuntimeIndexState
  .loadedModules
  .add(
    String(moduleName)
  );

  storageRuntimeIndexState
  .failedModules
  .delete(
    String(moduleName)
  );

  return true;

}



// =====================================
// REGISTER FAILED MODULE
// =====================================

function registerFailedStorageModule(
  moduleName
){

  storageRuntimeIndexState
  .failedModules
  .add(
    String(moduleName)
  );

  return true;

}



// =====================================
// VALIDATE STORAGE MODULES
// =====================================

function validateStorageModules(){

  return STORAGE_RUNTIME_MODULES
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

      typeof module.validate ===
      "function"

    );

  });

}



// =====================================
// INITIALIZE STORAGE INDEX
// =====================================

async function initializeStorageIndex(){

  if(
    storageRuntimeIndexState
    .initialized
  ){

    return true;

  }

  if(
    storageRuntimeIndexState
    .initializing
  ){

    return false;

  }

  storageRuntimeIndexState
  .initializing = true;

  try{

    const valid =
    validateStorageModules();

    if(!valid){

      throw new Error(
        "INVALID_STORAGE_MODULES"
      );

    }

    for(
      const module
      of STORAGE_RUNTIME_MODULES
    ){

      try{

        const validated =
        await module
        .validate();

        if(!validated){

          registerFailedStorageModule(
            module.name
          );

          logStorageIndexError(

            "STORAGE MODULE FAILED",

            {

              module:
              module.name

            }

          );

          if(
            module.required
          ){

            throw new Error(

              "REQUIRED_STORAGE_MODULE_FAILED"

            );

          }

          continue;

        }

        registerLoadedStorageModule(
          module.name
        );

        logStorageIndexInfo(

          "STORAGE MODULE READY",

          {

            module:
            module.name

          }

        );

      }

      catch(error){

        registerFailedStorageModule(
          module.name
        );

        logStorageIndexError(

          "STORAGE MODULE CRASHED",

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

    const runtimeInitialized =
    await initializeStorageRuntime();

    if(!runtimeInitialized){

      throw new Error(
        "STORAGE_RUNTIME_INIT_FAILED"
      );

    }

    storageRuntimeIndexState
    .initialized =
    true;

    storageRuntimeIndexState
    .initializedAt =
    Date.now();

    logStorageIndexInfo(
      "STORAGE INDEX READY"
    );

    return true;

  }

  catch(error){

    storageRuntimeIndexState
    .crashed =
    true;

    storageRuntimeIndexState
    .lastError =
    error;

    logStorageIndexError(

      "STORAGE INDEX FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    storageRuntimeIndexState
    .initializing =
    false;

  }

}



// =====================================
// RESET STORAGE INDEX
// =====================================

async function resetStorageIndex(){

  storageRuntimeIndexState
  .loadedModules
  .clear();

  storageRuntimeIndexState
  .failedModules
  .clear();

  storageRuntimeIndexState
  .initialized =
  false;

  storageRuntimeIndexState
  .crashed =
  false;

  storageRuntimeIndexState
  .lastError =
  null;

  try{

    if(
      typeof destroyStorageRuntime ===
      "function"
    ){

      await destroyStorageRuntime();

    }

  }

  catch(error){

    logStorageIndexError(

      "STORAGE DESTROY FAILED",

      {

        error:
        String(error)

      }

    );

  }

  return initializeStorageIndex();

}



// =====================================
// STORAGE HEALTHCHECK
// =====================================

function runStorageHealthcheck(){

  if(
    !storageRuntimeIndexState
    .initialized
  ){

    return false;

  }

  if(

    storageRuntimeIndexState
    .failedModules
    .size > 0

  ){

    return false;

  }

  if(
    typeof isStorageReady ===
    "function"
  ){

    return isStorageReady();

  }

  return true;

}



// =====================================
// STORAGE DIAGNOSTICS
// =====================================

function getFullStorageDiagnostics(){

  return Object.freeze({

    initialized:
    storageRuntimeIndexState
    .initialized,

    initializing:
    storageRuntimeIndexState
    .initializing,

    crashed:
    storageRuntimeIndexState
    .crashed,

    initializedAt:
    storageRuntimeIndexState
    .initializedAt,

    loadedModules:[

      ...storageRuntimeIndexState
      .loadedModules

    ],

    failedModules:[

      ...storageRuntimeIndexState
      .failedModules

    ],

    modulesCount:

      storageRuntimeIndexState
      .loadedModules
      .size,

    failedCount:

      storageRuntimeIndexState
      .failedModules
      .size,

    healthcheck:
    runStorageHealthcheck(),

    runtime:

      typeof getStorageDiagnostics ===
      "function"

      ?

      getStorageDiagnostics()

      :

      null,

    lastError:

      storageRuntimeIndexState
      .lastError

      ?

      String(
        storageRuntimeIndexState
        .lastError
      )

      :

      null

  });

}



// =====================================
// STORAGE PUBLIC API
// =====================================

const StorageRuntime =
Object.freeze({

  initialize:
  initializeStorageIndex,

  reset:
  resetStorageIndex,

  destroy:
  destroyStorageRuntime,



  // ===================================
  // CHAT
  // ===================================

  saveChats,
  loadChats,

  saveCurrentChat,
  getChatById,



  // ===================================
  // MEMORY
  // ===================================

  saveMemory,
  loadMemory,



  // ===================================
  // STATUS
  // ===================================

  diagnostics:
  getFullStorageDiagnostics,

  healthcheck:
  runStorageHealthcheck,

  isReady:
  isStorageReady,

  getState:
  getStorageStateSnapshot

});
