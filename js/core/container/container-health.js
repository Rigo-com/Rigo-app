// =====================================
// RIGO AI
// CONTAINER HEALTH
// =====================================



// =====================================
// RESET CONTAINER
// =====================================

async function resetDependencyContainer(){

  resetContainerState();

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
// HEALTH REPORT
// =====================================

function getContainerHealthReport(){

  return freezeContainerObject({

    healthy:

      dependencyContainerState
      .initialized &&

      dependencyContainerState
      .resolutionStack
      .length === 0 &&

      dependencyContainerState
      .diagnostics
      .failed === 0,

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

    failedResolutions:

      dependencyContainerState
      .diagnostics
      .failed,

    lastResolvedAt:

      dependencyContainerState
      .lastResolvedAt

  });

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

    diagnostics:{

      ...dependencyContainerState
      .diagnostics

    },

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



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.resetDependencyContainer =
  resetDependencyContainer;

  window.getContainerHealthReport =
  getContainerHealthReport;

  window.getContainerDiagnostics =
  getContainerDiagnostics;

  window.initializeDependencyContainer =
  initializeDependencyContainer;

}
