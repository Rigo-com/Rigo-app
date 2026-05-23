// =====================================
// RIGO AI
// SECURITY URL
// ENTERPRISE URL SECURITY LAYER
// =====================================



// =====================================
// ALLOWED PROTOCOLS
// =====================================

const ALLOWED_URL_PROTOCOLS =
Object.freeze([

  "https:",

  "http:"

]);



// =====================================
// ADD TRUSTED ORIGIN
// =====================================

function addTrustedOrigin(
  origin
){

  if(
    typeof origin !==
    "string"
  ){

    return false;

  }

  try{

    const parsed =
    new URL(

      safeString(
        origin
      )

    );

    const protocol =
    parsed.protocol
    .toLowerCase();

    if(

      protocol === "http:" &&

      !SECURITY_CONFIG
      .ENABLE_HTTP_PROTOCOL

    ){

      return false;

    }

    if(

      !ALLOWED_URL_PROTOCOLS
      .includes(
        protocol
      )

    ){

      logSecurityEvent(

        "UNTRUSTED PROTOCOL BLOCKED",

        {

          protocol

        }

      );

      return false;

    }

    if(
      parsed.username ||
      parsed.password
    ){

      logSecurityEvent(

        "URL CREDENTIALS BLOCKED"

      );

      return false;

    }

    const hostname =
    parsed.hostname
    .toLowerCase();

    if(

      hostname ===
      "localhost"

      ||

      hostname ===
      "127.0.0.1"

      ||

      hostname ===
      "::1"

    ){

      logSecurityEvent(

        "LOCALHOST ORIGIN BLOCKED"

      );

      return false;

    }

    securityState
    .trustedOrigins
    .add(
      parsed.origin
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// REMOVE TRUSTED ORIGIN
// =====================================

function removeTrustedOrigin(
  origin
){

  if(
    typeof origin !==
    "string"
  ){

    return false;

  }

  try{

    const parsed =
    new URL(

      safeString(
        origin
      )

    );

    return securityState
    .trustedOrigins
    .delete(
      parsed.origin
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// IS TRUSTED ORIGIN
// =====================================

function isTrustedOrigin(
  origin
){

  if(
    typeof origin !==
    "string"
  ){

    return false;

  }

  return securityState
  .trustedOrigins
  .has(
    origin
  );

}



// =====================================
// SAFE URL
// =====================================

function safeURL(
  url
){

  if(
    typeof url !==
    "string"
  ){

    return null;

  }

  const normalized =
  safeString(url);

  if(!normalized){

    return null;

  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_URL_LENGTH

  ){

    securityState
    .blockedURLs++;

    return null;

  }

  try{

    const baseOrigin =

      typeof window !==
      "undefined"

      &&

      window.location

      ?

      window.location.origin

      :

      "https://localhost";

    const parsed =
    new URL(
      normalized,
      baseOrigin
    );

    const protocol =
    parsed.protocol
    .toLowerCase();

    if(

      protocol === "http:" &&

      !SECURITY_CONFIG
      .ENABLE_HTTP_PROTOCOL

    ){

      securityState
      .blockedURLs++;

      return null;

    }

    if(

      !ALLOWED_URL_PROTOCOLS
      .includes(protocol)

    ){

      securityState
      .blockedURLs++;

      return null;

    }

    if(
      parsed.username ||
      parsed.password
    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(
        "URL CREDENTIALS BLOCKED"
      );

      return null;

    }

    const hostname =
    parsed.hostname
    .toLowerCase();

    if(

      hostname ===
      "localhost"

      ||

      hostname ===
      "127.0.0.1"

      ||

      hostname ===
      "::1"

    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(
        "LOCALHOST URL BLOCKED"
      );

      return null;

    }

    return parsed.toString();

  }

  catch(error){

    securityState
    .blockedURLs++;

    return null;

  }

}



// =====================================
// NORMALIZE URL
// =====================================

function normalizeURL(
  url
){

  const safe =
  safeURL(url);

  if(!safe){

    return null;

  }

  try{

    const parsed =
    new URL(safe);

    parsed.hash =
    "";

    return parsed
    .toString();

  }

  catch(error){

    return null;

  }

}



// =====================================
// VALIDATE TRUSTED URL
// =====================================

function validateTrustedURL(
  url
){

  const safe =
  safeURL(

    safeString(
      url
    )

  );

  if(!safe){

    return null;

  }

  try{

    const parsed =
    new URL(safe);

    if(

      !securityState
      .trustedOrigins
      .has(
        parsed.origin
      )

    ){

      securityState
      .blockedURLs++;

      return null;

    }

    return parsed.toString();

  }

  catch(error){

    return null;

  }

}



// =====================================
// URL DIAGNOSTICS
// =====================================

function getURLSecurityDiagnostics(){

  return Object.freeze({

    trustedOrigins:[

      ...securityState
      .trustedOrigins

    ],

    blockedURLs:
    securityState
    .blockedURLs

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityURL =
Object.freeze({

  safe:
  safeURL,

  normalize:
  normalizeURL,

  validateTrusted:
  validateTrustedURL,

  addTrusted:
  addTrustedOrigin,

  removeTrusted:
  removeTrustedOrigin,

  isTrusted:
  isTrustedOrigin,

  diagnostics:
  getURLSecurityDiagnostics

});
