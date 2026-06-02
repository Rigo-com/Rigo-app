// =====================================
// RIGO AI
// AUTH STATE
// =====================================

import {
  VALID_AUTH_STATE_KEYS
}
from "./auth-config.js";



// =====================================
// STATE
// =====================================

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



// =====================================
// VALIDATION
// =====================================

export function validateAuthStateValue(
  key,
  value
){

  switch(key){

    case "initialized":

    case "initializing":

    case "authenticated":

    case "loading":

      return (
        typeof value ===
        "boolean"
      );

    case "user":

      return (

        value === null ||

        typeof value ===
        "object"

      );

    case "token":

      return (

        value === null ||

        typeof value ===
        "string"

      );

    case "sessionExpiresAt":

    case "lastActivityAt":

      return (

        value === null ||

        Number.isFinite(
          value
        )

      );

    case "error":

      return (

        value === null ||

        typeof value ===
        "string"

      );

    default:

      return false;

  }

}



// =====================================
// UPDATE
// =====================================

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

  Object.keys(
    updates
  )
  .forEach((key) => {

    if(
      !VALID_AUTH_STATE_KEYS
      .has(key)
    ){

      return;

    }

    const value =
    updates[key];

    const valid =
    validateAuthStateValue(
      key,
      value
    );

    if(!valid){

      return;

    }

    authRuntimeState[key] =
    value;

  });

  return true;

}



// =====================================
// RESET
// =====================================

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



// =====================================
// SNAPSHOT
// =====================================

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
