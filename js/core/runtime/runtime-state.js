// =====================================
// RIGO AI
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
