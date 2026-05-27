// =====================================
// RIGO AI
// CORE INDEX
// CENTRAL CORE ORCHESTRATION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// FOUNDATIONAL SYSTEMS
// =====================================

import "./constants/index.js";
import "./config/index.js";



// =====================================
// CONTAINER SYSTEMS
// =====================================

import "./container/index.js";
import "./dependencies/index.js";



// =====================================
// EVENT + STATE SYSTEMS
// =====================================

import "./events/index.js";
import "./state/index.js";



// =====================================
// MODULE MANAGEMENT
// =====================================

import "./modules/index.js";



// =====================================
// RUNTIME SYSTEMS
// =====================================

import "./runtime/index.js";
import "./lifecycle/index.js";
import "./health/index.js";



// =====================================
// APPLICATION LAYER
// =====================================

import "./app/index.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function emitCoreIndexWarning(
  message,
  error = null
){

  console.warn(

    `[CoreIndex] ${message}`,

    error || ""

  );

}



function isObject(value){

  return (
    typeof value === "object" &&
    value !== null
  );

}



// =====================================
// VALIDATION
// =====================================

function validateCoreSystems(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    const requiredSystems = [

      "RIGOContainer",
      "RIGOEventBus",
      "RIGOStateManager",
      "RIGORuntime",
      "RIGOLifecycle"

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

      emitCoreIndexWarning(

        `Missing systems: ${missingSystems.join(", ")}`

      );

      return false;

    }

    return true;

  }

  catch(error){

    emitCoreIndexWarning(
      "Validation failed",
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZATION
// =====================================

async function initializeCoreSystems(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    if(
      window.__RIGO_CORE_READY__ ===
      true
    ){

      return true;

    }

    if(
      !validateCoreSystems()
    ){

      return false;

    }

    const runtime =
      window.RIGORuntime;

    if(
      runtime &&
      typeof runtime.initialize ===
      "function"
    ){

      await runtime.initialize();

    }

    window.__RIGO_CORE_READY__ =
      true;

    console.info(
      "[CoreIndex] Core systems initialized"
    );

    return true;

  }

  catch(error){

    emitCoreIndexWarning(
      "Initialization failed",
      error
    );

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const CoreIndex =
Object.freeze({

  initialize:
  initializeCoreSystems,

  validate:
  validateCoreSystems,



  // ===================================
  // SAFE ACCESSORS
  // ===================================

  get container(){

    return window.RIGOContainer;

  },



  get events(){

    return window.RIGOEventBus;

  },



  get state(){

    return window.RIGOStateManager;

  },



  get runtime(){

    return window.RIGORuntime;

  },



  get lifecycle(){

    return window.RIGOLifecycle;

  }

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

    "CoreIndex",

    {

      value:
      CoreIndex,

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

      await initializeCoreSystems();

    }

    catch(error){

      emitCoreIndexWarning(
        "Queued initialization failed",
        error
      );

    }

  });

}
