// =====================================
// RIGO AI
// CONTAINER HEALTH
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// RESET CONTAINER
// =====================================

async function resetContainer(){

  resetContainerState();

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(
      CONTAINER_EVENTS
      .RESET
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

      containerState
      .initialized &&

      containerState
      .resolutionStack
      .length === 0 &&

      containerState
      .diagnostics
      .failed === 0,

    initialized:

      containerState
      .initialized,

    services:

      containerState
      .services
      .size,

    singletons:

      containerState
      .singletons
      .size,

    scopes:

      containerState
      .scopes
      .size,

    activeResolutions:

      containerState
      .resolutionStack
      .length,

    failedResolutions:

      containerState
      .diagnostics
      .failed,

    lastResolvedAt:

      containerState
      .lastResolvedAt

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getContainerDiagnostics(){

  return freezeContainerObject({

    initialized:
    containerState
    .initialized,

    services:

      containerState
      .services
      .size,

    singletons:

      containerState
      .singletons
      .size,

    scopes:

      containerState
      .scopes
      .size,

    activeResolutions:

      containerState
      .resolutionStack
      .length,

    diagnostics:{

      ...containerState
      .diagnostics

    },

    lastResolvedAt:

      containerState
      .lastResolvedAt

  });

}



// =====================================
// INITIALIZE
// =====================================

async function initializeContainer(){

  if(
    containerState
    .initialized
  ){

    return true;

  }

  containerState
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
// EXPORTS
// =====================================

export {

  resetContainer,

  getContainerHealthReport,

  getContainerDiagnostics,

  initializeContainer

};
