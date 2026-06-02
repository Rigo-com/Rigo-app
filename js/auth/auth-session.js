// =====================================
// RIGO AI
// AUTH SESSION
// =====================================

import {
  AUTH_RUNTIME_CONFIG
}
from "./auth-config.js";

import {
  authRuntimeState
}
from "./auth-state.js";

import {
  validateToken,
  validateAuthSession
}
from "./auth-validation.js";



// =====================================
// SESSION
// =====================================

export function createAuthSession({

  user = null,

  token = null

} = {}){

  if(
    !validateToken(token)
  ){

    return null;

  }

  const now =
  Date.now();

  return {

    user,

    token,

    expiresAt:

      now +

      AUTH_RUNTIME_CONFIG
      .SESSION_DURATION,

    createdAt:
    now

  };

}



export function saveAuthSession(
  session
){

  try{

    if(
      typeof localStorage ===
      "undefined"
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



export function loadAuthSession(){

  try{

    if(
      typeof localStorage ===
      "undefined"
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



export function clearAuthSession(){

  try{

    if(
      typeof localStorage ===
      "undefined"
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



export function isSessionExpired(
  session
){

  return (

    !session ||

    Date.now() >=
    session.expiresAt

  );

}



export function updateLastActivity(){

  authRuntimeState
  .lastActivityAt =
  Date.now();

  return true;

}



export function isLoginBlocked(){

  return Boolean(

    authRuntimeState
    .loginBlockedUntil

    &&

    Date.now() <

    authRuntimeState
    .loginBlockedUntil

  );

}



export function registerFailedLogin(){

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
