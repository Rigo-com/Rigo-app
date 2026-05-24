// =====================================
// RIGO AI
// SYSTEM EVENTS CONFIG
// =====================================



const SYSTEM_EVENTS_CONFIG =
Object.freeze({



  // ===================================
  // FEATURES
  // ===================================

  ENABLE_HISTORY:
  true,

  ENABLE_WILDCARDS:
  true,

  ENABLE_PRIORITIES:
  true,

  ENABLE_REPLAY:
  true,

  ENABLE_MIDDLEWARE:
  true,

  ENABLE_THROTTLING:
  true,

  ENABLE_DIAGNOSTICS:
  true,

  ENABLE_QUEUE:
  true,

  ENABLE_RETRIES:
  true,



  // ===================================
  // LIMITS
  // ===================================

  MAX_EVENT_HISTORY:
  1000,

  MAX_LISTENERS:
  500,

  MAX_EVENT_QUEUE:
  1000,

  MAX_THROTTLED_EVENTS:
  1000,



  // ===================================
  // TIMERS
  // ===================================

  EVENT_TIMEOUT:
  15000,

  MAX_RETRIES:
  3,

  THROTTLE_CLEANUP_INTERVAL:
  60000

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

    "SYSTEM_EVENTS_CONFIG",

    {

      value:
      SYSTEM_EVENTS_CONFIG,

      writable:false,

      configurable:false

    }

  );

}
