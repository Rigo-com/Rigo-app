// =====================================
// DEPENDENCY SYSTEM
// =====================================



// =====================================
// INITIALIZE
// =====================================

async function initializeDependencySystem(){

  if(
    appDependencyRegistry
    .initialized
  ){

    return true;

  }

  appDependencyRegistry
  .initialized =
  true;

  return true;

}



// =====================================
// RESET
// =====================================

function resetDependencySystem(){

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
// PUBLIC API
// =====================================

const DependencySystem =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  initialize:
  initializeDependencySystem,

  reset:
  resetDependencySystem,



  // ===================================
  // REGISTRY
  // ===================================

  register:
  registerDependency,

  resolve:
  resolveDependency,

  fail:
  failDependency,

  get:
  getDependency,

  getAll:
  getAllDependencies,



  // ===================================
  // STATUS
  // ===================================

  isResolved:
  isDependencyResolved,



  // ===================================
  // WAITERS
  // ===================================

  wait:
  waitForDependency,

  waitAll:
  waitForDependencies,



  // ===================================
  // VALIDATION
  // ===================================

  validate:
  validateDependencyRegistry,

  validateCircular:
  validateCircularDependencies,

  validateMissing:
  validateMissingDependencies,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getDependencyDiagnostics,

  snapshot:
  createDependencySnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.DependencySystem =
  DependencySystem;

  window.initializeDependencySystem =
  initializeDependencySystem;

  window.resetDependencySystem =
  resetDependencySystem;

}
