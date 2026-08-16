import { LIFECYCLE_CONFIG, LIFECYCLE_STATES } from "./lifecycle-config.js";
import LifecycleState, { lifecycleState } from "./lifecycle-state.js";

async function withTimeout(operation, timeout, message){
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeout); })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function getRuntime(){
  const runtimeModule = await import("../runtime/index.js");
  return runtimeModule.default || runtimeModule.Runtime;
}

async function initializeRuntime(){
  try { const runtime = await getRuntime(); return Boolean(runtime && await runtime.initialize()); }
  catch { return false; }
}

async function bootRuntime(){
  try { const runtime = await getRuntime(); return Boolean(runtime && await runtime.boot()); }
  catch { return false; }
}

async function rollbackRuntime(){
  try { const runtime = await getRuntime(); if (runtime) await runtime.shutdown(); }
  catch { /* best-effort rollback */ }
}

function executeStartupSequence(){
  if (LifecycleState.isRunning()) return Promise.resolve(true);
  if (lifecycleState.startupPromise) return lifecycleState.startupPromise;
  if (lifecycleState.shutdownPromise) {
    return lifecycleState.shutdownPromise.then(() => executeStartupSequence());
  }

  lifecycleState.startupPromise = Promise.resolve().then(async () => {
    LifecycleState.update({ state: LIFECYCLE_STATES.STARTING, shuttingDown: false });
    try {
      const started = await withTimeout((async () => {
        if (!await initializeRuntime()) throw new Error("RUNTIME INITIALIZATION FAILED");
        if (!await bootRuntime()) throw new Error("RUNTIME BOOT FAILED");
        return true;
      })(), LIFECYCLE_CONFIG.STARTUP_TIMEOUT, "LIFECYCLE STARTUP TIMEOUT");
      LifecycleState.update({ initialized: true, running: true, state: LIFECYCLE_STATES.RUNNING, startedAt: Date.now(), lastError: null });
      return started;
    } catch (error) {
      await rollbackRuntime();
      LifecycleState.update({ running: false, state: LIFECYCLE_STATES.FAILED, lastError: String(error) });
      return false;
    } finally {
      lifecycleState.startupPromise = null;
    }
  });
  return lifecycleState.startupPromise;
}

const LifecycleStartup = Object.freeze({ execute: executeStartupSequence });
export { initializeRuntime, bootRuntime, executeStartupSequence, LifecycleStartup };
export default LifecycleStartup;
