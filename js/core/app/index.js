// =====================================
// RIGO AI
// APP INDEX
// CLEAN APPLICATION COMPOSITION LAYER
// =====================================



// =====================================
// APPLICATION LAYER
// =====================================

import "./app-dom.js";
import "./app-recovery.js";
import "./application-runtime.js";
import "./app.js";



// =====================================
// HELPERS
// =====================================

function isFunction(value){

  return typeof value ===
  "function";

}



function emitAppIndexWarning(
  message,
  error = null
){

  console.warn(
    `[AppIndex] ${message}`,
    error || ""
  );

}



// =====================================
// VALIDATION
// =====================================

function validateAppLayer(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    const requiredSystems = [

      "AppDOM",
      "AppRecovery",
      "ApplicationRuntime",
      "RIGOApplication"

    ];

    const missingSystems =

      requiredSystems.filter((systemName) => {

        return (
          typeof window[systemName] ===
          "undefined"
        );

      });

    if(missingSystems.length > 0){

      emitAppIndexWarning(

        `Missing systems: ${missingSystems.join(", ")}`

      );

      return false;

    }

    return true;

  }

  catch(error){

    emitAppIndexWarning(
      "Validation failed",
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeAppLayer(){

  try{

    if(
      !validateAppLayer()
    ){

      return false;

    }

    if(
      window.__RIGO_APP_LAYER_READY__
    ){

      return true;

    }

    const runtime =
      window.ApplicationRuntime;

    if(
      runtime &&
      isFunction(
        runtime.initialize
      )
    ){

      await runtime.initialize();

    }

    window.__RIGO_APP_LAYER_READY__ =
      true;

    console.info(
      "[AppIndex] Application layer initialized"
    );

    return true;

  }

  catch(error){

    emitAppIndexWarning(
      "Initialization failed",
      error
    );

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppIndex =
Object.freeze({

  initialize:
  initializeAppLayer,

  validate:
  validateAppLayer,

  dom:
  window.AppDOM,

  recovery:
  window.AppRecovery,

  runtime:
  window.ApplicationRuntime,

  application:
  window.RIGOApplication

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

    "AppIndex",

    {

      value:
      AppIndex,

      writable:
      false,

      configurable:
      false

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

      await initializeAppLayer();

    }

    catch(error){

      emitAppIndexWarning(
        "Queued initialization failed",
        error
      );

    }

  });

}
