// =====================================
// RIGO AI
// AUTH VALIDATION
// =====================================

import {
  AUTH_RUNTIME_CONFIG
}
from "./auth-config.js";



// =====================================
// EMAIL
// =====================================

export function validateEmail(
  email
){

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  .test(
    String(email || "")
    .trim()
    .toLowerCase()
  );

}



// =====================================
// PASSWORD
// =====================================

export function validatePassword(
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



// =====================================
// TOKEN
// =====================================

export function validateToken(
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



// =====================================
// SESSION
// =====================================

export function validateAuthSession(
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
