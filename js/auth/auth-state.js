// =====================================
// RIGO AI
// AUTH STATE
// =====================================

import {
  VALID_AUTH_STATE_KEYS
}
from "./auth-config.js";



export const authRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  authenticated:false,

  loading:false,

  user:null,

  token:null,

  sessionExpiresAt:null,

  lastActivityAt:null,

  error:null,

  failedLoginAttempts:0,

  loginBlockedUntil:null,

  diagnostics:{

    logins:0,

    logouts:0,

    registrations:0,

    restored:0,

    expired:0,

    blocked:0,

    errors:0

  },

  sessionMonitorTimer:null

});



export function updateAuthRuntimeState(
  updates = {}
){

  if(
    !updates ||
    typeof updates !==
    "object"
  ){

    return false;

  }

  Object.keys(updates)
  .forEach((key) => {

    if(
      !VALID_AUTH_STATE_KEYS
      .has(key)
    ){

      return;

    }

    authRuntimeState[key] =
    updates[key];

  });

  return true;

}



export function resetAuthRuntimeState(){

  updateAuthRuntimeState({

    authenticated:false,

    loading:false,

    user:null,

    token:null,

    sessionExpiresAt:null,

    lastActivityAt:null,

    error:null

  });

}



export function getAuthRuntimeState(){

  return {

    initialized:
    authRuntimeState.initialized,

    initializing:
    authRuntimeState.initializing,

    authenticated:
    authRuntimeState.authenticated,

    loading:
    authRuntimeState.loading,

    user:
    authRuntimeState.user,

    token:
    authRuntimeState.token,

    sessionExpiresAt:
    authRuntimeState.sessionExpiresAt,

    lastActivityAt:
    authRuntimeState.lastActivityAt,

    error:
    authRuntimeState.error,

    diagnostics:
    authRuntimeState.diagnostics

  };

}
