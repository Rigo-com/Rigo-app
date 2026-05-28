// =====================================
// RIGO AI
// ROOT SYSTEM INDEX
// ENTERPRISE APPLICATION ORCHESTRATOR
// FINAL HARDENED EDITION
// =====================================



// =====================================
// FOUNDATION IMPORTS
// =====================================

import "./shared/index.js";



// =====================================
// INFRASTRUCTURE IMPORTS
// =====================================

import "./security/index.js";
import "./storage/index.js";
import "./settings/index.js";



// =====================================
// SERVICE IMPORTS
// =====================================

import "./services/index.js";
import "./communication/index.js";
import "./bridges/index.js";



// =====================================
// MEMORY & SEARCH IMPORTS
// =====================================

import "./memory/index.js";
import "./search/index.js";



// =====================================
// APPLICATION IMPORTS
// =====================================

import "./chat/index.js";
import "./ui/index.js";
import "./voice/index.js";



// =====================================
// BOOTSTRAP IMPORTS
// =====================================

import "./bootstrap/index.js";



// =====================================
// ROOT STATE
// =====================================

const rootSystemState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  crashed:false,

  initializedAt:null,

  shutdownAt:null,

  startupPromise:null,

  lastError:null

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



function normalizeRootError(
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
    error || "UNKNOWN_ROOT_ERROR"
  );

}



// =====================================
// LOG HELPERS
// =====================================

function logRootSystemInfo(
  message,
  metadata = null
){

  try{

    if(
      typeof logInfo ===
      "function"
    ){

      logInfo(

        "[RIGO ROOT]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.info(

      "[RIGO ROOT]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



function logRootSystemError(
  message,
  metadata = null
){

  try{

    if(
      typeof logError ===
      "function"
    ){

      logError(

        "[RIGO ROOT]",

        {

          message,

          ...(metadata || {})

        }

      );

      return;

    }

    console.error(

      "[RIGO ROOT]",

      message,

      metadata || ""

    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// VALIDATION
// =====================================

function validateRootSystems(){

  if(
    typeof globalThis ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "RIGOSharedRuntime",
    "RIGOSecurityRuntime",
    "RIGOStorageRuntime",
    "RIGOSettingsRuntime",
    "RIGOServicesRuntime",
    "RIGOUIRuntime"

  ];

  const missingSystems =

    requiredSystems.filter((systemName) => {

      return (

        typeof globalThis[
          systemName
        ] ===

        "undefined"

      );

    });

  if(
    missingSystems.length > 0
  ){

    logRootSystemError(

      "ROOT VALIDATION FAILED",

      {

        missingSystems

      }

    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZE SYSTEM
// =====================================

async function initializeSystem(){

  if(
    rootSystemState
    .initialized
  ){

    return true;

  }

  if(
    rootSystemState
    .startupPromise
  ){

    return rootSystemState
    .startupPromise;

  }

  rootSystemState
  .startupPromise =

  (async() => {

    rootSystemState
    .initializing =
    true;

    try{

      if(
        !validateRootSystems()
      ){

        throw new Error(
          "ROOT_SYSTEM_VALIDATION_FAILED"
        );

      }



      // ===============================
      // SHARED
      // ===============================

      if(

        typeof RIGOSharedRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOSharedRuntime
          .initialize
        )

      ){

        await RIGOSharedRuntime
        .initialize();

      }



      // ===============================
      // SECURITY
      // ===============================

      if(

        typeof RIGOSecurityRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOSecurityRuntime
          .initialize
        )

      ){

        await RIGOSecurityRuntime
        .initialize();

      }



      // ===============================
      // STORAGE
      // ===============================

      if(

        typeof RIGOStorageRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOStorageRuntime
          .initialize
        )

      ){

        await RIGOStorageRuntime
        .initialize();

      }



      // ===============================
      // SETTINGS
      // ===============================

      if(

        typeof RIGOSettingsRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOSettingsRuntime
          .initialize
        )

      ){

        await RIGOSettingsRuntime
        .initialize();

      }



      // ===============================
      // SERVICES
      // ===============================

      if(

        typeof RIGOServicesRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOServicesRuntime
          .initialize
        )

      ){

        await RIGOServicesRuntime
        .initialize();

      }



      // ===============================
      // COMMUNICATION
      // ===============================

      if(
        typeof getCommunicationLayer ===
        "function"
      ){

        getCommunicationLayer();

      }



      // ===============================
      // BRIDGES
      // ===============================

      if(

        typeof AIRuntimeBridge !==
        "undefined"

        &&

        isFunction(
          AIRuntimeBridge
          .initialize
        )

      ){

        await AIRuntimeBridge
        .initialize();

      }



      // ===============================
      // MEMORY
      // ===============================

      if(

        typeof MemoryAPI !==
        "undefined"

        &&

        isFunction(
          MemoryAPI
          .initialize
        )

      ){

        await MemoryAPI
        .initialize();

      }



      // ===============================
      // SEARCH
      // ===============================

      if(

        typeof SearchAPI !==
        "undefined"

        &&

        isFunction(
          SearchAPI
          .rebuildIndexes
        )

      ){

        await SearchAPI
        .rebuildIndexes();

      }



      // ===============================
      // CHAT
      // ===============================

      if(

        typeof RIGOChatRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOChatRuntime
          .initialize
        )

      ){

        await RIGOChatRuntime
        .initialize();

      }



      // ===============================
      // UI
      // ===============================

      if(

        typeof RIGOUIRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOUIRuntime
          .initialize
        )

      ){

        await RIGOUIRuntime
        .initialize();

      }



      // ===============================
      // VOICE
      // ===============================

      if(

        typeof RIGOVoiceRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOVoiceRuntime
          .initialize
        )

      ){

        await RIGOVoiceRuntime
        .initialize();

      }



      // ===============================
      // BOOTSTRAP
      // ===============================

      if(

        typeof RIGOBootstrapRuntime !==
        "undefined"

        &&

        isFunction(
          RIGOBootstrapRuntime
          .initialize
        )

      ){

        await RIGOBootstrapRuntime
        .initialize();

      }

      rootSystemState
      .initialized =
      true;

      rootSystemState
      .crashed =
      false;

      rootSystemState
      .initializedAt =
      Date.now();

      logRootSystemInfo(
        "RIGO SYSTEM READY"
      );

      return true;

    }

    catch(error){

      rootSystemState
      .crashed =
      true;

      rootSystemState
      .lastError =
      normalizeRootError(
        error
      );

      logRootSystemError(

        "RIGO SYSTEM FAILED",

        {

          error:
          normalizeRootError(
            error
          )

        }

      );

      return false;

    }

    finally{

      rootSystemState
      .initializing =
      false;

      rootSystemState
      .startupPromise =
      null;

    }

  })();

  return rootSystemState
  .startupPromise;

}



// =====================================
// SHUTDOWN SYSTEM
// =====================================

async function shutdownSystem(){

  if(
    rootSystemState
    .shuttingDown
  ){

    return false;

  }

  rootSystemState
  .shuttingDown =
  true;

  try{

    if(

      typeof RIGOServicesRuntime !==
      "undefined"

      &&

      isFunction(
        RIGOServicesRuntime
        .shutdown
      )

    ){

      await RIGOServicesRuntime
      .shutdown();

    }

    rootSystemState
    .initialized =
    false;

    rootSystemState
    .shutdownAt =
    Date.now();

    logRootSystemInfo(
      "RIGO SYSTEM STOPPED"
    );

    return true;

  }

  catch(error){

    rootSystemState
    .lastError =
    normalizeRootError(
      error
    );

    logRootSystemError(

      "SYSTEM SHUTDOWN FAILED",

      {

        error:
        normalizeRootError(
          error
        )

      }

    );

    return false;

  }

  finally{

    rootSystemState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET SYSTEM
// =====================================

async function resetSystem(){

  await shutdownSystem();

  rootSystemState
  .crashed =
  false;

  rootSystemState
  .lastError =
  null;

  return initializeSystem();

}



// =====================================
// SYSTEM HEALTHCHECK
// =====================================

function runSystemHealthcheck(){

  return (

    rootSystemState
    .initialized ===
    true

    &&

    rootSystemState
    .crashed !==
    true

  );

}



// =====================================
// SYSTEM DIAGNOSTICS
// =====================================

function getSystemDiagnostics(){

  return Object.freeze({

    initialized:
    rootSystemState
    .initialized,

    initializing:
    rootSystemState
    .initializing,

    shuttingDown:
    rootSystemState
    .shuttingDown,

    crashed:
    rootSystemState
    .crashed,

    initializedAt:
    rootSystemState
    .initializedAt,

    shutdownAt:
    rootSystemState
    .shutdownAt,

    healthcheck:
    runSystemHealthcheck(),

    lastError:
    rootSystemState
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// ROOT API
// =====================================

const RIGORuntime =
Object.freeze({

  initialize:
  initializeSystem,



  shutdown:
  shutdownSystem,



  reset:
  resetSystem,



  diagnostics:
  getSystemDiagnostics,



  snapshot:
  getSystemDiagnostics,



  healthcheck:
  runSystemHealthcheck,



  validate:
  validateRootSystems,



  // ===================================
  // SYSTEMS
  // ===================================

  get shared(){

    return globalThis
    .RIGOSharedRuntime || null;

  },



  get security(){

    return globalThis
    .RIGOSecurityRuntime || null;

  },



  get storage(){

    return globalThis
    .RIGOStorageRuntime || null;

  },



  get settings(){

    return globalThis
    .RIGOSettingsRuntime || null;

  },



  get services(){

    return globalThis
    .RIGOServicesRuntime || null;

  },



  get communication(){

    return globalThis
    .RIGOCommunicationRuntime || null;

  },



  get memory(){

    return globalThis
    .MemoryAPI || null;

  },



  get search(){

    return globalThis
    .SearchAPI || null;

  },



  get chat(){

    return globalThis
    .RIGOChatRuntime || null;

  },



  get ui(){

    return globalThis
    .RIGOUIRuntime || null;

  },



  get voice(){

    return globalThis
    .RIGOVoiceRuntime || null;

  },



  get bootstrap(){

    return globalThis
    .RIGOBootstrapRuntime || null;

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGORuntime,

  initializeSystem,

  shutdownSystem,

  resetSystem,

  runSystemHealthcheck,

  getSystemDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGORuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGORuntime",

    {

      value:
      RIGORuntime,

      writable:false,

      configurable:false

    }

  );

}
