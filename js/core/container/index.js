// =====================================
// RIGO AI
// CONTAINER INDEX
// CLEAN CONTAINER COMPOSITION LAYER
// =====================================



// =====================================
// CONTAINER FILES
// =====================================

import "./container-constants.js";
import "./container-health.js";
import "./container-registry.js";
import "./container-resolution.js";
import "./container-scopes.js";
import "./container-state.js";
import "./container.js";



// =====================================
// HELPERS
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

      "Container"

    ];

    const missingSystems =

      requiredSystems.filter((systemName) => {

        return (
          typeof window[systemName] ===
          "undefined"
        );

      });

    if(missingSystems.length > 0){

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

const ContainerAPI =
Object.freeze({

  container:
  window.Container,

  validate:
  validateContainerLayer

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

    "ContainerAPI",

    {

      value:
      ContainerAPI,

      writable:
      false,

      configurable:
      false

    }

  );

}
