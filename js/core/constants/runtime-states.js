// =====================================
// RIGO AI
// RUNTIME STATES
// =====================================



// =====================================
// RUNTIME STATES
// =====================================

const RUNTIME_STATES =
Object.freeze({

  IDLE:
  "idle",

  BOOTING:
  "booting",

  READY:
  "ready",

  RECOVERING:
  "recovering",

  SHUTTING_DOWN:
  "shutting_down",

  FAILED:
  "failed"

});



// =====================================
// VALIDATION
// =====================================

function isValidRuntimeState(
  state
){

  return Object.values(
    RUNTIME_STATES
  )
  .includes(
    String(state)
  );

}



// =====================================
// EXPORTS
// =====================================

export {

  RUNTIME_STATES,

  isValidRuntimeState

};
