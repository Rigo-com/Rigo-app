// =====================================
// RIGO AI
// BRIDGES INDEX
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./ai-runtime-bridge.js";



// =====================================
// VALIDATION
// =====================================

function validateBridgeLayer(){

  return (

    typeof AIRuntimeBridge !==
    "undefined"

    &&

    typeof AIRuntimeBridge
    .initialize ===
    "function"

    &&

    typeof AIRuntimeBridge
    .synchronize ===
    "function"

    &&

    typeof AIRuntimeBridge
    .recover ===
    "function"

    &&

    typeof AIRuntimeBridge
    .diagnostics ===
    "function"

  );

}



// =====================================
// SAFE ACCESS
// =====================================

function getAIRuntimeBridge(){

  if(
    !validateBridgeLayer()
  ){

    return null;

  }

  return AIRuntimeBridge;

}



// =====================================
// PUBLIC API
// =====================================

const Bridges =
Object.freeze({

  runtime:
  AIRuntimeBridge,

  getBridge:
  getAIRuntimeBridge,

  validate:
  validateBridgeLayer

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "Bridges",

    {

      value:
      Bridges,

      writable:
      false,

      configurable:
      false

    }

  );



  Object.defineProperty(

    window,

    "AIRuntimeBridge",

    {

      value:
      AIRuntimeBridge,

      writable:
      false,

      configurable:
      false

    }

  );



  Object.defineProperty(

    window,

    "getAIRuntimeBridge",

    {

      value:
      getAIRuntimeBridge,

      writable:
      false,

      configurable:
      false

    }

  );



  Object.defineProperty(

    window,

    "validateBridgeLayer",

    {

      value:
      validateBridgeLayer,

      writable:
      false,

      configurable:
      false

    }

  );

}
