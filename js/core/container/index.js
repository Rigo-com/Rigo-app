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
import "./container-state.js";
import "./container-registry.js";
import "./container-scopes.js";
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
      typeof globalThis ===
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

          typeof globalThis[
            systemName
          ] ===

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
// EXPORTS
// =====================================

export {

  validateContainerLayer

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default
validateContainerLayer;
