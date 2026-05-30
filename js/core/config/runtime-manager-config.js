// =====================================
// RIGO AI
// RUNTIME MANAGER CONFIG
// =====================================



// =====================================
// CONFIG
// =====================================

const RUNTIME_MANAGER_CONFIG =
Object.freeze(
Object.seal({



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
  30000,

  BOOT_RETRY_DELAY:
  2000,

  RECOVERY_DELAY:
  3000,

  HEALTHCHECK_INTERVAL:
  30000,

  HEALTH_TIMEOUT:
  10000

}));



// =====================================
// VALIDATION
// =====================================

function isValidRuntimeManagerConfigKey(
  key
){

  return Object.prototype
  .hasOwnProperty
  .call(

    RUNTIME_MANAGER_CONFIG,

    String(key)

  );

}



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

  Object.defineProperty(

    window,

    "isValidRuntimeManagerConfigKey",

    {

      value:
      isValidRuntimeManagerConfigKey,

      writable:false,

      configurable:false

    }

  );

}
