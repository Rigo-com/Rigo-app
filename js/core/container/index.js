// =====================================
// RIGO AI
// CONTAINER INDEX
// CLEAN CONTAINER COMPOSITION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// CONTAINER FILES
// =====================================

import "./container-constants.js";
import "./container-scopes.js";
import "./container-state.js";
import "./container-registry.js";
import "./container-resolution.js";
import "./container-health.js";
import "./container.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function emitContainerWarning(
  message,
  error = null
){

  console.warn(

    `[ContainerIndex] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateContainerLayer(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    const requiredSystems = [

      "RIGOContainer"

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

      emitContainerWarning(

        `Missing systems: ${missingSystems.join(", ")}`

      );

      return false;

    }

    return true;

  }

  catch(error){

    emitContainerWarning(
      "Validation failed",
      error
    );

    return false;

  }

}



// =====================================
// CONTAINER API
// =====================================

const RIGOContainerRuntime =
Object.freeze({



  validate:
  validateContainerLayer,



  // ===================================
  // SAFE ACCESSOR
  // ===================================

  get container(){

    return window.RIGOContainer;

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  validateContainerLayer,

  RIGOContainerRuntime

};

export default
RIGOContainerRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOContainerRuntime",

    {

      value:
      RIGOContainerRuntime,

      writable:
      false,

      configurable:
      false

    }

  );

}
