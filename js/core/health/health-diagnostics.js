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

      freezeHealthDiagnostics(
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



async function getSafeRuntimeHealth(){

  try{

    if(
      typeof HealthRuntime ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof HealthRuntime.run !==
      "function"
    ){

      return null;

    }

    return await HealthRuntime
    .run();

  }

  catch(error){

    if(
      typeof DiagnosticsRuntime !==
      "undefined"
    ){

      await DiagnosticsRuntime
      ?.error?.(

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
// APP HEALTH STATE
// =====================================

function getAppHealthState(){

  const runtimeSnapshot =
    getSafeRuntimeSnapshot();

  const healthMonitorSnapshot =

    typeof HealthMonitor !==
    "undefined"

    &&

    typeof HealthMonitor
    .snapshot ===
    "function"

      ?

      HealthMonitor
      .snapshot()

      :

      null;

  return freezeHealthDiagnostics({

    crashes:

      Number(

        runtimeSnapshot
        ?.crashCount || 0

      ),

    lastError:

      runtimeSnapshot
      ?.lastError

      ?

      String(

        runtimeSnapshot
        .lastError

      )

      :

      null,

    started:

      Boolean(

        runtimeSnapshot
        ?.initialized

      ),

    initialized:

      Boolean(

        runtimeSnapshot
        ?.initialized

      ),

    phase:

      String(

        runtimeSnapshot
        ?.runtimeState || ""

      ),

    healthcheckRunning:

      Boolean(

        healthMonitorSnapshot
        ?.running

      )

  });

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

    app:
    getAppHealthState(),

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
// PUBLIC API
// =====================================

const HealthDiagnostics =
Object.freeze({

  get:
  getHealthDiagnostics,

  snapshot:
  createHealthDiagnosticsSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.HealthDiagnostics =
  HealthDiagnostics;

}
