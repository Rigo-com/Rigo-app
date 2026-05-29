// =====================================
// RIGO AI
// RUNTIME HELPERS
// FINAL UNIFIED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  RUNTIME_STATES
}
from "../constants/runtime-states.js";

import RIGORuntimeState
from "./runtime-state.js";



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
    RUNTIME_STATES
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

  return RIGORuntimeState
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

  RIGORuntimeState
  ?.pushError?.(
    error
  );

  RIGORuntimeState
  ?.incrementMetric?.(
    "failures"
  );

  return true;

}



// =====================================
// CLEAR ERRORS
// =====================================

function clearRuntimeErrors(){

  return RIGORuntimeState
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
  RIGORuntimeState
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

const RIGORuntimeHelpers =
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
  typeof globalThis !==
  "undefined" &&

  !globalThis
  .RIGORuntimeHelpers
){

  globalThis
  .RIGORuntimeHelpers =

  RIGORuntimeHelpers;

}



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGORuntimeHelpers;
