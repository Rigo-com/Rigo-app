// =====================================
// RIGO AI
// AUTH SYSTEM
// ULTIMATE PRODUCTION FINAL
// =====================================



// =====================================
// AUTH CONFIG
// =====================================

const AUTH_CONFIG =
deepFreeze({

  STORAGE_KEY:
  "rigo_auth_session",

  SESSION_DURATION:
  1000 * 60 * 60 * 24 * 7,

  MIN_PASSWORD_LENGTH:
  6

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

const authState =
Object.seal({

  initialized:false,

  initializing:false,

  authenticated:false,

  loading:false,

  user:null,

  token:null,

  sessionExpiresAt:null,

  error:null

});



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
// VALIDATE AUTH STATE VALUE
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
// UPDATE AUTH STATE
// =====================================

function updateAuthState(
  updates = {}
){

  if(

    !updates ||

    typeof updates !==
    "object" ||

    Array.isArray(
      updates
    )

  ){

    return false;

  }

  Object.keys(
    updates
  )
  .forEach((key) => {

    const validKey =

      VALID_AUTH_STATE_KEYS
      .has(key);

    if(!validKey){

      return;

    }

    const value =
    updates[key];

    const validValue =
    validateAuthStateValue(
      key,
      value
    );

    if(!validValue){

      return;

    }

    authState[key] =
    value;

  });

  return true;

}



// =====================================
// RESET AUTH STATE
// =====================================

function resetAuthState(){

  updateAuthState({

    authenticated:false,

    loading:false,

    user:null,

    token:null,

    sessionExpiresAt:null,

    error:null

  });

}



// =====================================
// GET AUTH STATE
// =====================================

function getAuthState(){

  return deepClone(
    authState
  );

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
    AUTH_CONFIG
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

  const hasValidUser =

    session.user &&

    typeof session.user ===
    "object";

  const hasValidToken =

    typeof session.token ===
    "string" &&

    session.token.trim()
    .length > 0;

  const hasValidExpiry =

    Number.isFinite(
      session.expiresAt
    );

  return (

    hasValidUser &&

    hasValidToken &&

    hasValidExpiry

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

  const expiresAt =

    Date.now() +

    AUTH_CONFIG
    .SESSION_DURATION;

  return deepFreeze({

    user:
    deepClone(user),

    token:
    normalizedToken,

    expiresAt

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

    const validSession =
    validateAuthSession(
      session
    );

    if(!validSession){

      return false;

    }

    localStorage.setItem(

      AUTH_CONFIG
      .STORAGE_KEY,

      JSON.stringify(
        session
      )

    );

    return true;

  }

  catch(error){

    logError(
      error
    );

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

    const rawSession =

      localStorage.getItem(

        AUTH_CONFIG
        .STORAGE_KEY

      );

    if(!rawSession){

      return null;

    }

    const parsedSession =
    JSON.parse(
      rawSession
    );

    const validSession =
    validateAuthSession(
      parsedSession
    );

    if(!validSession){

      clearAuthSession();

      return null;

    }

    return parsedSession;

  }

  catch(error){

    clearAuthSession();

    logError(
      error
    );

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

      AUTH_CONFIG
      .STORAGE_KEY

    );

    return true;

  }

  catch(error){

    logError(
      error
    );

    return false;

  }

}



// =====================================
// SESSION VALIDATION
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
// RESTORE SESSION
// =====================================

async function restoreAuthSession(){

  updateAuthState({

    loading:true,

    error:null

  });

  try{

    const session =
    loadAuthSession();

    if(!session){

      resetAuthState();

      return false;

    }

    if(
      isSessionExpired(
        session
      )
    ){

      clearAuthSession();

      resetAuthState();

      return false;

    }

    updateAuthState({

      authenticated:true,

      user:
      deepClone(
        session.user
      ),

      token:
      session.token,

      sessionExpiresAt:
      session.expiresAt

    });

    return true;

  }

  catch(error){

    resetAuthState();

    updateAuthState({

      error:
      getSafeErrorMessage(
        error
      )

    });

    logError(
      error
    );

    return false;

  }

  finally{

    updateAuthState({

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

  updateAuthState({

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

    const fakeUser =
    deepFreeze({

      id:createUniqueId(
        "user"
      ),

      email:
      String(email)
      .trim()
      .toLowerCase()

    });

    const fakeToken =
    createUniqueId(
      "token"
    );

    const session =
    createAuthSession({

      user:fakeUser,

      token:fakeToken

    });

    if(!session){

      throw new Error(
        "Session creation failed"
      );

    }

    const sessionSaved =
    saveAuthSession(
      session
    );

    if(!sessionSaved){

      throw new Error(
        "Session save failed"
      );

    }

    updateAuthState({

      authenticated:true,

      user:
      deepClone(
        fakeUser
      ),

      token:
      fakeToken,

      sessionExpiresAt:
      session.expiresAt,

      error:null

    });

    return true;

  }

  catch(error){

    resetAuthState();

    updateAuthState({

      error:
      getSafeErrorMessage(
        error
      )

    });

    logError(
      error
    );

    return false;

  }

  finally{

    updateAuthState({

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

  updateAuthState({

    loading:true,

    error:null

  });

  try{

    clearAuthSession();

    resetAuthState();

    return true;

  }

  catch(error){

    updateAuthState({

      error:
      getSafeErrorMessage(
        error
      )

    });

    logError(
      error
    );

    return false;

  }

  finally{

    updateAuthState({

      loading:false

    });

  }

}



// =====================================
// AUTH INITIALIZATION
// =====================================

async function initializeAuth(){

  if(
    authState.initialized ||
    authState.initializing
  ){

    return authState
    .authenticated;

  }

  updateAuthState({

    initializing:true,

    error:null

  });

  try{

    return await restoreAuthSession();

  }

  catch(error){

    updateAuthState({

      error:
      getSafeErrorMessage(
        error
      )

    });

    logError(
      error
    );

    return false;

  }

  finally{

    updateAuthState({

      initializing:false

    });

  }

}
