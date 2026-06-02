// =====================================
// RIGO AI
// BOOTSTRAP MANAGER
// =====================================

import {
  registerBootstrapSystem,
  removeBootstrapSystem,
  getBootstrapSystem,
  listBootstrapSystems
}
from "./bootstrap-registry.js";

import {
  bootBootstrapSystems,
  shutdownBootstrapSystems,
  recoverBootstrapSystems,
  resetBootstrapSystems
}
from "./bootstrap-lifecycle.js";

import {
  getBootstrapDiagnostics,
  createBootstrapSnapshot
}
from "./bootstrap-diagnostics.js";



// =====================================
// API
// =====================================

export const BootstrapManager =
Object.freeze({



  // ===============================
  // REGISTRY
  // ===============================

  register:
  registerBootstrapSystem,



  remove:
  removeBootstrapSystem,



  get:
  getBootstrapSystem,



  list:
  listBootstrapSystems,



  // ===============================
  // LIFECYCLE
  // ===============================

  boot:
  bootBootstrapSystems,



  shutdown:
  shutdownBootstrapSystems,



  recover:
  recoverBootstrapSystems,



  reset:
  resetBootstrapSystems,



  // ===============================
  // DIAGNOSTICS
  // ===============================

  diagnostics:
  getBootstrapDiagnostics,



  snapshot:
  createBootstrapSnapshot

});



// =====================================
// EXPORTS
// =====================================

export default
BootstrapManager;
