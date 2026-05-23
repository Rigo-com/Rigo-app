// =====================================
// RIGO AI
// RUNTIME INDEX
// ENTERPRISE RUNTIME EXPORTS
// =====================================



// =====================================
// RUNTIME API
// =====================================

const RuntimeAPI =
Object.freeze({



  // ===================================
  // CORE
  // ===================================

  manager:
  RuntimeManager,

  state:
  runtimeManagerState,



  // ===================================
  // BOOT
  // ===================================

  boot:
  bootRuntimeManager,

  shutdown:
  shutdownRuntimeManager,

  recover:
  recoverRuntimeManager,

  health:
  getRuntimeHealthReport,



  // ===================================
  // RUNTIME SYSTEMS
  // ===================================

  language:
  typeof LanguageRuntime !==
  "undefined"

  ?

  LanguageRuntime

  :

  null,



  files:
  typeof FileRuntime !==
  "undefined"

  ?

  FileRuntime

  :

  null,



  analytics:
  typeof AnalyticsRuntime !==
  "undefined"

  ?

  AnalyticsRuntime

  :

  null,



  // ===================================
  // INITIALIZERS
  // ===================================

  initializeLanguage:
  typeof initializeLanguageRuntime ===
  "function"

  ?

  initializeLanguageRuntime

  :

  null,



  initializeFiles:
  typeof initializeFileRuntime ===
  "function"

  ?

  initializeFileRuntime

  :

  null,



  initializeAnalytics:
  typeof initializeAnalyticsRuntime ===
  "function"

  ?

  initializeAnalyticsRuntime

  :

  null,



  // ===================================
  // BOOT SEQUENCE
  // ===================================

  createBootSequence:
  createRuntimeBootSequence

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RuntimeAPI =
  RuntimeAPI;

}
