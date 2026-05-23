// =====================================
// RIGO AI
// RUNTIME STATE
// =====================================



// =====================================
// RUNTIME STATE
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

  startupQueue:[],

  runtimeErrors:[],

  bootRetries:0,

  diagnostics:{

    boots:0,

    recoveries:0,

    shutdowns:0,

    failures:0,

    synchronizedSystems:0

  },

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

    startupQueue:[

      ...runtimeManagerState
      .startupQueue

    ],

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
    .lastShutdownAt

  });

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
  .startupQueue =
  [];

  runtimeManagerState
  .runtimeErrors =
  [];

  runtimeManagerState
  .bootRetries =
  0;

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
  resetRuntimeState

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

  window.runtimeManagerState =
  runtimeManagerState;

}
