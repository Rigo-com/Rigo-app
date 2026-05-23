// =====================================
// RIGO AI
// DEPENDENCY CONTAINER
// ENTERPRISE KERNEL FINAL
// =====================================



// =====================================
// PUBLIC API
// =====================================

const DependencyContainer =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  initialize:
  initializeDependencyContainer,

  reset:
  resetDependencyContainer,

  diagnostics:
  getContainerDiagnostics,



  // ===================================
  // REGISTRY
  // ===================================

  register:
  registerService,

  remove:
  removeService,

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



  // ===================================
  // SCOPES
  // ===================================

  getScope:
  getScopeContainer,



  // ===================================
  // LIFECYCLES
  // ===================================

  lifecycles:
  SERVICE_LIFECYCLE

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.DependencyContainer =
  DependencyContainer;

}
