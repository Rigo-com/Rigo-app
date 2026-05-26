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

  if(

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

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
// HELPERS
// =====================================

function getDiagnosticsDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return window[
      dependencyName
    ] || null;

  }

  catch(error){

    return null;

  }

}



function getSafeErrorMessage(
  error
){

  try{

    if(
      error instanceof Error
    ){

      return error.message;

    }

    return String(error);

  }

  catch(runtimeError){

    return "UNKNOWN ERROR";

  }

}



// =====================================
// SAFE CONTAINER DIAGNOSTICS
// =====================================

function getSafeContainerDiagnostics(){

  try{

    const container =
    getDiagnosticsDependency(
      "Container"
    );

    if(

      !container ||
      !container.diagnostics

    ){

      return null;

    }

    return container
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

    const diagnostics =
    getDiagnosticsDependency(
      "HealthDiagnostics"
    );

    if(

      !diagnostics ||
      !diagnostics.get

    ){

      return null;

    }

    return await diagnostics
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

    const runtimeManager =
    getDiagnosticsDependency(
      "RuntimeManager"
    );

    if(

      !runtimeManager ||
      !runtimeManager.health

    ){

      return null;

    }

    return runtimeManager
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

    const bootstrap =
    getDiagnosticsDependency(
      "AppBootstrap"
    );

    if(

      !bootstrap ||
      !bootstrap.snapshot

    ){

      return null;

    }

    return bootstrap
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

    const startup =
    getDiagnosticsDependency(
      "AppStartup"
    );

    if(

      !startup ||
      !startup.snapshot

    ){

      return null;

    }

    return startup
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

    const shutdown =
    getDiagnosticsDependency(
      "AppShutdown"
    );

    if(

      !shutdown ||
      !shutdown.snapshot

    ){

      return null;

    }

    return shutdown
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
      ?.activeModules ||

      new Set())

    ],

    failedModules:[

      ...(appState
      ?.failedModules ||

      new Set())

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

    container:
    getSafeContainerDiagnostics(),

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

  diagnostics:
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

  Object.defineProperty(

    window,

    "AppDiagnostics",

    {

      value:
      AppDiagnostics,

      writable:
      false,

      configurable:
      false

    }

  );

}
