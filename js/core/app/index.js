// =====================================
// RIGO AI
// APP INDEX
// CLEAN APPLICATION COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// APPLICATION MODULES
// =====================================

import "./app-dom.js";
import "./app-recovery.js";
import "./app.js";
import "./application-runtime.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function isFunction(value){

  return (
    typeof value ===
    "function"
  );

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
      "RIGOApplication",
      "ApplicationRuntime"

    ];

    const missingSystems =

      requiredSystems.filter((systemName) => {

        return (
          typeof window[systemName] ===
          "undefined"
        );

      });

    if(
      missingSystems.length > 0
    ){

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
      typeof window ===
      "undefined"
    ){

      return false;

    }

    if(
      window.__RIGO_APP_LAYER_READY__ ===
      true
    ){

      return true;

    }

    if(
      !validateAppLayer()
    ){

      return false;

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

const RIGOAppRuntime =
Object.freeze({

  initialize:
  initializeAppLayer,

  validate:
  validateAppLayer,



  // ===================================
  // SAFE LAZY ACCESSORS
  // ===================================

  get dom(){

    return window.AppDOM;

  },



  get recovery(){

    return window.AppRecovery;

  },



  get runtime(){

    return window.ApplicationRuntime;

  },



  get application(){

    return window.RIGOApplication;

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  validateAppLayer,

  initializeAppLayer,

  RIGOAppRuntime

};

export default
RIGOAppRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOAppRuntime",

    {

      value:
      RIGOAppRuntime,

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
