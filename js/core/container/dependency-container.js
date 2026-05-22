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

  initialize:
  initializeDependencyContainer,

  register:
  registerService,

  resolve:
  resolveService,

  remove:
  removeService,

  reset:
  resetDependencyContainer,

  diagnostics:
  getContainerDiagnostics,

  lifecycles:
  SERVICE_LIFECYCLE

});
