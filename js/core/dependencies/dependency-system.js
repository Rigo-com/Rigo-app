// =====================================
// RIGO AI
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

  return resetDependencyState();

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

  remove:
  removeDependency,

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

  validateResolvers:
  validateDependencyResolvers,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getDependencyDiagnostics,

  health:
  getDependencyHealthReport,

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
