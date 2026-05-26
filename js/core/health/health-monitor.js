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

  timer:null,

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
    healthMonitorState
    ?.timer
  ){

    clearInterval(

      healthMonitorState
      .timer

    );

    healthMonitorState
    .timer =
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

    if(
      typeof HealthRuntime ===
      "undefined"
    ){

      return false;

    }

    if(
      typeof HealthRuntime.run !==
      "function"
    ){

      return false;

    }

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
      typeof DiagnosticsRuntime !==
      "undefined"
    ){

      await DiagnosticsRuntime
      ?.error?.(

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
    typeof APP_CORE_CONFIG ===
    "undefined"
  ){

    return false;

  }

  if(

    !APP_CORE_CONFIG
    .ENABLE_HEALTHCHECKS

  ){

    return false;

  }

  clearHealthcheckTimer();

  healthMonitorState
  .timer =

  setInterval(

    async() => {

      await executeHealthcheck();

    },

    APP_CORE_CONFIG
    .HEALTHCHECK_INTERVAL

  );

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

  return freezeHealthRuntime({

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
