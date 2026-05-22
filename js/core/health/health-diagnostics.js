// =====================================
// RIGO AI
// HEALTH DIAGNOSTICS
// =====================================



// =====================================
// HEALTH REPORT
// =====================================

function getHealthDiagnostics(){

  const runtimeHealth =
  runAppHealthcheck();

  return {

    runtime:
    runtimeHealth,

    crashes:
    appState.crashCount,

    lastError:

      appState.lastError

      ? String(
          appState.lastError
        )

      : null,

    started:
    appState.started,

    initialized:
    appState.initialized,

    phase:
    appState.phase,

    healthcheckRunning:

      Boolean(
        appState
        .healthcheckTimer
      ),

    timestamp:
    Date.now()

  };

}
