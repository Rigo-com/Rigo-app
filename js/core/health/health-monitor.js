// =====================================
// RIGO AI
// HEALTH MONITOR
// =====================================



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

    runAppHealthcheck();

  },

  APP_CORE_CONFIG
  .HEALTHCHECK_INTERVAL);

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

  return true;

}
