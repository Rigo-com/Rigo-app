// =====================================
// RIGO AI
// BRIDGE INDEX
// CENTRAL EXPORTS
// =====================================



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

    &&

    typeof AIRuntimeBridge
    .reset ===
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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AIRuntimeBridge =
  AIRuntimeBridge;

  window.getAIRuntimeBridge =
  getAIRuntimeBridge;

  window.validateBridgeLayer =
  validateBridgeLayer;

}
