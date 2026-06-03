// =====================================
// RIGO AI
// COMMUNICATION CONFIG
// FOUNDATION LAYER
// =====================================



// =====================================
// COMMUNICATION LIMITS
// =====================================

const COMMUNICATION_LIMITS =
Object.freeze({

  MAX_ACTIVE_REQUESTS:
  100,

  MAX_ABORT_CONTROLLERS:
  100,

  MAX_HASH_CACHE:
  5000,

  MAX_CACHE_ENTRIES:
  1000,

  MAX_STREAMS:
  50,

  MAX_RETRIES:
  3

});



// =====================================
// COMMUNICATION TIMERS
// =====================================

const COMMUNICATION_TIMERS =
Object.freeze({

  REQUEST_TIMEOUT:
  30000,

  STREAM_TIMEOUT:
  60000,

  RETRY_DELAY:
  1000,

  HEALTH_INTERVAL:
  30000,

  CACHE_TTL:
  600000,

  HASH_TTL:
  600000

});



// =====================================
// COMMUNICATION FEATURES
// =====================================

const COMMUNICATION_FEATURES =
Object.freeze({

  ENABLE_STREAMING:
  true,

  ENABLE_ABORT:
  true,

  ENABLE_RETRIES:
  true,

  ENABLE_HEALTH_CHECKS:
  true,

  ENABLE_CACHE:
  true,

  ENABLE_DIAGNOSTICS:
  true

});



// =====================================
// COMMUNICATION EVENTS
// =====================================

const COMMUNICATION_EVENTS =
Object.freeze({

  INITIALIZED:
  "communication.initialized",

  DESTROYED:
  "communication.destroyed",

  REQUEST_STARTED:
  "communication.request.started",

  REQUEST_COMPLETED:
  "communication.request.completed",

  REQUEST_FAILED:
  "communication.request.failed",

  REQUEST_ABORTED:
  "communication.request.aborted",

  STREAM_STARTED:
  "communication.stream.started",

  STREAM_UPDATED:
  "communication.stream.updated",

  STREAM_COMPLETED:
  "communication.stream.completed",

  STREAM_ABORTED:
  "communication.stream.aborted",

  HEALTH_CHANGED:
  "communication.health.changed",

  CACHE_CLEARED:
  "communication.cache.cleared"

});



// =====================================
// PUBLIC API
// =====================================

const CommunicationConfig =
Object.freeze({

  limits:
  COMMUNICATION_LIMITS,

  timers:
  COMMUNICATION_TIMERS,

  features:
  COMMUNICATION_FEATURES,

  events:
  COMMUNICATION_EVENTS

});



// =====================================
// EXPORTS
// =====================================

export {

  COMMUNICATION_LIMITS,

  COMMUNICATION_TIMERS,

  COMMUNICATION_FEATURES,

  COMMUNICATION_EVENTS,

  CommunicationConfig

};

export default
CommunicationConfig;
