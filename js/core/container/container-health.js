// =====================================
// RIGO AI
// CONTAINER HEALTH
// =====================================



// =====================================
// RESET CONTAINER
// =====================================

async function resetDependencyContainer(){

  dependencyContainerState
  .services
  .clear();

  dependencyContainerState
  .singletons
  .clear();

  dependencyContainerState
  .scopes
  .clear();

  dependencyContainerState
  .resolutionStack =
  [];

  dependencyContainerState
  .diagnostics = {

    registered:0,

    resolved:0,

    failed:0,

    removed:0,

    scopes:0

  };

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(
      CONTAINER_EVENTS.RESET
    );

  }

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getContainerDiagnostics(){

  return freezeContainerObject({

    initialized:
    dependencyContainerState
    .initialized,

    services:

      dependencyContainerState
      .services
      .size,

    singletons:

      dependencyContainerState
      .singletons
      .size,

    scopes:

      dependencyContainerState
      .scopes
      .size,

    activeResolutions:

      dependencyContainerState
      .resolutionStack
      .length,

    diagnostics:

      dependencyContainerState
      .diagnostics,

    lastResolvedAt:

      dependencyContainerState
      .lastResolvedAt

  });

}



// =====================================
// INITIALIZE
// =====================================

async function initializeDependencyContainer(){

  if(
    dependencyContainerState
    .initialized
  ){

    return true;

  }

  dependencyContainerState
  .initialized =
  true;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      CONTAINER_EVENTS
      .INITIALIZED

    );

  }

  return true;

}
