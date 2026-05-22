// =====================================
// DEPENDENCY SYSTEM
// =====================================



// =====================================
// PUBLIC API
// =====================================

const DependencySystem =
Object.freeze({

  register:
  registerDependency,

  resolve:
  resolveDependency,

  fail:
  failDependency,

  isResolved:
  isDependencyResolved,

  wait:
  waitForDependency,

  validate:
  validateDependencyRegistry,

  diagnostics:
  getDependencyDiagnostics

});
