// =====================================
// RIGO AI
// RUNTIME STATES
// =====================================



// =====================================
// RUNTIME STATES
// =====================================

const RUNTIME_STATES =
Object.freeze(
Object.seal({

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

}));



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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "RUNTIME_STATES",

    {

      value:
      RUNTIME_STATES,

      writable:false,

      configurable:false

    }

  );

  Object.defineProperty(

    window,

    "isValidRuntimeState",

    {

      value:
      isValidRuntimeState,

      writable:false,

      configurable:false

    }

  );

}
