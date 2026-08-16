import { LIFECYCLE_STATES } from "./lifecycle-config.js";

const lifecycleState = Object.seal({
  state: LIFECYCLE_STATES.CREATED,
  initialized: false,
  running: false,
  shuttingDown: false,
  startedAt: null,
  stoppedAt: null,
  lastError: null,
  startupPromise: null,
  shutdownPromise: null
});

const updateLifecycleState = updates => (Object.assign(lifecycleState, updates), true);
const setLifecycleState = state => (lifecycleState.state = state, true);
const setLifecycleError = error => (lifecycleState.lastError = error, true);
const clearLifecycleError = () => (lifecycleState.lastError = null, true);
const resetLifecycleState = () => {
  Object.assign(lifecycleState, {
    state: LIFECYCLE_STATES.CREATED, initialized: false, running: false,
    shuttingDown: false, startedAt: null, stoppedAt: null, lastError: null,
    startupPromise: null, shutdownPromise: null
  });
  return true;
};
const createLifecycleSnapshot = () => Object.freeze({
  state: lifecycleState.state,
  initialized: lifecycleState.initialized,
  running: lifecycleState.running,
  shuttingDown: lifecycleState.shuttingDown,
  startedAt: lifecycleState.startedAt,
  stoppedAt: lifecycleState.stoppedAt,
  lastError: lifecycleState.lastError,
  operations: Object.freeze({
    starting: Boolean(lifecycleState.startupPromise),
    shuttingDown: Boolean(lifecycleState.shutdownPromise)
  })
});

const LifecycleState = Object.freeze({
  update: updateLifecycleState, setState: setLifecycleState, setError: setLifecycleError,
  clearError: clearLifecycleError, isInitialized: () => lifecycleState.initialized,
  isRunning: () => lifecycleState.running, isShuttingDown: () => lifecycleState.shuttingDown,
  isBusy: () => Boolean(lifecycleState.startupPromise || lifecycleState.shutdownPromise),
  reset: resetLifecycleState, snapshot: createLifecycleSnapshot
});

export { lifecycleState, updateLifecycleState, setLifecycleState, setLifecycleError, clearLifecycleError, resetLifecycleState, createLifecycleSnapshot, LifecycleState };
export default LifecycleState;
