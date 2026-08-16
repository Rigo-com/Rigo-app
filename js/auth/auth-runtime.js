import { AUTH_RUNTIME_CONFIG } from "./auth-config.js";
import { authRuntimeState, updateAuthRuntimeState, resetAuthRuntimeState, getAuthRuntimeState } from "./auth-state.js";
import { restoreAuthSession, login, register, logout } from "./auth-actions.js";
import { freezeAuthObject, isBrowserEnvironment } from "./auth-utils.js";

const authOperations = Object.seal({ initialize:null, shutdown:null });

function stopSessionMonitor(){
  if(authRuntimeState.sessionMonitorTimer) clearInterval(authRuntimeState.sessionMonitorTimer);
  authRuntimeState.sessionMonitorTimer = null;
  return true;
}

function startSessionMonitor(){
  if(!AUTH_RUNTIME_CONFIG.ENABLE_SESSION_MONITORING || !isBrowserEnvironment()) return false;
  stopSessionMonitor();
  authRuntimeState.sessionMonitorTimer = setInterval(async() => {
    if(!authRuntimeState.authenticated) return;
    const wasAuthenticated = authRuntimeState.authenticated;
    const restored = await restoreAuthSession();
    if(wasAuthenticated && !restored) authRuntimeState.diagnostics.expired++;
  }, AUTH_RUNTIME_CONFIG.SESSION_CHECK_INTERVAL);
  return true;
}

function initializeAuthRuntime(){
  if(authRuntimeState.initialized) return Promise.resolve(true);
  if(authOperations.initialize) return authOperations.initialize;
  authOperations.initialize = Promise.resolve().then(async() => {
    updateAuthRuntimeState({ initializing:true, error:null });
    try{
      await restoreAuthSession();
      startSessionMonitor();
      updateAuthRuntimeState({ initialized:true });
      return true;
    }
    catch(error){
      authRuntimeState.diagnostics.errors++;
      updateAuthRuntimeState({ initialized:false, error:String(error?.message || error) });
      return false;
    }
    finally{
      updateAuthRuntimeState({ initializing:false });
      authOperations.initialize = null;
    }
  });
  return authOperations.initialize;
}

const bootAuthRuntime = initializeAuthRuntime;

function shutdownAuthRuntime(){
  if(authOperations.shutdown) return authOperations.shutdown;
  authOperations.shutdown = Promise.resolve().then(async() => {
    if(authOperations.initialize) await authOperations.initialize;
    stopSessionMonitor();
    updateAuthRuntimeState({ initialized:false, initializing:false, loading:false });
    return true;
  }).finally(() => { authOperations.shutdown = null; });
  return authOperations.shutdown;
}

async function resetAuthRuntime(){
  await shutdownAuthRuntime();
  resetAuthRuntimeState();
  authRuntimeState.diagnostics = { logins:0, logouts:0, registrations:0, restored:0, expired:0, blocked:0, errors:0 };
  return true;
}

function snapshotAuthRuntime(){
  const state = getAuthRuntimeState();
  return Object.freeze({
    ...state,
    token:state.token ? "[REDACTED]" : null,
    monitoring:Boolean(authRuntimeState.sessionMonitorTimer),
    operations:Object.freeze({ initializing:Boolean(authOperations.initialize), shuttingDown:Boolean(authOperations.shutdown) }),
    timestamp:Date.now()
  });
}

const AuthRuntime = freezeAuthObject({
  id:"auth", priority:15,
  initialize:initializeAuthRuntime,
  boot:bootAuthRuntime,
  shutdown:shutdownAuthRuntime,
  login, register, logout,
  restore:restoreAuthSession,
  status:snapshotAuthRuntime,
  snapshot:snapshotAuthRuntime,
  reset:resetAuthRuntime
});

export { AuthRuntime, authOperations, initializeAuthRuntime, bootAuthRuntime, shutdownAuthRuntime, startSessionMonitor, stopSessionMonitor, login, register, logout, restoreAuthSession, getAuthRuntimeState, snapshotAuthRuntime, resetAuthRuntime };
export default AuthRuntime;
