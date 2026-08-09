// =====================================
// RIGO AI
// AUTH RUNTIME SYSTEM
// ENTERPRISE AUTH ENGINE FINAL
// =====================================

import {
  AUTH_RUNTIME_CONFIG
}
from "./auth-config.js";

import {
  authRuntimeState,
  updateAuthRuntimeState,
  resetAuthRuntimeState,
  getAuthRuntimeState
}
from "./auth-state.js";

import {
  loadAuthSession,
  clearAuthSession,
  isSessionExpired
}
from "./auth-session.js";

import {
  restoreAuthSession,
  login,
  register,
  logout
}
from "./auth-actions.js";

import {
  freezeAuthObject,
  isBrowserEnvironment
}
from "./auth-utils.js";


// =====================================
// SESSION MONITOR
// =====================================

function stopSessionMonitor(){

  if(
    authRuntimeState
    .sessionMonitorTimer
  ){

    clearInterval(
      authRuntimeState
      .sessionMonitorTimer
    );

    authRuntimeState
    .sessionMonitorTimer =
    null;

  }

  return true;

}


function startSessionMonitor(){

  if(
    !isBrowserEnvironment()
  ){

    return false;

  }

  stopSessionMonitor();

  authRuntimeState
  .sessionMonitorTimer =
  setInterval(async() => {

    if(
      !authRuntimeState
      .authenticated
    ){

      return;

    }

    const session =
    loadAuthSession();

    if(
      isSessionExpired(
        session
      )
    ){

      authRuntimeState
      .diagnostics
      .expired++;

      await logout();

    }

  },

  AUTH_RUNTIME_CONFIG
  .SESSION_CHECK_INTERVAL);

  return true;

}


// =====================================
// INITIALIZE
// =====================================

async function initializeAuthRuntime(){

  if(
    authRuntimeState.initialized ||
    authRuntimeState.initializing
  ){

    return true;

  }

  updateAuthRuntimeState({
    initializing:true,
    error:null
  });

  try{

    const restored =
    await restoreAuthSession();

    startSessionMonitor();

    authRuntimeState
    .initialized =
    true;

    return restored;

  }
  catch(error){

    authRuntimeState
    .diagnostics
    .errors++;

    return false;

  }
  finally{

    updateAuthRuntimeState({
      initializing:false
    });

  }

}


// =====================================
// SHUTDOWN
// =====================================

async function shutdownAuthRuntime(){

  stopSessionMonitor();

  authRuntimeState
  .initialized =
  false;

  authRuntimeState
  .initializing =
  false;

  return true;

}


// =====================================
// RESET
// =====================================

function resetAuthRuntime(){

  stopSessionMonitor();

  clearAuthSession();

  resetAuthRuntimeState();

  authRuntimeState
  .initialized =
  false;

  authRuntimeState
  .initializing =
  false;

  authRuntimeState
  .failedLoginAttempts =
  0;

  authRuntimeState
  .loginBlockedUntil =
  null;

  authRuntimeState
  .diagnostics = {
    logins:0,
    logouts:0,
    registrations:0,
    restored:0,
    expired:0,
    blocked:0,
    errors:0
  };

  return true;

}


// =====================================
// PUBLIC API
// =====================================

const AuthRuntime =
freezeAuthObject({

  initialize:
  initializeAuthRuntime,

  shutdown:
  shutdownAuthRuntime,

  login,

  register,

  logout,

  restore:
  restoreAuthSession,

  status:
  getAuthRuntimeState,

  reset:
  resetAuthRuntime

});


// =====================================
// EXPORTS
// =====================================

export {
  AuthRuntime,
  initializeAuthRuntime,
  shutdownAuthRuntime,
  startSessionMonitor,
  stopSessionMonitor,
  login,
  register,
  logout,
  restoreAuthSession,
  getAuthRuntimeState,
  resetAuthRuntime
};

export default
AuthRuntime;
