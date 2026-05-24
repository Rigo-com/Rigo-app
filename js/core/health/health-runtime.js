// =====================================
// RIGO AI
// HEALTH RUNTIME
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeHealthRuntime(
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

      freezeHealthRuntime(
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

function getAppRuntimeState(){

  return {

    activeModules:

      appState
      ?.activeModules
      ?.size || 0,

    failedModules:

      appState
      ?.failedModules
      ?.size || 0,

    started:
    Boolean(
      appState?.started
    )

  };

}



function updateCrashState(
  healthy
){

  if(!healthy){

    if(!appState.crashed){

      appState.crashed =
      true;

      appState.crashCount++;

    }

  }

  else{

    appState.crashed =
    false;

  }

  return true;

}



// =====================================
// HEALTH SCORE
// =====================================

function calculateAppHealthScore(
  domHealthy,
  modulesHealthy,
  appStarted,
  failedModules
){

  let score = 100;

  if(!domHealthy){

    score -= 40;

  }

  if(!modulesHealthy){

    score -= Math.min(
      failedModules * 10,
      40
    );

  }

  if(!appStarted){

    score -= 20;

  }

  return Math.max(
    0,
    score
  );

}



// =====================================
// HEALTHCHECKS
// =====================================

async function runAppHealthcheck(){

  try{

    const runtimeState =
    getAppRuntimeState();

    const domHealthy =

      typeof document !==
      "undefined";

    const modulesHealthy =

      runtimeState
      .failedModules <= 0;

    const appHealthy =

      domHealthy &&

      modulesHealthy &&

      runtimeState
      .started;

    const healthScore =
    calculateAppHealthScore(

      domHealthy,

      modulesHealthy,

      runtimeState
      .started,

      runtimeState
      .failedModules

    );



    // ================================
    // CRASH TRACKING
    // ================================

    updateCrashState(
      appHealthy
    );



    // ================================
    // DIAGNOSTICS
    // ================================

    if(
      !appHealthy &&
      typeof logDiagnosticWarning ===
      "function"
    ){

      logDiagnosticWarning(

        "APP HEALTH DEGRADED",

        {

          healthScore,

          domHealthy,

          modulesHealthy,

          activeModules:

            runtimeState
            .activeModules,

          failedModules:

            runtimeState
            .failedModules

        }

      );

    }

    return freezeHealthRuntime({

      healthy:
      appHealthy,

      healthScore,

      domHealthy,

      modulesHealthy,

      appStarted:

        runtimeState
        .started,

      activeModules:

        runtimeState
        .activeModules,

      failedModules:

        runtimeState
        .failedModules,

      crashed:

        Boolean(
          appState
          ?.crashed
        ),

      crashCount:

        Number(
          appState
          ?.crashCount || 0
        ),

      timestamp:
      Date.now()

    });

  }

  catch(error){

    appState.lastError =
    error;

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "APP HEALTHCHECK FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return freezeHealthRuntime({

      healthy:false,

      healthScore:0,

      error:
      String(error),

      timestamp:
      Date.now()

    });

  }

}



// =====================================
// PUBLIC API
// =====================================

const HealthRuntime =
Object.freeze({

  run:
  runAppHealthcheck,

  calculate:
  calculateAppHealthScore

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.HealthRuntime =
  HealthRuntime;

}
