// =====================================
// RIGO AI
// RUNTIME STATE
// FINAL UNIFIED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  RUNTIME_STATES
}
from "../constants/runtime-states.js";



// =====================================
// DEFAULT DIAGNOSTICS
// =====================================

function createDefaultDiagnostics(){

  return {

    boots:0,

    recoveries:0,

    shutdowns:0,

    failures:0,

    synchronizedSystems:0

  };

}



// =====================================
// INTERNAL STATE
// =====================================

const runtimeState =
Object.seal({

  initialized:false,

  booting:false,

  shuttingDown:false,

  recovering:false,

  runtimeState:
  RUNTIME_STATES
  .IDLE,

  runtimeErrors:[],

  bootRetries:0,

  diagnostics:
  createDefaultDiagnostics(),

  startedAt:null,

  bootCompletedAt:null,

  lastRecoveryAt:null,

  lastShutdownAt:null

});



// =====================================
// SNAPSHOT
// =====================================

function createRuntimeStateSnapshot(){

  return Object.freeze({

    initialized:
    runtimeState
    .initialized,

    booting:
    runtimeState
    .booting,

    shuttingDown:
    runtimeState
    .shuttingDown,

    recovering:
    runtimeState
    .recovering,

    runtimeState:
    runtimeState
    .runtimeState,

    runtimeErrors:[

      ...runtimeState
      .runtimeErrors

    ],

    bootRetries:
    runtimeState
    .bootRetries,

    diagnostics:{

      ...runtimeState
      .diagnostics

    },

    startedAt:
    runtimeState
    .startedAt,

    bootCompletedAt:
    runtimeState
    .bootCompletedAt,

    lastRecoveryAt:
    runtimeState
    .lastRecoveryAt,

    lastShutdownAt:
    runtimeState
    .lastShutdownAt,

    timestamp:
    Date.now()

  });

}



// =====================================
// STATE HELPERS
// =====================================

function updateRuntimeState(

  key,
  value

){

  if(
    !(key in runtimeState)
  ){

    return false;

  }

  runtimeState[key] =
  value;

  return true;

}



function pushRuntimeError(
  error
){

  if(!error){

    return false;

  }

  if(

    runtimeState
    .runtimeErrors
    .length >= 50

  ){

    runtimeState
    .runtimeErrors
    .shift();

  }

  runtimeState
  .runtimeErrors
  .push(
    String(error)
  );

  return true;

}



function incrementRuntimeMetric(
  metric
){

  if(

    typeof runtimeState
    .diagnostics[metric] !==
    "number"

  ){

    return false;

  }

  runtimeState
  .diagnostics[metric]++;

  return true;

}



// =====================================
// RESET
// =====================================

function resetRuntimeState(){

  runtimeState
  .initialized =
  false;

  runtimeState
  .booting =
  false;

  runtimeState
  .shuttingDown =
  false;

  runtimeState
  .recovering =
  false;

  runtimeState
  .runtimeState =
  RUNTIME_STATES
  .IDLE;

  runtimeState
  .runtimeErrors =
  [];

  runtimeState
  .bootRetries =
  0;

  runtimeState
  .diagnostics =
  createDefaultDiagnostics();

  runtimeState
  .startedAt =
  null;

  runtimeState
  .bootCompletedAt =
  null;

  runtimeState
  .lastRecoveryAt =
  null;

  runtimeState
  .lastShutdownAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RIGORuntimeState =
Object.freeze({

  get:
  createRuntimeStateSnapshot,

  reset:
  resetRuntimeState,

  update:
  updateRuntimeState,

  pushError:
  pushRuntimeError,

  incrementMetric:
  incrementRuntimeMetric

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined" &&

  !globalThis
  .RIGORuntimeState
){

  globalThis
  .RIGORuntimeState =

  RIGORuntimeState;

}



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGORuntimeState;
