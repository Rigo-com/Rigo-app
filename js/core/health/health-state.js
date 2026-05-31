// =====================================
// RIGO AI
// HEALTH STATE
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  HEALTH_STATES

}
from "./health-config.js";



// =====================================
// INTERNAL STATE
// =====================================

const healthState =
Object.seal({

  status:
  HEALTH_STATES
  .UNKNOWN,

  score:
  100,

  warnings:
  [],

  errors:
  [],

  history:
  [],

  lastCheckAt:
  null

});



// =====================================
// STATUS
// =====================================

function setHealthStatus(
  status
){

  healthState.status =
  status;

  return true;

}



function setHealthScore(
  score
){

  healthState.score =
  Number(score) || 0;

  return true;

}



// =====================================
// WARNINGS
// =====================================

function addWarning(
  warning
){

  healthState
  .warnings
  .push(

    String(
      warning
    )

  );

  return true;

}



function clearWarnings(){

  healthState
  .warnings
  .length = 0;

  return true;

}



// =====================================
// ERRORS
// =====================================

function addError(
  error
){

  healthState
  .errors
  .push(

    String(
      error
    )

  );

  return true;

}



function clearErrors(){

  healthState
  .errors
  .length = 0;

  return true;

}



// =====================================
// HISTORY
// =====================================

function addHistoryEntry(
  entry
){

  healthState
  .history
  .push({

    ...entry,

    timestamp:
    Date.now()

  });

  return true;

}



// =====================================
// UPDATE
// =====================================

function updateHealthState(
  updates = {}
){

  Object.assign(

    healthState,

    updates

  );

  return true;

}



// =====================================
// RESET
// =====================================

function resetHealthState(){

  healthState.status =
  HEALTH_STATES
  .UNKNOWN;

  healthState.score =
  100;

  healthState.warnings =
  [];

  healthState.errors =
  [];

  healthState.history =
  [];

  healthState.lastCheckAt =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthSnapshot(){

  return Object.freeze({

    status:
    healthState.status,

    score:
    healthState.score,

    warnings:[

      ...healthState
      .warnings

    ],

    errors:[

      ...healthState
      .errors

    ],

    history:[

      ...healthState
      .history

    ],

    lastCheckAt:
    healthState
    .lastCheckAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const HealthState =
Object.freeze({

  update:
  updateHealthState,

  setStatus:
  setHealthStatus,

  setScore:
  setHealthScore,

  addWarning,

  clearWarnings,

  addError,

  clearErrors,

  addHistoryEntry,

  reset:
  resetHealthState,

  snapshot:
  createHealthSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  healthState,

  updateHealthState,

  setHealthStatus,

  setHealthScore,

  addWarning,

  clearWarnings,

  addError,

  clearErrors,

  addHistoryEntry,

  resetHealthState,

  createHealthSnapshot,

  HealthState

};

export default
HealthState;
