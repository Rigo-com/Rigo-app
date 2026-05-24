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

      !DependencySystem
      ?.diagnostics

    ){

      return null;

    }

    return DependencySystem
    .diagnostics();

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

      !HealthDiagnostics
      ?.get

    ){

      return null;

    }

    return await HealthDiagnostics
    .get();

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE RUNTIME
// =====================================

function getSafeRuntimeDiagnostics(){

  try{

    if(

      !RuntimeManager
      ?.health

    ){

      return null;

    }

    return RuntimeManager
    .health();

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE BOOTSTRAP
// =====================================

function getSafeBootstrapSnapshot(){

  try{

    if(

      !AppBootstrap
      ?.snapshot

    ){

      return null;

    }

    return AppBootstrap
    .snapshot();

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE STARTUP
// =====================================

function getSafeStartupSnapshot(){

  try{

    if(

      !AppStartup
      ?.snapshot

    ){

      return null;

    }

    return AppStartup
    .snapshot();

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE SHUTDOWN
// =====================================

function getSafeShutdownSnapshot(){

  try{

    if(

      !AppShutdown
      ?.snapshot

    ){

      return null;

    }

    return AppShutdown
    .snapshot();

  }

  catch(error){

    return null;

  }

}



// =====================================
// APP STATE
// =====================================

function getAppRuntimeState(){

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

    lastError:

      appState?.lastError

      ? getSafeErrorMessage(
          appState
          .lastError
        )

      : null

  });

}



// =====================================
// APP DIAGNOSTICS
// =====================================

async function getAppDiagnostics(){

  return freezeAppDiagnostics({

    app:
    getAppRuntimeState(),

    dependencies:
    getSafeDependencyDiagnostics(),

    health:
    await getSafeHealthDiagnostics(),

    runtime:
    getSafeRuntimeDiagnostics(),

    bootstrap:
    getSafeBootstrapSnapshot(),

    startup:
    getSafeStartupSnapshot(),

    shutdown:
    getSafeShutdownSnapshot(),

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
// PUBLIC API
// =====================================

const AppDiagnostics =
Object.freeze({

  get:
  getAppDiagnostics,

  snapshot:
  createAppDiagnosticsSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppDiagnostics =
  AppDiagnostics;

}
