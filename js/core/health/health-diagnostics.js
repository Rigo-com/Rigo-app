// =====================================
// RIGO AI
// HEALTH DIAGNOSTICS
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeHealthDiagnostics(
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

      freezeHealthDiagnostics(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// SAFE HEALTHCHECK
// =====================================

async function getSafeRuntimeHealth(){

  try{

    if(
      typeof runAppHealthcheck !==
      "function"
    ){

      return null;

    }

    return await runAppHealthcheck();

  }

  catch(error){

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "HEALTHCHECK FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return null;

  }

}



// =====================================
// HEALTH REPORT
// =====================================

async function getHealthDiagnostics(){

  const runtimeHealth =
  await getSafeRuntimeHealth();

  return freezeHealthDiagnostics({

    runtime:
    runtimeHealth,

    crashes:

      Number(
        appState
        ?.crashCount || 0
      ),

    lastError:

      appState?.lastError

      ? String(
          appState
          .lastError
        )

      : null,

    started:

      Boolean(
        appState
        ?.started
      ),

    initialized:

      Boolean(
        appState
        ?.initialized
      ),

    phase:

      String(
        appState
        ?.phase || ""
      ),

    healthcheckRunning:

      Boolean(
        appState
        ?.healthcheckTimer
      ),

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

async function createHealthDiagnosticsSnapshot(){

  return freezeHealthDiagnostics({

    snapshotAt:
    Date.now(),

    diagnostics:
    await getHealthDiagnostics()

  });

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.getHealthDiagnostics =
  getHealthDiagnostics;

  window.createHealthDiagnosticsSnapshot =
  createHealthDiagnosticsSnapshot;

}
