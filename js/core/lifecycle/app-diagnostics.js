// =====================================
// RIGO AI
// APP DIAGNOSTICS
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeAppDiagnostics(
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

      freezeAppDiagnostics(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// SAFE DEPENDENCY DIAGNOSTICS
// =====================================

function getSafeDependencyDiagnostics(){

  try{

    if(
      typeof getDependencyDiagnostics !==
      "function"
    ){

      return null;

    }

    return getDependencyDiagnostics();

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE HEALTH
// =====================================

async function getSafeHealthDiagnostics(){

  try{

    if(
      typeof getHealthDiagnostics !==
      "function"
    ){

      return null;

    }

    return await getHealthDiagnostics();

  }

  catch(error){

    return null;

  }

}



// =====================================
// APP DIAGNOSTICS
// =====================================

async function getAppDiagnostics(){

  const dependencyDiagnostics =
  getSafeDependencyDiagnostics();

  const healthDiagnostics =
  await getSafeHealthDiagnostics();

  return freezeAppDiagnostics({

    initialized:

      Boolean(
        appState
        ?.initialized
      ),

    started:

      Boolean(
        appState
        ?.started
      ),

    phase:

      String(
        appState
        ?.phase || ""
      ),

    startupDuration:

      Number(
        appState
        ?.startupDuration || 0
      ),

    crashCount:

      Number(
        appState
        ?.crashCount || 0
      ),

    failedStarts:

      Number(
        appState
        ?.failedStarts || 0
      ),

    recoveryAttempts:

      Number(
        appState
        ?.recoveryAttempts || 0
      ),

    activeModules:[

      ...(appState
      ?.activeModules || [])

    ],

    failedModules:[

      ...(appState
      ?.failedModules || [])

    ],

    dependencyDiagnostics,

    healthDiagnostics,

    lastError:

      appState?.lastError

      ? getSafeErrorMessage(
          appState
          .lastError
        )

      : null,

    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

async function createAppDiagnosticsSnapshot(){

  return freezeAppDiagnostics({

    snapshotAt:
    Date.now(),

    diagnostics:
    await getAppDiagnostics()

  });

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.getAppDiagnostics =
  getAppDiagnostics;

  window.createAppDiagnosticsSnapshot =
  createAppDiagnosticsSnapshot;

}
