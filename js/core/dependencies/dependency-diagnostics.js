// =====================================
// DEPENDENCY DIAGNOSTICS
// =====================================



// =====================================
// GET DIAGNOSTICS
// =====================================

function getDependencyDiagnostics(){

  return Object.freeze({



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

    diagnostics:

      appDependencyRegistry
      .diagnostics,



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
// CREATE SNAPSHOT
// =====================================

function createDependencySnapshot(){

  return Object.freeze({

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

  window.createDependencySnapshot =
  createDependencySnapshot;

}
