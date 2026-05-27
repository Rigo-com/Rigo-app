// =====================================
// RIGO AI
// API INDEX
// SAFE API COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// API FILES
// =====================================

import "./api-runtime.js";



// =====================================
// INTERNAL STATE
// =====================================

const apiIndexState =
Object.seal({

  initialized:false,

  initializing:false,

  lastInitializedAt:null,

  lastError:null

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}



function normalizeAPIError(
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
    error || "UNKNOWN ERROR"
  );

}



function emitAPIWarning(
  message,
  error = null
){

  console.warn(

    `[APIIndex] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateAPISystems(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  return (

    typeof window
    .RIGOAPIRuntime !==

    "undefined"

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAPI(){

  if(
    apiIndexState
    .initialized
  ){

    return true;

  }

  if(
    apiIndexState
    .initializing
  ){

    return false;

  }

  apiIndexState
  .initializing =
  true;

  apiIndexState
  .lastError =
  null;

  try{

    if(
      !validateAPISystems()
    ){

      throw new Error(
        "API SYSTEM VALIDATION FAILED"
      );

    }

    const runtime =
    window.RIGOAPIRuntime;

    if(

      runtime &&

      isFunction(
        runtime.initialize
      )

    ){

      const initialized =
      await runtime.initialize();

      if(
        initialized === false
      ){

        throw new Error(
          "API RUNTIME INITIALIZATION FAILED"
        );

      }

    }

    apiIndexState
    .initialized =
    true;

    apiIndexState
    .lastInitializedAt =
    Date.now();

    window.__RIGO_API_READY__ =
    true;

    console.info(
      "[APIIndex] API initialized"
    );

    return true;

  }

  catch(error){

    apiIndexState
    .lastError =
    normalizeAPIError(
      error
    );

    emitAPIWarning(
      "Initialization failed",
      error
    );

    return false;

  }

  finally{

    apiIndexState
    .initializing =
    false;

  }

}



// =====================================
// RESET
// =====================================

async function resetAPI(){

  try{

    const runtime =
    window.RIGOAPIRuntime;

    if(

      runtime &&

      isFunction(
        runtime.reset
      )

    ){

      await runtime.reset();

    }

    return true;

  }

  catch(error){

    emitAPIWarning(
      "Reset failed",
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAPI(){

  try{

    const runtime =
    window.RIGOAPIRuntime;

    if(

      runtime &&

      isFunction(
        runtime.shutdown
      )

    ){

      await runtime.shutdown();

    }

    return true;

  }

  catch(error){

    emitAPIWarning(
      "Shutdown failed",
      error
    );

    return false;

  }

}



// =====================================
// HEALTH
// =====================================

function getAPIHealth(){

  const runtime =
  window.RIGOAPIRuntime;

  return Object.freeze({

    initialized:
    apiIndexState
    .initialized,

    valid:
    validateAPISystems(),

    runtime:

      runtime &&

      isFunction(
        runtime.health
      )

      ?

      runtime.health()

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createAPISnapshot(){

  const runtime =
  window.RIGOAPIRuntime;

  return Object.freeze({

    initialized:
    apiIndexState
    .initialized,

    snapshot:

      runtime &&

      isFunction(
        runtime.snapshot
      )

      ?

      runtime.snapshot()

      :

      null,

    lastInitializedAt:
    apiIndexState
    .lastInitializedAt,

    lastError:
    apiIndexState
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOAPI =
Object.freeze({

  runtime:
  window.RIGOAPIRuntime,

  initialize:
  initializeAPI,

  reset:
  resetAPI,

  shutdown:
  shutdownAPI,

  health:
  getAPIHealth,

  snapshot:
  createAPISnapshot

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

    "RIGOAPI",

    {

      value:
      RIGOAPI,

      writable:false,

      configurable:false

    }

  );

}



// =====================================
// SAFE AUTO INITIALIZATION
// =====================================

if(
  typeof window !==
  "undefined"
){

  queueMicrotask(async() => {

    try{

      await initializeAPI();

    }

    catch(error){

      emitAPIWarning(

        "Queued initialization failed",

        error

      );

    }

  });

}
