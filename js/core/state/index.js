// =====================================
// RIGO AI
// STATE INDEX
// =====================================



// =====================================
// SAFE ACCESS
// =====================================

function resolveStateModule(
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
// STATE API
// =====================================

const StateAPI =
Object.freeze({



  // ===================================
  // APP STATE
  // ===================================

  app:
  resolveStateModule(
    typeof AppState !==
    "undefined"

    ?

    AppState

    :

    undefined
  ),



  // ===================================
  // STATE MANAGER
  // ===================================

  manager:
  resolveStateModule(
    typeof StateManager !==
    "undefined"

    ?

    StateManager

    :

    undefined
  ),



  // ===================================
  // SHORTCUTS
  // ===================================

  get:
  typeof getAppState ===
  "function"

  ?

  getAppState

  :

  null,



  update:
  typeof updateAppPhase ===
  "function"

  ?

  updateAppPhase

  :

  null,



  reset:
  typeof resetAppState ===
  "function"

  ?

  resetAppState

  :

  null,



  diagnostics:
  typeof getStateDiagnostics ===
  "function"

  ?

  getStateDiagnostics

  :

  null

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.StateAPI =
  StateAPI;

}
