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
// INITIALIZE HEALTH SYSTEM
// =====================================

async function initializeHealthSystem(){

  if(
    healthSystemState
    .initialized
  ){

    return true;

  }

  const diagnosticsReady =
  await initializeDiagnosticsSystem();

  if(!diagnosticsReady){

    return false;

  }

  healthSystemState
  .initialized =
  true;

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

  await emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .CHECK_STARTED

  );

  const result =
  await runAppHealthcheck();

  healthSystemState
  .lastCheckAt =
  Date.now();

  await emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .CHECK_COMPLETED,

    {

      success:
      Boolean(result)

    }

  );

  return result;

}



// =====================================
// RESET HEALTH SYSTEM
// =====================================

function resetHealthSystem(){

  resetDiagnosticsSystem();

  stopHealthchecks();

  healthSystemState
  .running =
  false;

  healthSystemState
  .lastResetAt =
  Date.now();

  emitHealthSystemEvent(

    HEALTH_SYSTEM_EVENTS
    .RESET

  );

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthSystemSnapshot(){

  return Object.freeze({

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

  return Object.freeze({

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
  startHealthchecks,

  stop:
  stopHealthchecks,

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

  window.initializeHealthSystem =
  initializeHealthSystem;

  window.resetHealthSystem =
  resetHealthSystem;

}
