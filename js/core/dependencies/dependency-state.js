// =====================================
// RIGO AI
// DEPENDENCY STATE
// =====================================



// =====================================
// DEPENDENCY STATE
// =====================================

const appDependencyRegistry =
Object.seal({

  initialized:false,



  // ===================================
  // REGISTRY
  // ===================================

  dependencies:
  new Map(),

  resolved:
  new Set(),

  failed:
  new Set(),

  waiting:
  new Map(),



  // ===================================
  // GRAPH
  // ===================================

  dependencyGraph:
  new Map(),

  reverseDependencies:
  new Map(),



  // ===================================
  // WAITERS
  // ===================================

  activeWaiters:
  new Map(),



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:{

    registered:0,

    resolved:0,

    failed:0,

    waiting:0,

    validations:0

  },



  // ===================================
  // TIMESTAMPS
  // ===================================

  lastResolvedAt:null,

  lastValidationAt:null

});



// =====================================
// SNAPSHOT
// =====================================

function createDependencyStateSnapshot(){

  return freezeContainerObject({

    initialized:

      appDependencyRegistry
      .initialized,

    dependencies:

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

    dependencyGraph:

      appDependencyRegistry
      .dependencyGraph
      .size,

    reverseDependencies:

      appDependencyRegistry
      .reverseDependencies
      .size,

    activeWaiters:

      appDependencyRegistry
      .activeWaiters
      .size,

    diagnostics:{

      ...appDependencyRegistry
      .diagnostics

    },

    lastResolvedAt:

      appDependencyRegistry
      .lastResolvedAt,

    lastValidationAt:

      appDependencyRegistry
      .lastValidationAt

  });

}



// =====================================
// RESET
// =====================================

function resetDependencyState(){

  appDependencyRegistry
  .initialized =
  false;

  appDependencyRegistry
  .dependencies
  .clear();

  appDependencyRegistry
  .resolved
  .clear();

  appDependencyRegistry
  .failed
  .clear();

  appDependencyRegistry
  .waiting
  .clear();

  appDependencyRegistry
  .dependencyGraph
  .clear();

  appDependencyRegistry
  .reverseDependencies
  .clear();

  appDependencyRegistry
  .activeWaiters
  .clear();

  appDependencyRegistry
  .diagnostics
  .registered = 0;

  appDependencyRegistry
  .diagnostics
  .resolved = 0;

  appDependencyRegistry
  .diagnostics
  .failed = 0;

  appDependencyRegistry
  .diagnostics
  .waiting = 0;

  appDependencyRegistry
  .diagnostics
  .validations = 0;

  appDependencyRegistry
  .lastResolvedAt =
  null;

  appDependencyRegistry
  .lastValidationAt =
  null;

  return true;

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.appDependencyRegistry =
  appDependencyRegistry;

  window.createDependencyStateSnapshot =
  createDependencyStateSnapshot;

  window.resetDependencyState =
  resetDependencyState;

}
