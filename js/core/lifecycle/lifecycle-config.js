const LIFECYCLE_VERSION = "1.0.0";

const LIFECYCLE_STATES = Object.freeze({
  CREATED: "created",
  INITIALIZED: "initialized",
  STARTING: "starting",
  RUNNING: "running",
  SHUTTING_DOWN: "shutting_down",
  STOPPED: "stopped",
  FAILED: "failed"
});

const LIFECYCLE_EVENTS = Object.freeze({
  INITIALIZED: "lifecycle.initialized",
  STARTED: "lifecycle.started",
  SHUTDOWN: "lifecycle.shutdown",
  RESTARTED: "lifecycle.restarted",
  FAILED: "lifecycle.failed"
});

const LIFECYCLE_CONFIG = Object.freeze({
  STARTUP_TIMEOUT: 30000,
  SHUTDOWN_TIMEOUT: 15000,
  RESTART_TIMEOUT: 5000
});

const isValidLifecycleState = state => Object.values(LIFECYCLE_STATES).includes(String(state));
const isValidLifecycleEvent = event => Object.values(LIFECYCLE_EVENTS).includes(String(event));

const LifecycleConfig = Object.freeze({
  version: LIFECYCLE_VERSION,
  states: LIFECYCLE_STATES,
  events: LIFECYCLE_EVENTS,
  config: LIFECYCLE_CONFIG,
  validateState: isValidLifecycleState,
  validateEvent: isValidLifecycleEvent
});

export { LIFECYCLE_VERSION, LIFECYCLE_STATES, LIFECYCLE_EVENTS, LIFECYCLE_CONFIG, isValidLifecycleState, isValidLifecycleEvent, LifecycleConfig };
export default LifecycleConfig;
