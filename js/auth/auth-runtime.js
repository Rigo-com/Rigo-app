// =====================================
// RIGO AI
// AUTH RUNTIME SYSTEM
// ENTERPRISE AUTH ENGINE FINAL
// =====================================



// =====================================
// AUTH CONFIG
// =====================================

const AUTH_RUNTIME_CONFIG =
deepFreeze({

  STORAGE_KEY:
  "rigo_auth_session",

  SESSION_DURATION:
  1000 * 60 * 60 * 24 * 7,

  MIN_PASSWORD_LENGTH:
  6,

  ENABLE_EVENTS:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_SESSION_MONITORING:true,

  SESSION_CHECK_INTERVAL:
  60000

});



// =====================================
// AUTH EVENTS
// =====================================

const AUTH_RUNTIME_EVENTS =
Object.freeze({

  LOGIN:
  "auth.login",

  LOGOUT:
  "auth.logout",

  SESSION_RESTORED:
  "auth.session.restored",

  SESSION_EXPIRED:
  "auth.session.expired",

  SESSION_CLEARED:
  "auth.session.cleared",

  AUTH_ERROR:
  "auth.error"

});



// =====================================
// VALID AUTH STATE KEYS
// =====================================

const VALID_AUTH_STATE_KEYS =
new Set([

  "initialized",

  "initializing",

  "authenticated",

  "loading",

  "user",

  "token",

  "sessionExpiresAt",

  "error"

]);



// =====================================
// AUTH STATE
// =====================================

const authRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  authenticated:false,

  loading:false,

  user:null,

  token:null,

  sessionExpiresAt:null,

  error:null,

  diagnostics:{

    logins:0,

    logouts:0,

    restored:0,

    expired:0,

    errors:0

  },

  sessionMonitorTimer:null

});



// =====================================
// HELPERS
// =====================================

async function emitAuthRuntimeEvent(
  eventName,
  payload = {}
){

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

    return structuredClone(
      value
    );

  }

  catch(error){

    try{

      return JSON.parse(
        JSON.stringify(
          value
        )
      );

    }

    catch(cloneError){

      return null;

    }

  }

}



// =====================================
// STORAGE AVAILABILITY
// =====================================

function isStorageAvailable(){

  try{

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



// =====================================
// CREATE UNIQUE ID
// =====================================

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
    "undefined" &&

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



// =====================================
// VALIDATE STATE
// =====================================

function validateAuthStateValue(
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
// UPDATE STATE
// =====================================

function updateAuthRuntimeState(
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
// RESET STATE
// =====================================

function resetAuthRuntimeState(){

  updateAuthRuntimeState({

    authenticated:false,

    loading:false,

    user:null,

    token:null,

    sessionExpiresAt:null,

    error:null

  });

}



// =====================================
// GET STATE
// =====================================

function getAuthRuntimeState(){

  return safeCloneAuth({

    initialized:
    authRuntimeState
    .initialized,

    initializing:
    authRuntimeState
    .initializing,

    authenticated:
    authRuntimeState
    .authenticated,

    loading:
    authRuntimeState
    .loading,

    user:
    authRuntimeState
    .user,

    token:
    authRuntimeState
    .token,

    sessionExpiresAt:

      authRuntimeState
      .sessionExpiresAt,

    error:
    authRuntimeState
    .error,

    diagnostics:

      authRuntimeState
      .diagnostics

  });

}



// =====================================
// VALIDATE EMAIL
// =====================================

function validateEmail(
  email
){

  const normalizedEmail =
  String(
    email || ""
  )
  .trim()
  .toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  .test(
    normalizedEmail
  );

}



// =====================================
// VALIDATE PASSWORD
// =====================================

function validatePassword(
  password
){

  const normalizedPassword =
  String(
    password || ""
  )
  .trim();

  return (

    normalizedPassword.length >=

    AUTH_RUNTIME_CONFIG
    .MIN_PASSWORD_LENGTH

  );

}



// =====================================
// VALIDATE SESSION
// =====================================

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

  return (

    typeof session.token ===
    "string" &&

    typeof session.user ===
    "object" &&

    Number.isFinite(
      session.expiresAt
    )

  );

}



// =====================================
// CREATE SESSION
// =====================================

function createAuthSession({

  user = null,

  token = null

} = {}){

  const normalizedToken =
  String(
    token || ""
  )
  .trim();

  if(!normalizedToken){

    return null;

  }

  return deepFreeze({

    user:
    safeCloneAuth(
      user
    ),

    token:
    normalizedToken,

    expiresAt:

      Date.now() +

      AUTH_RUNTIME_CONFIG
      .SESSION_DURATION

  });

}



// =====================================
// SAVE SESSION
// =====================================

function saveAuthSession(
  session
){

  try{

    if(
      !isStorageAvailable()
    ){

      return false;

    }

    const valid =
    validateAuthSession(
      session
    );

    if(!valid){

      return false;

    }

    localStorage.setItem(

      AUTH_RUNTIME_CONFIG
      .STORAGE_KEY,

      JSON.stringify(
        session
      )

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// LOAD SESSION
// =====================================

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
    JSON.parse(
      raw
    );

    const valid =
    validateAuthSession(
      parsed
    );

    if(!valid){

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



// =====================================
// CLEAR SESSION
// =====================================

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

    emitAuthRuntimeEvent(

      AUTH_RUNTIME_EVENTS
      .SESSION_CLEARED

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SESSION EXPIRATION
// =====================================

function isSessionExpired(
  session
){

  if(!session){

    return true;

  }

  const expiresAt =
  Number(
    session.expiresAt
  );

  if(
    !Number.isFinite(
      expiresAt
    )
  ){

    return true;

  }

  return (
    Date.now() >=
    expiresAt
  );

}



// =====================================
// SESSION MONITOR
// =====================================

function startSessionMonitor(){

  if(

    !AUTH_RUNTIME_CONFIG
    .ENABLE_SESSION_MONITORING

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

    const session =
    loadAuthSession();

    if(
      !session
    ){

      return;
    }

    if(
      isSessionExpired(
        session
      )
    ){

      authRuntimeState
      .diagnostics
      .expired++;

      await emitAuthRuntimeEvent(

        AUTH_RUNTIME_EVENTS
        .SESSION_EXPIRED

      );

      await logout();

    }

  },

  AUTH_RUNTIME_CONFIG
  .SESSION_CHECK_INTERVAL);

  return true;

}



// =====================================
// RESTORE SESSION
// =====================================

async function restoreAuthSession(){

  updateAuthRuntimeState({

    loading:true,

    error:null

  });

  try{

    const session =
    loadAuthSession();

    if(!session){

      resetAuthRuntimeState();

      return false;

    }

    if(
      isSessionExpired(
        session
      )
    ){

      clearAuthSession();

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
      session.expiresAt

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

    const validEmail =
    validateEmail(
      email
    );

    if(!validEmail){

      throw new Error(
        "Invalid email"
      );

    }

    const validPassword =
    validatePassword(
      password
    );

    if(!validPassword){

      throw new Error(
        "Invalid password"
      );

    }

    const user =
    deepFreeze({

      id:createUniqueId(
        "user"
      ),

      email:
      String(email)
      .trim()
      .toLowerCase()

    });

    const token =
    createUniqueId(
      "token"
    );

    const session =
    createAuthSession({

      user,

      token

    });

    if(!session){

      throw new Error(
        "SESSION_FAILED"
      );

    }

    const saved =
    saveAuthSession(
      session
    );

    if(!saved){

      throw new Error(
        "SESSION_SAVE_FAILED"
      );

    }

    updateAuthRuntimeState({

      authenticated:true,

      user:
      safeCloneAuth(
        user
      ),

      token,

      sessionExpiresAt:
      session.expiresAt

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
      String(error)

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

  return login({

    email,

    password

  });

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

    updateAuthRuntimeState({

      error:
      String(error)

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

    updateAuthRuntimeState({

      error:
      String(error)

    });

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
  .diagnostics = {

    logins:0,

    logouts:0,

    restored:0,

    expired:0,

    errors:0

  };

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const AuthRuntime =
Object.freeze({

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
