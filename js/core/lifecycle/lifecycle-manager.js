import { LIFECYCLE_STATES } from "./lifecycle-config.js";
import LifecycleState from "./lifecycle-state.js";
import LifecycleStartup from "./lifecycle-startup.js";
import LifecycleShutdown from "./lifecycle-shutdown.js";

async function initializeLifecycle(){
  if (LifecycleState.isInitialized()) return true;
  LifecycleState.update({ initialized: true, state: LIFECYCLE_STATES.INITIALIZED });
  return true;
}
async function startLifecycle(){ await initializeLifecycle(); return LifecycleStartup.execute(); }
async function shutdownLifecycle(){ return LifecycleShutdown.execute(); }
async function restartLifecycle(){ return await shutdownLifecycle() && startLifecycle(); }
async function resetLifecycle(){ await shutdownLifecycle(); LifecycleState.reset(); return true; }
const createLifecycleSnapshot = () => Object.freeze({ lifecycle: LifecycleState.snapshot(), timestamp: Date.now() });
const LifecycleManager = Object.freeze({ initialize: initializeLifecycle, start: startLifecycle, shutdown: shutdownLifecycle, restart: restartLifecycle, reset: resetLifecycle, snapshot: createLifecycleSnapshot });
export { initializeLifecycle, startLifecycle, shutdownLifecycle, restartLifecycle, resetLifecycle, createLifecycleSnapshot, LifecycleManager };
export default LifecycleManager;
