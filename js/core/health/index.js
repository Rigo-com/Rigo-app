// =====================================
// RIGO AI
// HEALTH INDEX
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

  window.HealthSystem =
  HealthSystem;



  // ===================================
  // RUNTIME
  // ===================================

  window.runAppHealthcheck =
  runAppHealthcheck;



  // ===================================
  // MONITOR
  // ===================================

  window.startHealthchecks =
  startHealthchecks;

  window.stopHealthchecks =
  stopHealthchecks;

  window.executeHealthcheck =
  executeHealthcheck;



  // ===================================
  // DIAGNOSTICS
  // ===================================

  window.getHealthDiagnostics =
  getHealthDiagnostics;

  window.createHealthDiagnosticsSnapshot =
  createHealthDiagnosticsSnapshot;



  // ===================================
  // LIFECYCLE
  // ===================================

  window.initializeHealthSystem =
  initializeHealthSystem;

  window.resetHealthSystem =
  resetHealthSystem;

}
