// =====================================
// RIGO AI
// HEALTH CONFIG
// =====================================



// =====================================
// VERSION
// =====================================

const HEALTH_VERSION =
"1.0.0";



// =====================================
// HEALTH STATES
// =====================================

const HEALTH_STATES =
Object.freeze({

  HEALTHY:
  "healthy",

  WARNING:
  "warning",

  CRITICAL:
  "critical",

  UNKNOWN:
  "unknown"

});



// =====================================
// HEALTH EVENTS
// =====================================

const HEALTH_EVENTS =
Object.freeze({

  CHECK_STARTED:
  "health.check.started",

  CHECK_COMPLETED:
  "health.check.completed",

  WARNING:
  "health.warning",

  CRITICAL:
  "health.critical"

});



// =====================================
// THRESHOLDS
// =====================================

const HEALTH_THRESHOLDS =
Object.freeze({

  HEALTHY_SCORE:
  90,

  WARNING_SCORE:
  70,

  CRITICAL_SCORE:
  50

});



// =====================================
// CONFIG
// =====================================

const HEALTH_CONFIG =
Object.freeze({

  CHECK_INTERVAL:
  30000,

  MAX_WARNINGS:
  100,

  MAX_ERRORS:
  100,

  MAX_HISTORY:
  500

});



// =====================================
// VALIDATION
// =====================================

function isValidHealthState(
  state
){

  return Object.values(
    HEALTH_STATES
  )
  .includes(
    String(state)
  );

}



function isValidHealthEvent(
  event
){

  return Object.values(
    HEALTH_EVENTS
  )
  .includes(
    String(event)
  );

}



// =====================================
// PUBLIC API
// =====================================

const HealthConfig =
Object.freeze({

  version:
  HEALTH_VERSION,

  states:
  HEALTH_STATES,

  events:
  HEALTH_EVENTS,

  thresholds:
  HEALTH_THRESHOLDS,

  config:
  HEALTH_CONFIG,

  validateState:
  isValidHealthState,

  validateEvent:
  isValidHealthEvent

});



// =====================================
// EXPORTS
// =====================================

export {

  HEALTH_VERSION,

  HEALTH_STATES,

  HEALTH_EVENTS,

  HEALTH_THRESHOLDS,

  HEALTH_CONFIG,

  isValidHealthState,

  isValidHealthEvent,

  HealthConfig

};

export default
HealthConfig;
