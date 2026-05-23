// =====================================
// RIGO AI
// CONTAINER INDEX
// =====================================



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  // ===================================
  // CORE
  // ===================================

  window.DependencyContainer =
  DependencyContainer;



  // ===================================
  // CONSTANTS
  // ===================================

  window.DEPENDENCY_CONTAINER_CONFIG =
  DEPENDENCY_CONTAINER_CONFIG;

  window.SERVICE_LIFECYCLE =
  SERVICE_LIFECYCLE;

  window.CONTAINER_EVENTS =
  CONTAINER_EVENTS;



  // ===================================
  // STATE
  // ===================================

  window.dependencyContainerState =
  dependencyContainerState;



  // ===================================
  // REGISTRY
  // ===================================

  window.registerService =
  registerService;

  window.removeService =
  removeService;



  // ===================================
  // RESOLUTION
  // ===================================

  window.resolveService =
  resolveService;

  window.resolveDependencies =
  resolveDependencies;

  window.createServiceInstance =
  createServiceInstance;



  // ===================================
  // SCOPES
  // ===================================

  window.getScopeContainer =
  getScopeContainer;

  window.detectCircularDependency =
  detectCircularDependency;



  // ===================================
  // HEALTH
  // ===================================

  window.resetDependencyContainer =
  resetDependencyContainer;

  window.getContainerDiagnostics =
  getContainerDiagnostics;

  window.initializeDependencyContainer =
  initializeDependencyContainer;

}
