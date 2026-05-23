// =====================================
// RIGO AI
// LIFECYCLE INDEX
// =====================================



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  // ===================================
  // LIFECYCLE
  // ===================================

  window.AppLifecycle =
  AppLifecycle;



  // ===================================
  // STARTUP
  // ===================================

  window.startApp =
  startApp;

  window.createStartupSnapshot =
  createStartupSnapshot;



  // ===================================
  // BOOTSTRAP
  // ===================================

  window.initializeApp =
  initializeApp;

  window.createBootstrapSnapshot =
  createBootstrapSnapshot;



  // ===================================
  // SHUTDOWN
  // ===================================

  window.shutdownApp =
  shutdownApp;

  window.cleanupApp =
 cleanupApp;

  window.createShutdownSnapshot =
  createShutdownSnapshot;



  // ===================================
  // ENVIRONMENT
  // ===================================

  window.validateAppEnvironment =
  validateAppEnvironment;



  // ===================================
  // MESSAGES
  // ===================================

  window.handleSendMessage =
  handleSendMessage;

  window.createMessageRuntimeSnapshot =
  createMessageRuntimeSnapshot;



  // ===================================
  // DIAGNOSTICS
  // ===================================

  window.getAppDiagnostics =
  getAppDiagnostics;

  window.createAppDiagnosticsSnapshot =
  createAppDiagnosticsSnapshot;



  // ===================================
  // HEALTH
  // ===================================

  window.runAppHealthcheck =
  runAppHealthcheck;

  window.getHealthDiagnostics =
  getHealthDiagnostics;

}
