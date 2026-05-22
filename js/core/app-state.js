// =====================================
// APP STATE
// =====================================

const appState =
Object.seal({

  initialized:false,

  started:false,

  starting:false,

  shuttingDown:false,

  recovering:false,

  crashed:false,

  phase:
  APP_PHASES.IDLE,

  initializedAt:null,

  startupStartedAt:null,

  startupCompletedAt:null,

  shutdownAt:null,

  lastError:null,

  recoveryAttempts:0,

  failedStarts:0,

  crashCount:0,

  startupDuration:0,

  activeModules:
  new Set(),

  failedModules:
  new Set(),

  healthcheckTimer:null

});



// =====================================
// APP STATUS
// =====================================

function updateAppPhase(
  phase
){

  appState.phase =
  phase;

  return true;

}
