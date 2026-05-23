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
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.appDependencyRegistry =
  appDependencyRegistry;

}
