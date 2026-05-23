// =====================================
// RIGO AI
// RUNTIME HELPERS
// =====================================



// =====================================
// FREEZE
// =====================================

function freezeRuntimeObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeRuntimeObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// VALIDATE STATE
// =====================================

function isValidRuntimeState(
  runtimeState
){

  return Object.values(
    RUNTIME_STATES
  )
  .includes(
    runtimeState
  );

}



// =====================================
// SET RUNTIME STATE
// =====================================

function setRuntimeState(
  runtimeState
){

  if(

    !isValidRuntimeState(
      runtimeState
    )

  ){

    return false;

  }

  runtimeManagerState
  .runtimeState =
  runtimeState;

  return true;

}



// =====================================
// ADD RUNTIME ERROR
// =====================================

function addRuntimeError(
  error
){

  runtimeManagerState
  .runtimeErrors
  .push({

    error:
    String(error),

    timestamp:
    Date.now()

  });

  if(

    runtimeManagerState
    .runtimeErrors
    .length >

    RUNTIME_MANAGER_CONFIG
    .MAX_RUNTIME_ERRORS

  ){

    runtimeManagerState
    .runtimeErrors
    .shift();

  }

  runtimeManagerState
  .diagnostics
  .failures++;

  return true;

}



// =====================================
// CLEAR ERRORS
// =====================================

function clearRuntimeErrors(){

  runtimeManagerState
  .runtimeErrors =
  [];

  return true;

}



// =====================================
// RUNTIME DIAGNOSTICS
// =====================================

function getRuntimeDiagnostics(){

  return freezeRuntimeObject({

    runtimeState:

      runtimeManagerState
      .runtimeState,

    initialized:

      runtimeManagerState
      .initialized,

    booting:

      runtimeManagerState
      .booting,

    recovering:

      runtimeManagerState
      .recovering,

    shuttingDown:

      runtimeManagerState
      .shuttingDown,

    bootRetries:

      runtimeManagerState
      .bootRetries,

    runtimeErrors:[

      ...runtimeManagerState
      .runtimeErrors

    ],

    diagnostics:{

      ...runtimeManagerState
      .diagnostics

    }

  });

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeHelpers =
Object.freeze({

  freeze:
  freezeRuntimeObject,

  validateState:
  isValidRuntimeState,

  setState:
  setRuntimeState,

  addError:
  addRuntimeError,

  clearErrors:
  clearRuntimeErrors,

  diagnostics:
  getRuntimeDiagnostics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RuntimeHelpers =
  RuntimeHelpers;

  window.setRuntimeState =
  setRuntimeState;

  window.addRuntimeError =
  addRuntimeError;

}
