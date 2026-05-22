// =====================================
// RIGO AI
// APP STATE
// =====================================



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

  ready:false,

  phase:
  APP_PHASES.IDLE,

  initializedAt:null,

  startupStartedAt:null,

  startupCompletedAt:null,

  shutdownAt:null,

  lastRecoveredAt:null,

  lastHealthcheckAt:null,

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

  if(
    phase ===
    APP_PHASES.READY
  ){

    appState.ready =
    true;

  }

  else{

    appState.ready =
    false;

  }

  return true;

}



// =====================================
// APP SNAPSHOT
// =====================================

function getAppStateSnapshot(){

  return Object.freeze({

    initialized:
    appState.initialized,

    started:
    appState.started,

    starting:
    appState.starting,

    shuttingDown:
    appState.shuttingDown,

    recovering:
    appState.recovering,

    crashed:
    appState.crashed,

    ready:
    appState.ready,

    phase:
    appState.phase,

    initializedAt:
    appState.initializedAt,

    startupStartedAt:
    appState.startupStartedAt,

    startupCompletedAt:
    appState.startupCompletedAt,

    shutdownAt:
    appState.shutdownAt,

    lastRecoveredAt:
    appState.lastRecoveredAt,

    lastHealthcheckAt:
    appState.lastHealthcheckAt,

    startupDuration:
    appState.startupDuration,

    recoveryAttempts:
    appState.recoveryAttempts,

    failedStarts:
    appState.failedStarts,

    crashCount:
    appState.crashCount,

    activeModules:[

      ...appState
      .activeModules

    ],

    failedModules:[

      ...appState
      .failedModules

    ]

  });

}
