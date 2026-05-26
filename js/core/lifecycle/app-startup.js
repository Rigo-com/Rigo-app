// =====================================
// RIGO AI
// APP STARTUP
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeStartupObject(
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

    value instanceof Promise ||

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

      freezeStartupObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// DEPENDENCIES
// =====================================

function getStartupDependency(
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



// =====================================
// APP STATE
// =====================================

function getStartupAppState(){

  if(
    typeof appState !==
    "object" ||
    !appState
  ){

    return null;

  }

  return appState;

}



// =====================================
// STARTUP STATE
// =====================================

const startupRuntimeState =
Object.seal({

  starting:false,

  lastStartedAt:null,

  lastCompletedAt:null,

  lastDuration:null,

  lastError:null

});



// =====================================
// HELPERS
// =====================================

function updateStartupState(
  updates = {}
){

  Object.assign(

    startupRuntimeState,

    updates

  );

  return true;

}



function updateStartupAppState(
  updates = {}
){

  const state =
  getStartupAppState();

  if(!state){

    return false;

  }

  Object.assign(
    state,
    updates
  );

  return true;

}



function normalizeStartupError(
  error
){

  const formatter =
  getStartupDependency(
    "getSafeErrorMessage"
  );

  if(
    typeof formatter ===
    "function"
  ){

    return formatter(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



// =====================================
// SAFE LOADING SCREEN
// =====================================

function hideSafeLoadingScreen(){

  try{

    const hideLoading =
    getStartupDependency(
      "hideLoadingScreen"
    );

    if(
      typeof hideLoading ===
      "function"
    ){

      hideLoading();

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// STARTUP SNAPSHOT
// =====================================

function createStartupSnapshot(){

  const state =
  getStartupAppState();

  return freezeStartupObject({

    starting:
    startupRuntimeState
    .starting,

    lastStartedAt:
    startupRuntimeState
    .lastStartedAt,

    lastCompletedAt:
    startupRuntimeState
    .lastCompletedAt,

    lastDuration:
    startupRuntimeState
    .lastDuration,

    initialized:
    Boolean(
      state?.initialized
    ),

    started:
    Boolean(
      state?.started
    ),

    phase:
    state?.phase || null,

    lastError:

      startupRuntimeState
      .lastError

      ? normalizeStartupError(
          startupRuntimeState
          .lastError
        )

      : null

  });

}



// =====================================
// START BOOTSTRAP
// =====================================

async function startBootstrapProcess(){

  const bootstrap =
  getStartupDependency(
    "AppBootstrap"
  );

  const coreConfig =
  getStartupDependency(
    "APP_CORE_CONFIG"
  );

  if(
    !bootstrap ||
    typeof bootstrap
    .initialize !==
    "function"
  ){

    throw new Error(
      "BOOTSTRAP UNAVAILABLE"
    );

  }

  await Promise.race([

    bootstrap
    .initialize(),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(

          new Error(
            "APP STARTUP TIMEOUT"
          )

        );

      },

      coreConfig
      ?.STARTUP_TIMEOUT

      ??

      15000);

    })

  ]);

  return true;

}



// =====================================
// START RUNTIME
// =====================================

async function startRuntimeManager(){

  const runtimeManager =
  getStartupDependency(
    "RuntimeManager"
  );

  if(
    !runtimeManager
  ){

    return true;

  }

  if(
    typeof runtimeManager
    .boot !==
    "function"
  ){

    return true;

  }

  const booted =
  await runtimeManager
  .boot();

  if(!booted){

    throw new Error(
      "RUNTIME BOOT FAILED"
    );

  }

  return true;

}



// =====================================
// VALIDATE HEALTH
// =====================================

async function validateStartupHealth(){

  const healthRuntime =
  getStartupDependency(
    "HealthRuntime"
  );

  if(
    !healthRuntime ||
    typeof healthRuntime
    .run !==
    "function"
  ){

    throw new Error(
      "HEALTH RUNTIME UNAVAILABLE"
    );

  }

  const healthReport =
  await healthRuntime
  .run();

  if(
    !healthReport
    ?.healthy
  ){

    throw new Error(
      "APPLICATION HEALTHCHECK FAILED"
    );

  }

  return true;

}



// =====================================
// COMPLETE STARTUP
// =====================================

async function completeStartupProcess(){

  const state =
  getStartupAppState();

  if(!state){

    return false;

  }

  updateStartupAppState({

    started:true,

    initialized:true,

    initializedAt:
    Date.now(),

    startupCompletedAt:
    Date.now()

  });

  state.startupDuration =

    state
    .startupCompletedAt -

    state
    .startupStartedAt;

  updateStartupState({

    lastCompletedAt:
    state.startupCompletedAt,

    lastDuration:
    state.startupDuration

  });

  const updatePhase =
  getStartupDependency(
    "updateAppPhase"
  );

  const phases =
  getStartupDependency(
    "APP_PHASES"
  );

  if(
    typeof updatePhase ===
    "function" &&
    phases
  ){

    updatePhase(
      phases.READY
    );

  }

  const healthMonitor =
  getStartupDependency(
    "HealthMonitor"
  );

  if(
    healthMonitor &&
    typeof healthMonitor
    .start ===
    "function"
  ){

    await healthMonitor
    .start();

  }

  hideSafeLoadingScreen();

  return true;

}



// =====================================
// HANDLE STARTUP ERROR
// =====================================

async function handleStartupFailure(
  error
){

  const state =
  getStartupAppState();

  if(state){

    state.failedStarts =
    Number(
      state.failedStarts || 0
    ) + 1;

    state.lastError =
    error;
  }

  updateStartupState({

    lastError:error

  });

  hideSafeLoadingScreen();

  return false;

}



// =====================================
// START APP
// =====================================

async function startApp(){

  const state =
  getStartupAppState();

  if(!state){

    return false;

  }

  if(

    state.started ||

    state.starting ||

    startupRuntimeState
    .starting

  ){

    return false;

  }

  updateStartupState({

    starting:true,

    lastStartedAt:
    Date.now(),

    lastError:null

  });

  updateStartupAppState({

    starting:true,

    startupStartedAt:
    startupRuntimeState
    .lastStartedAt

  });

  try{

    await startBootstrapProcess();

    await startRuntimeManager();

    await validateStartupHealth();

    await completeStartupProcess();

    return true;

  }

  catch(error){

    return await handleStartupFailure(
      error
    );

  }

  finally{

    updateStartupAppState({

      starting:false

    });

    updateStartupState({

      starting:false

    });

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppStartup =
Object.freeze({

  start:
  startApp,

  snapshot:
  createStartupSnapshot,

  diagnostics:
  createStartupSnapshot

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

    "AppStartup",

    {

      value:
      AppStartup,

      writable:
      false,

      configurable:
      false

    }

  );

}
