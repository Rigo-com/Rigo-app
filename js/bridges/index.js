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

const RIGOBridgesRuntime =
Object.freeze({

  runtime:
  AIRuntimeBridge,

  getBridge:
  getAIRuntimeBridge,

  validate:
  validateBridgeLayer

});



// =====================================
// EXPORTS
// =====================================

export {

  validateBridgeLayer,

  getAIRuntimeBridge,

  RIGOBridgesRuntime

};

export default
RIGOBridgesRuntime;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOBridgesRuntime",

    {

      value:
      RIGOBridgesRuntime,

      writable:
      false,

      configurable:
      false

    }

  );
}

