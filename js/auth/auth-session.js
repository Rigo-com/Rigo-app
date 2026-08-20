// =====================================
// RIGO AI
// AUTH SESSION GUARDS
// =====================================

import {
  AUTH_RUNTIME_CONFIG
}
from "./auth-config.js";

import {
  authRuntimeState
}
from "./auth-state.js";



// =====================================
// ACTIVITY
// =====================================

export function updateLastActivity(){

  authRuntimeState.lastActivityAt =
  Date.now();

  return true;

}



// =====================================
// LOGIN BLOCKING
// =====================================

export function isLoginBlocked(){

  return Boolean(

    authRuntimeState.loginBlockedUntil

    &&

    Date.now() <
    authRuntimeState.loginBlockedUntil

  );

}

export function registerFailedLogin(){

  authRuntimeState.failedLoginAttempts++;

  if(
    authRuntimeState.failedLoginAttempts >=
    AUTH_RUNTIME_CONFIG.MAX_LOGIN_ATTEMPTS
  ){

    authRuntimeState.loginBlockedUntil =
    Date.now() +
    AUTH_RUNTIME_CONFIG.LOGIN_BLOCK_DURATION;

  }

  return authRuntimeState.failedLoginAttempts;

}

export function clearLoginBlock(){

  authRuntimeState.failedLoginAttempts =
  0;

  authRuntimeState.loginBlockedUntil =
  null;

  return true;

}
