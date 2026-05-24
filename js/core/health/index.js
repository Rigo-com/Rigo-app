// =====================================
// RIGO AI
// HEALTH INDEX
// =====================================



// =====================================
// HEALTH API
// =====================================

const HealthAPI =
Object.freeze({



  // ===================================
  // SYSTEM
  // ===================================

  system:
  HealthSystem,



  // ===================================
  // RUNTIME
  // ===================================

  runtime:
  HealthRuntime,



  // ===================================
  // MONITOR
  // ===================================

  monitor:
  HealthMonitor,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  HealthDiagnostics,



  // ===================================
  // HELPERS
  // ===================================

  run:
  HealthRuntime
  .run,

  start:
  HealthSystem
  .start,

  stop:
  HealthSystem
  .stop,

  initialize:
  HealthSystem
  .initialize,

  reset:
  HealthSystem
  .reset

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.HealthAPI =
  HealthAPI;

}
