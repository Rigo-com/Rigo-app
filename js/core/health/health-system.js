// =====================================
// RIGO AI
// HEALTH SYSTEM
// =====================================



// =====================================
// HEALTH STATE
// =====================================

const healthSystemState =
Object.seal({

  initialized:false,

  running:false,

  lastCheckAt:null,

  lastResetAt:null

});



// =====================================
// HEALTH EVENTS
// =====================================

const HEALTH_SYSTEM_EVENTS =
Object.freeze({

  INITIALIZED:
  "health.initialized",

  RESET:
  "health.reset",

  CHECK_STARTED:
  "health.check.started",

  CHECK_COMPLETED:
  "health.check.completed"

});



// =====================================
// EMIT EVENT
// =====================================

async function emitHealthSystemEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "health-system",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// HELPERS
// =====================================

function updateHealthSystemState(
  updates = {}
){

  Object.assign(

    healthSystemState,

    updates

  );

  return true;

}



// =====================================
// INITIALIZE HEALTH SYSTEM
// =====================================

async function initializeHealthSystem(){

  if(
    healthSystemState
    .initialized
  ){

    return true;

  }

  if(
    typeof DiagnosticsRuntime ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof DiagnosticsRuntime
    .initialize !==
    "function"
  ){

    return false;

  }

  const diagnosticsReady =
  await DiagnosticsRuntime
  .initialize();

  if(!diagnosticsReady){

    return false;

  }

  updateHealthSystemState({

    initialized:true

  });

  await emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .INITIALIZED

  );

  return true;

}



// =====================================
// RUN HEALTHCHECK
// =====================================

async function runHealthSystemCheck(){

  if(
    typeof HealthRuntime ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof HealthRuntime
    .run !==
    "function"
  ){

    return false;

  }

  await emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .CHECK_STARTED

  );

  const result =
  await HealthRuntime
  .run();

  updateHealthSystemState({

    lastCheckAt:
    Date.now()

  });

  await emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .CHECK_COMPLETED,

    {

      success:
      Boolean(
        result?.healthy
      )

    }

  );

  return result;

}



// =====================================
// START
// =====================================

function startHealthSystem(){

  if(
    typeof HealthMonitor ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof HealthMonitor
    .start !==
    "function"
  ){

    return false;

  }

  const started =
  HealthMonitor
  .start();

  if(started){

    updateHealthSystemState({

      running:true

    });

  }

  return started;

}



// =====================================
// STOP
// =====================================

function stopHealthSystem(){

  if(
    typeof HealthMonitor ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof HealthMonitor
    .stop !==
    "function"
  ){

    return false;

  }

  const stopped =
  HealthMonitor
  .stop();

  if(stopped){

    updateHealthSystemState({

      running:false

    });

  }

  return stopped;

}



// =====================================
// RESET HEALTH SYSTEM
// =====================================

async function resetHealthSystem(){

  if(
    typeof DiagnosticsRuntime !==
    "undefined"
  ){

    await DiagnosticsRuntime
    ?.reset?.();

  }

  stopHealthSystem();

  updateHealthSystemState({

    running:false,

    lastResetAt:
    Date.now()

  });

  await emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .RESET

  );

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthSystemSnapshot(){

  return freezeHealthDiagnostics({

    timestamp:
    Date.now(),

    initialized:
    healthSystemState
    .initialized,

    running:
    healthSystemState
    .running,

    lastCheckAt:
    healthSystemState
    .lastCheckAt,

    lastResetAt:
    healthSystemState
    .lastResetAt

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getHealthSystemDiagnostics(){

  return freezeHealthDiagnostics({

    initialized:
    healthSystemState
    .initialized,

    running:
    healthSystemState
    .running,

    lastCheckAt:
    healthSystemState
    .lastCheckAt,

    lastResetAt:
    healthSystemState
    .lastResetAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const HealthSystem =
Object.freeze({

  initialize:
  initializeHealthSystem,

  reset:
  resetHealthSystem,

  run:
  runHealthSystemCheck,

  start:
  startHealthSystem,

  stop:
  stopHealthSystem,

  diagnostics:
  getHealthSystemDiagnostics,

  snapshot:
  createHealthSystemSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.HealthSystem =
  HealthSystem;

}
