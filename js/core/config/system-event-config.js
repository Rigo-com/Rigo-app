// =====================================
// RIGO AI
// SYSTEM EVENTS CONFIG
// =====================================



// =====================================
// CONFIG
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

  ENABLE_BATCHING:
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

  MAX_BATCH_SIZE:
  50,



  // ===================================
  // TIMERS
  // ===================================

  EVENT_TIMEOUT:
  30000,

  MAX_RETRIES:
  3,

  RETRY_DELAY:
  1000,

  BATCH_TIMEOUT:
  100,

  THROTTLE_CLEANUP_INTERVAL:
  60000

});



// =====================================
// EXPORTS
// =====================================

export default
SYSTEM_EVENTS_CONFIG;
