// =====================================
// RIGO AI
// CORE INDEX
// =====================================



// =====================================
// SAFE ACCESS
// =====================================

function resolveCoreModule(
  moduleReference
){

  return (

    typeof moduleReference !==
    "undefined"

    ?

    moduleReference

    :

    null

  );

}



// =====================================
// CORE API
// =====================================

const CoreAPI =
Object.freeze({



  // ===================================
  // CONFIG
  // ===================================

  config:
  resolveCoreModule(
    typeof ConfigRuntime !==
    "undefined"

    ?

    ConfigRuntime

    :

    undefined
  ),



  // ===================================
  // CONSTANTS
  // ===================================

  constants:
  resolveCoreModule(
    typeof ConstantsAPI !==
    "undefined"

    ?

    ConstantsAPI

    :

    undefined
  ),



  // ===================================
  // STATE
  // ===================================

  appState:
  resolveCoreModule(
    typeof AppState !==
    "undefined"

    ?

    AppState

    :

    undefined
  ),



  stateManager:
  resolveCoreModule(
    typeof StateManager !==
    "undefined"

    ?

    StateManager

    :

    undefined
  ),



  // ===================================
  // EVENTS
  // ===================================

  systemEvents:
  resolveCoreModule(
    typeof SystemEvents !==
    "undefined"

    ?

    SystemEvents

    :

    undefined
  ),



  appEvents:
  resolveCoreModule(
    typeof AppEvents !==
    "undefined"

    ?

    AppEvents

    :

    undefined
  ),



  // ===================================
  // RUNTIME
  // ===================================

  runtime:
  resolveCoreModule(
    typeof RuntimeAPI !==
    "undefined"

    ?

    RuntimeAPI

    :

    undefined
  )

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.CoreAPI =
  CoreAPI;

}
