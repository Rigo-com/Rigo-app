// =====================================
// RIGO AI
// VOICE INDEX
// ENTERPRISE VOICE RUNTIME
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./voice.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



function normalizeVoiceError(
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
    error || "UNKNOWN_VOICE_ERROR"
  );

}



function emitVoiceWarning(
  message,
  error = null
){

  console.warn(

    `[RIGOVoiceRuntime] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateVoiceLayer(){

  if(
    typeof globalThis ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof VoiceRuntime ===
    "undefined"
  ){

    emitVoiceWarning(
      "Missing VoiceRuntime"
    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeVoiceSystem(){

  try{

    if(
      !validateVoiceLayer()
    ){

      return false;

    }

    if(
      !isFunction(
        VoiceRuntime
        .initialize
      )
    ){

      return false;

    }

    return await VoiceRuntime
    .initialize();

  }

  catch(error){

    emitVoiceWarning(

      "Initialization failed",

      normalizeVoiceError(
        error
      )

    );

    return false;

  }

}



// =====================================
// RESET
// =====================================

async function resetVoiceSystem(){

  try{

    if(

      typeof VoiceRuntime ===
      "undefined"

      ||

      !isFunction(
        VoiceRuntime
        .reset
      )

    ){

      return false;

    }

    return await VoiceRuntime
    .reset();

  }

  catch(error){

    emitVoiceWarning(

      "Reset failed",

      normalizeVoiceError(
        error
      )

    );

    return false;

  }

}



// =====================================
// DESTROY
// =====================================

async function destroyVoiceSystem(){

  try{

    if(

      typeof VoiceRuntime ===
      "undefined"

      ||

      !isFunction(
        VoiceRuntime
        .destroy
      )

    ){

      return false;

    }

    return await VoiceRuntime
    .destroy();

  }

  catch(error){

    emitVoiceWarning(

      "Destroy failed",

      normalizeVoiceError(
        error
      )

    );

    return false;

  }

}



// =====================================
// READY
// =====================================

function isVoiceReady(){

  return (

    typeof VoiceRuntime !==
    "undefined"

    &&

    VoiceRuntime !==
    null

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function getVoiceDiagnostics(){

  return Object.freeze({

    runtime:

      typeof VoiceRuntime !==
      "undefined"

      &&

      isFunction(
        VoiceRuntime
        .diagnostics
      )

      ?

      VoiceRuntime
      .diagnostics()

      :

      null,



    healthy:
    validateVoiceLayer(),



    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const RIGOVoiceRuntime =
Object.freeze({

  initialize:
  initializeVoiceSystem,



  reset:
  resetVoiceSystem,



  destroy:
  destroyVoiceSystem,



  isReady:
  isVoiceReady,



  diagnostics:
  getVoiceDiagnostics,



  snapshot:
  getVoiceDiagnostics,



  validate:
  validateVoiceLayer,



  // ===================================
  // MODULE
  // ===================================

  get runtime(){

    return (

      typeof VoiceRuntime !==
      "undefined"

      ?

      VoiceRuntime

      :

      null

    );

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGOVoiceRuntime,

  initializeVoiceSystem,

  resetVoiceSystem,

  destroyVoiceSystem,

  isVoiceReady,

  getVoiceDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGOVoiceRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOVoiceRuntime",

    {

      value:
      RIGOVoiceRuntime,

      writable:false,

      configurable:false

    }

  );

}
