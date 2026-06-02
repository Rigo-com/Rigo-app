// =====================================
// RIGO AI
// AUTH RUNTIME SYSTEM
// ENTERPRISE AUTH ENGINE FINAL
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  AUTH_RUNTIME_CONFIG,
  AUTH_RUNTIME_EVENTS
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



// =====================================
// HELPERS
// =====================================

async function emitAuthRuntimeEvent(
  eventName,
  payload = {}
){

  if(

    !AUTH_RUNTIME_CONFIG
    .ENABLE_EVENTS

  ){

    return false;

  }

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "auth-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function getSafeErrorMessage(
  error
){

  if(
    error instanceof Error
  ){

    return (
      error.message ||
      "UNKNOWN_ERROR"
    );

  }

  return String(
    error ||
    "UNKNOWN_ERROR"
  );

}



function safeCloneAuth(
  value
){

  try{

    if(
      typeof deepClone ===
      "function"
    ){

      return deepClone(
        value
      );

    }

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



function freezeAuthObject(
  value
){

  if(
    typeof deepFreeze ===
    "function"
  ){

    return deepFreeze(
      value
    );

  }

  return Object.freeze(
    value
  );

}



function isBrowserEnvironment(){

  return (

    typeof window !==
    "undefined"

    &&

    typeof localStorage !==
    "undefined"

  );

}



function isStorageAvailable(){

  try{

    if(
      !isBrowserEnvironment()
    ){

      return false;

    }

    const testKey =
    "__rigo_test__";

    localStorage.setItem(
      testKey,
      "1"
    );

    localStorage.removeItem(
      testKey
    );

    return true;

  }

  catch(error){

    return false;

  }

}



function createUniqueId(
  prefix = "id"
){

  const normalizedPrefix =
  String(
    prefix || "id"
  )
  .trim();

  if(

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.randomUUID ===
    "function"

  ){

    return (

      normalizedPrefix +

      "_" +

      crypto.randomUUID()

    );

  }

  return (

    normalizedPrefix +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function createSecureToken(){

  if(

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.getRandomValues ===
    "function"

  ){

    const array =
    new Uint8Array(32);

    crypto.getRandomValues(
      array
    );

    return Array.from(array)
    .map((byte) => {

      return byte
      .toString(16)
      .padStart(2,"0");

    })
    .join("");

  }

  return createUniqueId(
    "token"
  );

}



// =====================================
// SESSION MONITOR
// =====================================

function startSessionMonitor(){

  if(
    !isBrowserEnvironment()
  ){

    return false;

  }

  if(
    authRuntimeState
    .sessionMonitorTimer
  ){

    clearInterval(
      authRuntimeState
      .sessionMonitorTimer
    );

  }

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

    authRuntimeState
    .initialized ||

    authRuntimeState
    .initializing

  ){

    return authRuntimeState
    .authenticated;

  }

  updateAuthRuntimeState({

    initializing:true,

    error:null

  });

  try{

    const restored =
    await restoreAuthSession();

    startSessionMonitor();


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
// RESET
// =====================================

function resetAuthRuntime(){

  clearAuthSession();

  resetAuthRuntimeState();

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

  login,

  register,

  logout,

  restoreAuthSession,

  getAuthRuntimeState,

  resetAuthRuntime

};

export default
AuthRuntime;
