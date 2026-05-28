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

    `[RIGOCore] ${message}`,

    error || ""

  );

}



function isObject(
  value
){

  return (

    typeof value ===
    "object" &&

    value !==
    null

  );

}



// =====================================
// VALIDATION
// =====================================

function validateCoreSystems(){

  try{

    if(
      typeof globalThis ===
      "undefined"
    ){

      return false;

    }

    const requiredSystems = [

      "RIGOContainerRuntime",
      "RIGOEventsRuntime",
      "RIGOStateRuntime",
      "RIGORuntimeRuntime",
      "RIGOLifecycleRuntime"

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
      typeof globalThis ===
      "undefined"
    ){

      return false;

    }

    if(
      globalThis.__RIGO_CORE_READY__ ===
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
      globalThis.RIGORuntimeRuntime;

    if(

      runtime &&

      typeof runtime.initialize ===
      "function"

    ){

      await runtime.initialize();

    }

    globalThis.__RIGO_CORE_READY__ =
      true;

    console.info(
      "[RIGOCore] Core systems initialized"
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

const RIGOCoreRuntime =
Object.freeze({



  initialize:
  initializeCoreSystems,



  validate:
  validateCoreSystems,



  // ===================================
  // SAFE ACCESSORS
  // ===================================

  get container(){

    return globalThis.RIGOContainerRuntime;

  },



  get events(){

    return globalThis.RIGOEventsRuntime;

  },



  get state(){

    return globalThis.RIGOStateRuntime;

  },



  get runtime(){

    return globalThis.RIGORuntimeRuntime;

  },



  get lifecycle(){

    return globalThis.RIGOLifecycleRuntime;

  },



  get health(){

    return globalThis.RIGOHealthRuntime;

  },



  get modules(){

    return globalThis.RIGOModulesRuntime;

  },



  get config(){

    return globalThis.RIGOConfigRuntime;

  },



  get constants(){

    return globalThis.RIGOConstantsRuntime;

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  validateCoreSystems,

  initializeCoreSystems,

  RIGOCoreRuntime

};

export default
RIGOCoreRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOCoreRuntime",

    {

      value:
      RIGOCoreRuntime,

      writable:false,

      configurable:false

    }

  );

}



// =====================================
// SAFE AUTO INITIALIZATION
// =====================================

if(
  typeof globalThis !==
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
