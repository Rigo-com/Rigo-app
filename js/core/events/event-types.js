// =====================================
// RIGO AI
// EVENT TYPES
// =====================================



// =====================================
// PRIORITIES
// =====================================

const SYSTEM_EVENT_PRIORITIES =
Object.freeze({

  LOW: 1,

  NORMAL: 5,

  HIGH: 10,

  CRITICAL: 20

});



// =====================================
// CONFIG
// =====================================

const SYSTEM_EVENTS_CONFIG =
Object.freeze({

  MAX_LISTENERS:
  100,

  MAX_RETRIES:
  3,

  MAX_EVENT_QUEUE:
  1000,

  MAX_EVENT_HISTORY:
  1000,

  MAX_THROTTLED_EVENTS:
  1000,

  EVENT_TIMEOUT:
  5000,

  THROTTLE_CLEANUP_INTERVAL:
  60000,

  ENABLE_HISTORY:
  true,

  ENABLE_RETRIES:
  true,

  ENABLE_THROTTLING:
  true

});



// =====================================
// APP EVENTS
// =====================================

const APP_EVENTS =
Object.freeze({

  INITIALIZED:
  "app.initialized",

  BOOT_STARTED:
  "app.boot.started",

  BOOT_COMPLETED:
  "app.boot.completed",

  BOOT_FAILED:
  "app.boot.failed",

  READY:
  "app.ready",

  SHUTDOWN:
  "app.shutdown"

});



// =====================================
// EXPORTS
// =====================================

export {

  SYSTEM_EVENT_PRIORITIES,

  SYSTEM_EVENTS_CONFIG,

  APP_EVENTS

};
