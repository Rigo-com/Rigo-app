import { LIFECYCLE_CONFIG, LIFECYCLE_STATES } from "./lifecycle-config.js";
import LifecycleState, { lifecycleState } from "./lifecycle-state.js";

async function shutdownRuntime(){
  try {
    const runtimeModule = await import("../runtime/index.js");
    const runtime = runtimeModule.default || runtimeModule.Runtime;
    return Boolean(runtime && await runtime.shutdown());
  } catch { return false; }
}

async function executeCleanup(){ return true; }

function executeShutdownSequence(){
  if (lifecycleState.shutdownPromise) return lifecycleState.shutdownPromise;
  if (lifecycleState.startupPromise) {
    return lifecycleState.startupPromise.then(() => executeShutdownSequence());
  }
  lifecycleState.shutdownPromise = Promise.resolve().then(async () => {
    LifecycleState.update({ shuttingDown: true, state: LIFECYCLE_STATES.SHUTTING_DOWN });
    let timer;
    try {
      const stopped = await Promise.race([
        shutdownRuntime(),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("LIFECYCLE SHUTDOWN TIMEOUT")), LIFECYCLE_CONFIG.SHUTDOWN_TIMEOUT); })
      ]);
      if (!stopped) throw new Error("RUNTIME SHUTDOWN FAILED");
      await executeCleanup();
      LifecycleState.update({ running: false, initialized: false, shuttingDown: false, state: LIFECYCLE_STATES.STOPPED, stoppedAt: Date.now(), lastError: null });
      return true;
    } catch (error) {
      LifecycleState.update({ running: false, shuttingDown: false, state: LIFECYCLE_STATES.FAILED, lastError: String(error) });
      return false;
    } finally {
      clearTimeout(timer);
      lifecycleState.shutdownPromise = null;
    }
  });
  return lifecycleState.shutdownPromise;
}

const LifecycleShutdown = Object.freeze({ execute: executeShutdownSequence });
export { shutdownRuntime, executeCleanup, executeShutdownSequence, LifecycleShutdown };
export default LifecycleShutdown;
