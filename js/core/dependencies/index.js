// =====================================
// RIGO AI
// DEPENDENCIES INDEX
// =====================================



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  // ===================================
  // SYSTEM
  // ===================================

  window.DependencySystem =
  DependencySystem;



  // ===================================
  // STATE
  // ===================================

  window.appDependencyRegistry =
  appDependencyRegistry;



  // ===================================
  // REGISTRY
  // ===================================

  window.registerDependency =
  registerDependency;

  window.resolveDependency =
  resolveDependency;

  window.failDependency =
  failDependency;

  window.getDependency =
  getDependency;

  window.getAllDependencies =
  getAllDependencies;



  // ===================================
  // STATUS
  // ===================================

  window.isDependencyResolved =
  isDependencyResolved;



  // ===================================
  // VALIDATION
  // ===================================

  window.validateDependencyRegistry =
  validateDependencyRegistry;

  window.validateCircularDependencies =
  validateCircularDependencies;

  window.validateMissingDependencies =
  validateMissingDependencies;



  // ===================================
  // WAITERS
  // ===================================

  window.waitForDependency =
  waitForDependency;

  window.waitForDependencies =
  waitForDependencies;



  // ===================================
  // DIAGNOSTICS
  // ===================================

  window.getDependencyDiagnostics =
  getDependencyDiagnostics;

  window.createDependencySnapshot =
  createDependencySnapshot;



  // ===================================
  // LIFECYCLE
  // ===================================

  window.initializeDependencySystem =
  initializeDependencySystem;

  window.resetDependencySystem =
  resetDependencySystem;

}
