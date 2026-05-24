// =====================================
// RIGO AI
// DEPENDENCIES INDEX
// =====================================



// =====================================
// DEPENDENCY API
// =====================================

const DependenciesAPI =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  system:
  DependencySystem,



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
  // WAITERS
  // ===================================

  wait:
  waitForDependency,

  waitAll:
  waitForDependencies,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  getDependencyDiagnostics,

  health:
  getDependencyHealthReport,

  snapshot:
  createDependencySnapshot,



  // ===================================
  // LIFECYCLE
  // ===================================

  initialize:
  initializeDependencySystem,

  reset:
  resetDependencySystem

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.DependenciesAPI =
  DependenciesAPI;

}
