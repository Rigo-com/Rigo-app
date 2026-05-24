// =====================================
// RIGO AI
// RUNTIME MANAGER CONFIG
// =====================================



const RUNTIME_MANAGER_CONFIG =
Object.freeze({



  // ===================================
  // FEATURES
  // ===================================

  ENABLE_HEALTH_SYNC:
  true,

  ENABLE_RECOVERY:
  true,

  ENABLE_DIAGNOSTICS:
  true,

  ENABLE_BOOT_PROTECTION:
  true,

  ENABLE_SHUTDOWN_COORDINATION:
  true,



  // ===================================
  // LIMITS
  // ===================================

  MAX_BOOT_RETRIES:
  3,

  MAX_RUNTIME_ERRORS:
  20,



  // ===================================
  // TIMERS
  // ===================================

  STARTUP_TIMEOUT:
  30000,

  SHUTDOWN_TIMEOUT:
  15000

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "RUNTIME_MANAGER_CONFIG",

    {

      value:
      RUNTIME_MANAGER_CONFIG,

      writable:false,

      configurable:false

    }

  );

}
