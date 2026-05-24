// =====================================
// RIGO AI
// CONTAINER INDEX
// =====================================



// =====================================
// CONTAINER API
// =====================================

const ContainerAPI =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  container:
  DependencyContainer,



  // ===================================
  // CONSTANTS
  // ===================================

  config:
  DEPENDENCY_CONTAINER_CONFIG,

  lifecycles:
  SERVICE_LIFECYCLE,

  events:
  CONTAINER_EVENTS,



  // ===================================
  // REGISTRY
  // ===================================

  register:
  registerService,

  remove:
  removeService,

  get:
  getRegisteredService,

  has:
  hasRegisteredService,

  services:
  getRegisteredServices,



  // ===================================
  // RESOLUTION
  // ===================================

  resolve:
  resolveService,

  resolveDependencies:
  resolveDependencies,

  createInstance:
  createServiceInstance,



  // ===================================
  // SCOPES
  // ===================================

  getScope:
  getScopeContainer,

  removeScope:
  removeScopeContainer,

  clearScopes:
  clearScopeContainers,

  detectCircular:
  detectCircularDependency,



  // ===================================
  // HEALTH
  // ===================================

  initialize:
  initializeDependencyContainer,

  reset:
  resetDependencyContainer,

  health:
  getContainerHealthReport,

  diagnostics:
  getContainerDiagnostics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.ContainerAPI =
  ContainerAPI;

}
