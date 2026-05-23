// =====================================
// RIGO AI
// CORE STATE INDEX
// =====================================



const StateAPI =
Object.freeze({

  app:
  appState,

  manager:
  StateManager,

  get:
  getAppState,

  update:
  updateAppState,

  reset:
  resetAppState,

  phase:
  updateAppPhase,

  diagnostics:
  getStateDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.StateAPI =
  StateAPI;

}
