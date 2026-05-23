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
    await runAppHealthcheck();

    healthMonitorState
    .lastResult =
    result;

    healthMonitorState
    .lastCheckAt =
    Date.now();

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

  if(
    appState.healthcheckTimer
  ){

    clearInterval(

      appState
      .healthcheckTimer

    );

  }

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

  if(
    appState.healthcheckTimer
  ){

    clearInterval(

      appState
      .healthcheckTimer

    );

    appState.healthcheckTimer =
    null;

  }

  healthMonitorState
  .running =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthMonitorSnapshot(){

  return Object.freeze({

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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.startHealthchecks =
  startHealthchecks;

  window.stopHealthchecks =
  stopHealthchecks;

  window.executeHealthcheck =
  executeHealthcheck;

}
