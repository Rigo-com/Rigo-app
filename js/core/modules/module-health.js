// =====================================
// RIGO AI
// MODULE HEALTH
// =====================================



// =====================================
// HEALTH CHECK
// =====================================

function getModuleHealth(){

  return freezeModuleObject({

    initialized:
    moduleLoaderState
    .initialized,

    totalModules:

      moduleLoaderState
      .modules
      .size,

    activeModules:

      moduleLoaderState
      .activeModules
      .size,

    failedModules:

      moduleLoaderState
      .failedModules
      .size,

    loadingModules:

      moduleLoaderState
      .loadingStack
      .length,

    diagnostics:

      moduleLoaderState
      .diagnostics,

    lastLoadedAt:

      moduleLoaderState
      .lastLoadedAt

  });

}



// =====================================
// RESET
// =====================================

async function resetModuleLoader(){

  moduleLoaderState
  .modules
  .clear();

  moduleLoaderState
  .activeModules
  .clear();

  moduleLoaderState
  .failedModules
  .clear();

  moduleLoaderState
  .dependencyGraph
  .clear();

  moduleLoaderState
  .loadingStack = [];

  moduleLoaderState
  .diagnostics = {

    registered:0,

    loaded:0,

    activated:0,

    failed:0,

    retries:0

  };

  moduleLoaderState
  .lastLoadedAt =
  null;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeModuleLoader(){

  if(
    moduleLoaderState
    .initialized
  ){

    return true;

  }

  moduleLoaderState
  .initialized =
  true;

  return true;

}
