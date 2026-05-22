// =====================================
// RIGO AI
// APP DIAGNOSTICS
// =====================================



// =====================================
// APP DIAGNOSTICS
// =====================================

function getAppDiagnostics(){

  return {

    initialized:
    appState.initialized,

    started:
    appState.started,

    phase:
    appState.phase,

    startupDuration:
    appState.startupDuration,

    crashCount:
    appState.crashCount,

    failedStarts:
    appState.failedStarts,

    recoveryAttempts:
    appState.recoveryAttempts,

    activeModules:[

      ...appState
      .activeModules

    ],

    failedModules:[

      ...appState
      .failedModules

    ],

    dependencyDiagnostics:
    getDependencyDiagnostics(),

    lastError:

      appState.lastError

      ? getSafeErrorMessage(
          appState.lastError
        )

      : null

  };

}
