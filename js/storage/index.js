// =====================================
// RIGO AI
// STORAGE INDEX
// ENTERPRISE STORAGE ORCHESTRATOR
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./storage-config.js";
import "./storage-utils.js";
import "./storage-validators.js";
import "./storage-state.js";

import {

  initializeStorageRuntime,
  destroyStorageRuntime,
  isStorageReady,
  getStorageDiagnostics

} from "./storage-runtime.js";

import {

  saveChats,
  loadChats,
  saveCurrentChat,
  getChatById

} from "./storage-chat.js";

import {

  saveMemory,
  loadMemory

} from "./storage-memory.js";

import {

  processStorageQueue

} from "./storage-queue.js";

import {

  getStorageStateSnapshot

} from "./storage-engine.js";



// =====================================
// STORAGE RUNTIME STATE
// =====================================

const storageRuntimeIndexState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  crashed:
  false,

  initializedAt:
  null,

  startupPromise:
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

function normalizeStorageError(
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
    error || "UNKNOWN_STORAGE_ERROR"
  );

}



function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



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

        typeof getStorageStateSnapshot ===
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

        "[RIGOStorageRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[RIGOStorageRuntime]",

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

        "[RIGOStorageRuntime]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[RIGOStorageRuntime]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// MODULE REGISTRATION
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
// VALIDATION
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
// INITIALIZATION
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
    .startupPromise
  ){

    return storageRuntimeIndexState
    .startupPromise;

  }

  storageRuntimeIndexState
  .startupPromise =

  (async() => {

    if(
      storageRuntimeIndexState
      .initializing
    ){

      return false;

    }

    storageRuntimeIndexState
    .initializing =
    true;

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
          module.validate();

          if(!validated){

            registerFailedStorageModule(
              module.name
            );

            logStorageIndexError(

              "STORAGE_MODULE_FAILED",

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

            "STORAGE_MODULE_READY",

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

            "STORAGE_MODULE_CRASHED",

            {

              module:
              module.name,

              error:
              normalizeStorageError(
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

      storageRuntimeIndexState
      .crashed =
      false;

      storageRuntimeIndexState
      .lastError =
      null;

      logStorageIndexInfo(
        "STORAGE_INDEX_READY"
      );

      return true;

    }

    catch(error){

      storageRuntimeIndexState
      .crashed =
      true;

      storageRuntimeIndexState
      .lastError =
      normalizeStorageError(
        error
      );

      logStorageIndexError(

        "STORAGE_INDEX_FAILED",

        {

          error:
          normalizeStorageError(
            error
          )

        }

      );

      return false;

    }

    finally{

      storageRuntimeIndexState
      .initializing =
      false;

    }

  })();

  const currentPromise =
  storageRuntimeIndexState
  .startupPromise;

  try{

    return await currentPromise;

  }

  finally{

    if(

      storageRuntimeIndexState
      .startupPromise ===
      currentPromise

    ){

      storageRuntimeIndexState
      .startupPromise =
      null;

    }

  }

}



// =====================================
// RESET
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

  storageRuntimeIndexState
  .initializedAt =
  null;

  try{

    if(
      isFunction(
        destroyStorageRuntime
      )
    ){

      await destroyStorageRuntime();

    }

  }

  catch(error){

    logStorageIndexError(

      "STORAGE_DESTROY_FAILED",

      {

        error:
        normalizeStorageError(
          error
        )

      }

    );

  }

  return initializeStorageIndex();

}



// =====================================
// HEALTHCHECK
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
    isFunction(
      isStorageReady
    )
  ){

    return isStorageReady();

  }

  return true;

}



// =====================================
// DIAGNOSTICS
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

      isFunction(
        getStorageDiagnostics
      )

      ?

      getStorageDiagnostics()

      :

      null,

    lastError:
    storageRuntimeIndexState
    .lastError

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOStorageRuntime =
Object.freeze({

  initialize:
  initializeStorageIndex,



  reset:
  resetStorageIndex,



  destroy:

    isFunction(
      destroyStorageRuntime
    )

    ?

    destroyStorageRuntime

    :

    async() => false,



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



  snapshot:
  getFullStorageDiagnostics,



  healthcheck:
  runStorageHealthcheck,



  isReady:

    isFunction(
      isStorageReady
    )

    ?

    isStorageReady

    :

    () => false,



  getState:

    isFunction(
      getStorageStateSnapshot
    )

    ?

    getStorageStateSnapshot

    :

    () => null

});



// =====================================
// EXPORTS
// =====================================

export {

  STORAGE_RUNTIME_MODULES,

  storageRuntimeIndexState,

  validateStorageModules,

  initializeStorageIndex,

  resetStorageIndex,

  runStorageHealthcheck,

  getFullStorageDiagnostics,

  RIGOStorageRuntime

};

export default
RIGOStorageRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOStorageRuntime",

    {

      value:
      RIGOStorageRuntime,

      writable:false,

      configurable:false

    }

  );

}
