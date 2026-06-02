// =====================================
// RIGO AI
// AUTH ACTIONS
// =====================================

import {
  AUTH_RUNTIME_EVENTS
}
from "./auth-config.js";

import {
  authRuntimeState,
  updateAuthRuntimeState,
  resetAuthRuntimeState
}
from "./auth-state.js";

import {
  validateEmail,
  validatePassword
}
from "./auth-validation.js";

import {
  createAuthSession,
  saveAuthSession,
  loadAuthSession,
  clearAuthSession,
  isSessionExpired,
  isLoginBlocked,
  registerFailedLogin
}
from "./auth-session.js";



// =====================================
// RESTORE
// =====================================

export async function restoreAuthSession(){

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
      session.user,

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

export async function login({

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

    const user = {

      id:

      typeof crypto !==
      "undefined" &&

      typeof crypto.randomUUID ===
      "function"

      ? crypto.randomUUID()

      : Date.now(),

      email:

      String(email)
      .trim()
      .toLowerCase()

    };

    const token =

      typeof crypto !==
      "undefined" &&

      typeof crypto.randomUUID ===
      "function"

      ? crypto.randomUUID()
      .replaceAll("-","") +

      crypto.randomUUID()
      .replaceAll("-","")

      : String(Date.now());

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

      user,

      token,

      sessionExpiresAt:
      session.expiresAt,

      lastActivityAt:
      Date.now()

    });

    authRuntimeState
    .diagnostics
    .logins++;

    return true;

  }

  catch(error){

    authRuntimeState
    .diagnostics
    .errors++;

    resetAuthRuntimeState();

    updateAuthRuntimeState({

      error:
      error?.message ||
      "UNKNOWN_ERROR"

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

export async function register({

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

  }

  return success;

}



// =====================================
// LOGOUT
// =====================================

export async function logout(){

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
