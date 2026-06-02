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
// VALIDATION
// =====================================

function validateEmail(
  email
){

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  .test(
    String(email || "")
    .trim()
    .toLowerCase()
  );

}



function validatePassword(
  password
){

  return (

    String(password || "")
    .trim()
    .length >=

    AUTH_RUNTIME_CONFIG
    .MIN_PASSWORD_LENGTH

  );

}



function validateToken(
  token
){

  return (

    typeof token ===
    "string"

    &&

    token.trim()
    .length >= 20

  );

}



function validateAuthSession(
  session
){

  if(

    !session ||

    typeof session !==
    "object"

  ){

    return false;

  }

  if(

    AUTH_RUNTIME_CONFIG
    .ENABLE_TOKEN_VALIDATION

    &&

    !validateToken(
      session.token
    )

  ){

    return false;

  }

  return (

    typeof session.user ===
    "object"

    &&

    session.user !==
    null

    &&

    Number.isFinite(
      session.expiresAt
    )

  );

}



// =====================================
// SESSION
// =====================================

function createAuthSession({

  user = null,

  token = null

} = {}){

  if(
    !validateToken(token)
  ){

    return null;

  }

  return freezeAuthObject({

    user:
    safeCloneAuth(user),

    token,

    expiresAt:

      Date.now() +

      AUTH_RUNTIME_CONFIG
      .SESSION_DURATION,

    createdAt:
    Date.now()

  });

}



function saveAuthSession(
  session
){

  try{

    if(
      !isStorageAvailable()
    ){

      return false;

    }

    if(
      !validateAuthSession(
        session
      )
    ){

      return false;

    }

    localStorage.setItem(

      AUTH_RUNTIME_CONFIG
      .STORAGE_KEY,

      JSON.stringify(session)

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function loadAuthSession(){

  try{

    if(
      !isStorageAvailable()
    ){

      return null;

    }

    const raw =
    localStorage.getItem(

      AUTH_RUNTIME_CONFIG
      .STORAGE_KEY

    );

    if(!raw){

      return null;

    }

    const parsed =
    JSON.parse(raw);

    if(
      !validateAuthSession(
        parsed
      )
    ){

      clearAuthSession();

      return null;

    }

    return parsed;

  }

  catch(error){

    clearAuthSession();

    return null;

  }

}



function clearAuthSession(){

  try{

    if(
      !isStorageAvailable()
    ){

      return false;

    }

    localStorage.removeItem(

      AUTH_RUNTIME_CONFIG
      .STORAGE_KEY

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function isSessionExpired(
  session
){

  return (
    !session ||
    Date.now() >=
    session.expiresAt
  );

}



function updateLastActivity(){

  authRuntimeState
  .lastActivityAt =
  Date.now();

  return true;

}



function isLoginBlocked(){

  return (

    authRuntimeState
    .loginBlockedUntil

    &&

    Date.now() <

    authRuntimeState
    .loginBlockedUntil

  );

}



function registerFailedLogin(){

  authRuntimeState
  .failedLoginAttempts++;

  if(

    authRuntimeState
    .failedLoginAttempts >=

    AUTH_RUNTIME_CONFIG
    .MAX_LOGIN_ATTEMPTS

  ){

    authRuntimeState
    .loginBlockedUntil =

      Date.now() +

      AUTH_RUNTIME_CONFIG
      .LOGIN_BLOCK_DURATION;

  }

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
// RESTORE
// =====================================

async function restoreAuthSession(){

  updateAuthRuntimeState({

    loading:true,

    error:null

  });

  try{

    const session =
    loadAuthSession();

    if(
      isSessionExpired(
        session
      )
    ){

      clearAuthSession();

      resetAuthRuntimeState();

      return false;

    }

    if(!session){

      resetAuthRuntimeState();

      return false;

    }

    updateAuthRuntimeState({

      authenticated:true,

      user:
      safeCloneAuth(
        session.user
      ),

      token:
      session.token,

      sessionExpiresAt:
      session.expiresAt,

      lastActivityAt:
      Date.now()

    });

    authRuntimeState
    .diagnostics
    .restored++;

    await emitAuthRuntimeEvent(

      AUTH_RUNTIME_EVENTS
      .SESSION_RESTORED

    );

    return true;

  }

  catch(error){

    authRuntimeState
    .diagnostics
    .errors++;

    resetAuthRuntimeState();

    return false;

  }

  finally{

    updateAuthRuntimeState({

      initialized:true,

      loading:false

    });

  }

}



// =====================================
// LOGIN
// =====================================

async function login({

  email = "",

  password = ""

} = {}){

  updateAuthRuntimeState({

    loading:true,

    error:null

  });

  try{

    if(
      isLoginBlocked()
    ){

      throw new Error(
        "LOGIN_BLOCKED"
      );

    }

    if(
      !validateEmail(email)
    ){

      registerFailedLogin();

      throw new Error(
        "INVALID_EMAIL"
      );

    }

    if(
      !validatePassword(password)
    ){

      registerFailedLogin();

      throw new Error(
        "INVALID_PASSWORD"
      );

    }

    const user =
    freezeAuthObject({

      id:
      createUniqueId(
        "user"
      ),

      email:
      String(email)
      .trim()
      .toLowerCase()

    });

    const token =
    createSecureToken();

    const session =
    createAuthSession({

      user,

      token

    });

    if(
      !saveAuthSession(
        session
      )
    ){

      throw new Error(
        "SESSION_SAVE_FAILED"
      );

    }

    authRuntimeState
    .failedLoginAttempts =
    0;

    authRuntimeState
    .loginBlockedUntil =
    null;

    updateAuthRuntimeState({

      authenticated:true,

      user:
      safeCloneAuth(user),

      token,

      sessionExpiresAt:
      session.expiresAt,

      lastActivityAt:
      Date.now()

    });

    authRuntimeState
    .diagnostics
    .logins++;

    await emitAuthRuntimeEvent(

      AUTH_RUNTIME_EVENTS
      .LOGIN,

      {

        userId:
        user.id

      }

    );

    return true;

  }

  catch(error){

    authRuntimeState
    .diagnostics
    .errors++;

    resetAuthRuntimeState();

    updateAuthRuntimeState({

      error:
      getSafeErrorMessage(
        error
      )

    });

    return false;

  }

  finally{

    updateAuthRuntimeState({

      loading:false

    });

  }

}



// =====================================
// REGISTER
// =====================================

async function register({

  email = "",

  password = ""

} = {}){

  const success =
  await login({

    email,

    password

  });

  if(success){

    authRuntimeState
    .diagnostics
    .registrations++;

    await emitAuthRuntimeEvent(

      AUTH_RUNTIME_EVENTS
      .REGISTER

    );

  }

  return success;

}



// =====================================
// LOGOUT
// =====================================

async function logout(){

  updateAuthRuntimeState({

    loading:true,

    error:null

  });

  try{

    clearAuthSession();

    resetAuthRuntimeState();

    authRuntimeState
    .failedLoginAttempts =
    0;

    authRuntimeState
    .loginBlockedUntil =
    null;

    authRuntimeState
    .diagnostics
    .logouts++;

    await emitAuthRuntimeEvent(

      AUTH_RUNTIME_EVENTS
      .LOGOUT

    );

    return true;

  }

  catch(error){

    authRuntimeState
    .diagnostics
    .errors++;

    return false;

  }

  finally{

    updateAuthRuntimeState({

      loading:false

    });

  }

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
