// =====================================
// RIGO AI
// RUNTIME HELPERS
// =====================================



// =====================================
// FALLBACKS
// =====================================

const INTERNAL_RUNTIME_STATES =
typeof RUNTIME_STATES !==
"undefined"

  ? RUNTIME_STATES

  : Object.freeze({

      IDLE:"idle",
      BOOTING:"booting",
      RUNNING:"running",
      RECOVERING:"recovering",
      SHUTDOWN:"shutdown"

    });



const MAX_RUNTIME_ERRORS =

typeof RUNTIME_MANAGER_CONFIG !==
"undefined"

&&

RUNTIME_MANAGER_CONFIG
?.MAX_RUNTIME_ERRORS

  ?

  RUNTIME_MANAGER_CONFIG
  .MAX_RUNTIME_ERRORS

  :

  20;



// =====================================
// DEEP FREEZE
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
    INTERNAL_RUNTIME_STATES
  )
  .includes(
    runtimeState
  );

}



// =====================================
// SET STATE
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

  return RuntimeState
  ?.update?.(

    "runtimeState",
    runtimeState

  );

}



// =====================================
// ADD ERROR
// =====================================

function addRuntimeError(
  error
){

  if(!error){

    return false;

  }

  const snapshot =
  RuntimeState
  ?.get?.();

  const currentErrors =

    Array.isArray(
      snapshot?.runtimeErrors
    )

    ?

    snapshot.runtimeErrors

    :

    [];

  const nextErrors = [

    ...currentErrors,

    {

      error:
      String(error),

      timestamp:
      Date.now()

    }

  ];

  while(

    nextErrors.length >
    MAX_RUNTIME_ERRORS

  ){

    nextErrors.shift();

  }

  RuntimeState
  ?.update?.(

    "runtimeErrors",
    nextErrors

  );

  RuntimeState
  ?.incrementMetric?.(
    "failures"
  );

  return true;

}



// =====================================
// CLEAR ERRORS
// =====================================

function clearRuntimeErrors(){

  return RuntimeState
  ?.update?.(

    "runtimeErrors",
    []

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function getRuntimeDiagnostics(){

  const snapshot =
  RuntimeState
  ?.get?.();

  return freezeRuntimeObject({

    runtimeState:
    snapshot?.runtimeState,

    initialized:
    snapshot?.initialized,

    booting:
    snapshot?.booting,

    recovering:
    snapshot?.recovering,

    shuttingDown:
    snapshot?.shuttingDown,

    bootRetries:
    snapshot?.bootRetries,

    runtimeErrors:[

      ...(snapshot
      ?.runtimeErrors || [])

    ],

    diagnostics:{

      ...(snapshot
      ?.diagnostics || {})

    },

    timestamp:
    Date.now()

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

}
