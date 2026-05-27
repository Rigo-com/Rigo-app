// =====================================
// RIGO AI
// AUTH INDEX
// SAFE AUTH COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// AUTH FILES
// =====================================

import "./auth-runtime.js";



// =====================================
// INTERNAL STATE
// =====================================

const authIndexState =
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



function normalizeAuthError(
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



function emitAuthWarning(
  message,
  error = null
){

  console.warn(

    `[AuthIndex] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateAuthSystems(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  return (

    typeof window
    .RIGOAuthRuntime !==

    "undefined"

  );

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAuth(){

  if(
    authIndexState
    .initialized
  ){

    return true;

  }

  if(
    authIndexState
    .initializing
  ){

    return false;

  }

  authIndexState
  .initializing =
  true;

  authIndexState
  .lastError =
  null;

  try{

    if(
      !validateAuthSystems()
    ){

      throw new Error(
        "AUTH SYSTEM VALIDATION FAILED"
      );

    }

    const runtime =
    window.RIGOAuthRuntime;

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
          "AUTH RUNTIME INITIALIZATION FAILED"
        );

      }

    }

    authIndexState
    .initialized =
    true;

    authIndexState
    .lastInitializedAt =
    Date.now();

    window.__RIGO_AUTH_READY__ =
    true;

    console.info(
      "[AuthIndex] Auth initialized"
    );

    return true;

  }

  catch(error){

    authIndexState
    .lastError =
    normalizeAuthError(
      error
    );

    emitAuthWarning(
      "Initialization failed",
      error
    );

    return false;

  }

  finally{

    authIndexState
    .initializing =
    false;

  }

}



// =====================================
// RESET
// =====================================

async function resetAuth(){

  try{

    const runtime =
    window.RIGOAuthRuntime;

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

    emitAuthWarning(
      "Reset failed",
      error
    );

    return false;

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAuth(){

  try{

    const runtime =
    window.RIGOAuthRuntime;

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

    emitAuthWarning(
      "Shutdown failed",
      error
    );

    return false;

  }

}



// =====================================
// HEALTH
// =====================================

function getAuthHealth(){

  const runtime =
  window.RIGOAuthRuntime;

  return Object.freeze({

    initialized:
    authIndexState
    .initialized,

    valid:
    validateAuthSystems(),

    runtime:

      runtime &&

      isFunction(
        runtime.status
      )

      ?

      runtime.status()

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function createAuthSnapshot(){

  const runtime =
  window.RIGOAuthRuntime;

  return Object.freeze({

    initialized:
    authIndexState
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
    authIndexState
    .lastInitializedAt,

    lastError:
    authIndexState
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOAuthRuntime =
Object.freeze({

  runtime:
  window.RIGOAuthRuntime,

  initialize:
  initializeAuth,

  reset:
  resetAuth,

  shutdown:
  shutdownAuth,

  health:
  getAuthHealth,

  snapshot:
  createAuthSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  authIndexState,

  initializeAuth,

  resetAuth,

  shutdownAuth,

  getAuthHealth,

  createAuthSnapshot,

  RIGOAuthRuntime

};

export default
RIGOAuthRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOAuthRuntime",

    {

      value:
      RIGOAuthRuntime,

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

      await initializeAuth();

    }

    catch(error){

      emitAuthWarning(

        "Queued initialization failed",

        error

      );

    }

  });

}
