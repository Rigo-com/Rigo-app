// =====================================
// HEALTHCHECKS
// =====================================

function runAppHealthcheck(){

  try{

    const domHealthy =

      typeof document !==
      "undefined";

    const modulesHealthy =

      appState.failedModules
      .size <= 0;

    const appHealthy =

      domHealthy &&

      modulesHealthy &&

      appState.started;

    if(!appHealthy){

      appState.crashed =
      true;

      appState.crashCount++;

    }

    return {

      healthy:
      appHealthy,

      domHealthy,

      modulesHealthy,

      activeModules:

        appState.activeModules
        .size,

      failedModules:

        appState.failedModules
        .size

    };

  }

  catch(error){

    appState.lastError =
    error;

    return {

      healthy:false

    };

  }

}



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
