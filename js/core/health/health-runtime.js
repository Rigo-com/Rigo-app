// =====================================
// RIGO AI
// HEALTH RUNTIME
// =====================================



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
