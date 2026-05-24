// =====================================
// RIGO AI
// LIFECYCLE INDEX
// =====================================



// =====================================
// PUBLIC EXPORTS
// =====================================

const LifecycleIndex =
Object.freeze({



  // ===================================
  // LIFECYCLE
  // ===================================

  lifecycle:
  AppLifecycle,



  // ===================================
  // STARTUP
  // ===================================

  startup:
  AppStartup,



  // ===================================
  // BOOTSTRAP
  // ===================================

  bootstrap:
  AppBootstrap,



  // ===================================
  // SHUTDOWN
  // ===================================

  shutdown:
  AppShutdown,



  // ===================================
  // ENVIRONMENT
  // ===================================

  environment:
  AppEnvironment,



  // ===================================
  // MESSAGES
  // ===================================

  messages:
  MessageRuntime,



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics:
  AppDiagnostics,



  // ===================================
  // HEALTH
  // ===================================

  health:
  HealthSystem

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.LifecycleIndex =
  LifecycleIndex;



  // ===================================
  // LIFECYCLE
  // ===================================

  window.AppLifecycle =
  AppLifecycle;



  // ===================================
  // STARTUP
  // ===================================

  window.AppStartup =
  AppStartup;



  // ===================================
  // BOOTSTRAP
  // ===================================

  window.AppBootstrap =
  AppBootstrap;



  // ===================================
  // SHUTDOWN
  // ===================================

  window.AppShutdown =
  AppShutdown;



  // ===================================
  // ENVIRONMENT
  // ===================================

  window.AppEnvironment =
  AppEnvironment;



  // ===================================
  // MESSAGES
  // ===================================

  window.MessageRuntime =
  MessageRuntime;



  // ===================================
  // DIAGNOSTICS
  // ===================================

  window.AppDiagnostics =
  AppDiagnostics;



  // ===================================
  // HEALTH
  // ===================================

  window.HealthSystem =
  HealthSystem;

}
