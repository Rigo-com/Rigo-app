// =====================================
// RIGO AI
// HEALTH MONITOR
// =====================================



// =====================================
// STATE
// =====================================

const healthMonitorState =
Object.seal({

  running:false,

  checking:false,

  lastCheckAt:null,

  lastResult:null

});



// =====================================
// HELPERS
// =====================================

function updateHealthMonitorResult(
  result
){

  healthMonitorState
  .lastResult =
  result;

  healthMonitorState
  .lastCheckAt =
  Date.now();

  return true;

}



function clearHealthcheckTimer(){

  if(
    appState
    ?.healthcheckTimer
  ){

    clearInterval(

      appState
      .healthcheckTimer

    );

    appState
    .healthcheckTimer =
    null;

  }

  return true;

}



// =====================================
// EXECUTE HEALTHCHECK
// =====================================

async function executeHealthcheck(){

  if(
    healthMonitorState
    .checking
  ){

    return false;

  }

  healthMonitorState
  .checking =
  true;

  try{

    const result =
    await HealthRuntime
    .run();

    updateHealthMonitorResult(
      result
    );

    return result;

  }

  catch(error){

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      logDiagnosticError(

        "HEALTHCHECK EXECUTION FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return false;

  }

  finally{

    healthMonitorState
    .checking =
    false;

  }

}



// =====================================
// START HEALTHCHECKS
// =====================================

function startHealthchecks(){

  if(

    !APP_CORE_CONFIG
    .ENABLE_HEALTHCHECKS

  ){

    return false;

  }

  clearHealthcheckTimer();

  appState.healthcheckTimer =
  setInterval(() => {

    executeHealthcheck();

  },

  APP_CORE_CONFIG
  .HEALTHCHECK_INTERVAL);

  healthMonitorState
  .running =
  true;

  return true;

}



// =====================================
// STOP HEALTHCHECKS
// =====================================

function stopHealthchecks(){

  clearHealthcheckTimer();

  healthMonitorState
  .running =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthMonitorSnapshot(){

  return freezeHealthDiagnostics({

    timestamp:
    Date.now(),

    running:
    healthMonitorState
    .running,

    checking:
    healthMonitorState
    .checking,

    lastCheckAt:
    healthMonitorState
    .lastCheckAt,

    lastResult:
    healthMonitorState
    .lastResult

  });

}



// =====================================
// PUBLIC API
// =====================================

const HealthMonitor =
Object.freeze({

  start:
  startHealthchecks,

  stop:
  stopHealthchecks,

  execute:
  executeHealthcheck,

  snapshot:
  createHealthMonitorSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.HealthMonitor =
  HealthMonitor;

}
