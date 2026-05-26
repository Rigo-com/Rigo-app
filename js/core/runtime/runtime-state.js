// =====================================
// RIGO AI
// RUNTIME STATE
// =====================================



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

const runtimeManagerState =
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
    runtimeManagerState
    .initialized,

    booting:
    runtimeManagerState
    .booting,

    shuttingDown:
    runtimeManagerState
    .shuttingDown,

    recovering:
    runtimeManagerState
    .recovering,

    runtimeState:
    runtimeManagerState
    .runtimeState,

    runtimeErrors:[

      ...runtimeManagerState
      .runtimeErrors

    ],

    bootRetries:
    runtimeManagerState
    .bootRetries,

    diagnostics:{

      ...runtimeManagerState
      .diagnostics

    },

    startedAt:
    runtimeManagerState
    .startedAt,

    bootCompletedAt:
    runtimeManagerState
    .bootCompletedAt,

    lastRecoveryAt:
    runtimeManagerState
    .lastRecoveryAt,

    lastShutdownAt:
    runtimeManagerState
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
    !(key in runtimeManagerState)
  ){

    return false;

  }

  runtimeManagerState[key] =
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

    runtimeManagerState
    .runtimeErrors
    .length >= 50

  ){

    runtimeManagerState
    .runtimeErrors
    .shift();

  }

  runtimeManagerState
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

    typeof runtimeManagerState
    .diagnostics[metric] !==
    "number"

  ){

    return false;

  }

  runtimeManagerState
  .diagnostics[metric]++;

  return true;

}



// =====================================
// RESET
// =====================================

function resetRuntimeState(){

  runtimeManagerState
  .initialized =
  false;

  runtimeManagerState
  .booting =
  false;

  runtimeManagerState
  .shuttingDown =
  false;

  runtimeManagerState
  .recovering =
  false;

  runtimeManagerState
  .runtimeState =
  RUNTIME_STATES
  .IDLE;

  runtimeManagerState
  .runtimeErrors =
  [];

  runtimeManagerState
  .bootRetries =
  0;

  runtimeManagerState
  .diagnostics =
  createDefaultDiagnostics();

  runtimeManagerState
  .startedAt =
  null;

  runtimeManagerState
  .bootCompletedAt =
  null;

  runtimeManagerState
  .lastRecoveryAt =
  null;

  runtimeManagerState
  .lastShutdownAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeState =
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
  typeof window !==
  "undefined"
){

  window.RuntimeState =
  RuntimeState;

}
