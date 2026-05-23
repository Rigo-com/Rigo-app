// =====================================
// RIGO AI
// CORE INDEX
// =====================================



// =====================================
// CORE API
// =====================================

const CoreAPI =
Object.freeze({

  // CONFIG
  ConfigRuntime,



  // CONSTANTS
  ConstantsAPI,



  // STATE
  AppState,
  StateManager,



  // EVENTS
  SystemEvents,
  AppEvents

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
