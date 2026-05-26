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

function getSafeRuntimeSnapshot(){

  try{

    if(
      typeof RuntimeState ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof RuntimeState.get !==
      "function"
    ){

      return null;

    }

    return RuntimeState.get();

  }

  catch(error){

    return null;

  }

}



function getAppRuntimeState(){

  const runtimeSnapshot =
    getSafeRuntimeSnapshot();

  return {

    activeModules:

      Number(

        runtimeSnapshot
        ?.activeModules || 0

      ),

    failedModules:

      Number(

        runtimeSnapshot
        ?.failedModules || 0

      ),

    started:
    Boolean(

      runtimeSnapshot
      ?.initialized

    ),

    crashed:
    Boolean(

      runtimeSnapshot
      ?.crashed

    ),

    crashCount:

      Number(

        runtimeSnapshot
        ?.crashCount || 0

      )

  };

}



function updateCrashState(
  healthy
){

  const runtimeSnapshot =
    getSafeRuntimeSnapshot();

  if(
    !runtimeSnapshot
  ){

    return false;

  }

  return Boolean(
    healthy
  );

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
      typeof DiagnosticsRuntime !==
      "undefined"
    ){

      await DiagnosticsRuntime
      ?.warn?.(

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

        runtimeState
        .crashed,

      crashCount:

        runtimeState
        .crashCount,

      timestamp:
      Date.now()

    });

  }

  catch(error){

    if(
      typeof DiagnosticsRuntime !==
      "undefined"
    ){

      await DiagnosticsRuntime
      ?.error?.(

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
