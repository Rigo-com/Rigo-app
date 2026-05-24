// =====================================
// RIGO AI
// DEPENDENCY DIAGNOSTICS
// =====================================



// =====================================
// GET DIAGNOSTICS
// =====================================

function getDependencyDiagnostics(){

  return freezeContainerObject({



    // ===================================
    // STATE
    // ===================================

    initialized:

      appDependencyRegistry
      .initialized,



    // ===================================
    // REGISTRY
    // ===================================

    registered:

      appDependencyRegistry
      .dependencies
      .size,

    resolved:[

      ...appDependencyRegistry
      .resolved

    ],

    failed:[

      ...appDependencyRegistry
      .failed

    ],

    waiting:

      appDependencyRegistry
      .waiting
      .size,



    // ===================================
    // GRAPH
    // ===================================

    dependencyGraph:

      appDependencyRegistry
      .dependencyGraph
      .size,

    reverseDependencies:

      appDependencyRegistry
      .reverseDependencies
      .size,



    // ===================================
    // ACTIVE WAITERS
    // ===================================

    activeWaiters:

      appDependencyRegistry
      .activeWaiters
      .size,



    // ===================================
    // DIAGNOSTICS
    // ===================================

    diagnostics:{

      ...appDependencyRegistry
      .diagnostics

    },



    // ===================================
    // TIMESTAMPS
    // ===================================

    lastResolvedAt:

      appDependencyRegistry
      .lastResolvedAt,

    lastValidationAt:

      appDependencyRegistry
      .lastValidationAt

  });

}



// =====================================
// HEALTH REPORT
// =====================================

function getDependencyHealthReport(){

  return freezeContainerObject({

    healthy:

      appDependencyRegistry
      .failed
      .size <= 0,

    initialized:

      appDependencyRegistry
      .initialized,

    registered:

      appDependencyRegistry
      .dependencies
      .size,

    resolved:

      appDependencyRegistry
      .resolved
      .size,

    failed:

      appDependencyRegistry
      .failed
      .size,

    waiting:

      appDependencyRegistry
      .waiting
      .size,

    lastResolvedAt:

      appDependencyRegistry
      .lastResolvedAt

  });

}



// =====================================
// CREATE SNAPSHOT
// =====================================

function createDependencySnapshot(){

  return freezeContainerObject({

    timestamp:
    Date.now(),

    diagnostics:
    getDependencyDiagnostics()

  });

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.getDependencyDiagnostics =
  getDependencyDiagnostics;

  window.getDependencyHealthReport =
  getDependencyHealthReport;

  window.createDependencySnapshot =
  createDependencySnapshot;

}
