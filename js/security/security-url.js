// =====================================
// RIGO AI
// SECURITY URL
// ENTERPRISE URL SECURITY LAYER
// =====================================



// =====================================
// GET ALLOWED PROTOCOLS
// =====================================

function getAllowedURLProtocols(){

  const allowHTTP =

    SECURITY_CONFIG
    .ENABLE_HTTP_PROTOCOL ===
    true;

  return allowHTTP

  ?

  ["https:","http:"]

  :

  ["https:"];

}



// =====================================
// VALIDATE URL PROTOCOL
// =====================================

function validateURLProtocol(
  protocol
){

  const normalized =
  safeString(protocol)
  .toLowerCase();

  return getAllowedURLProtocols()
  .includes(
    normalized
  );

}



// =====================================
// VALIDATE LOCALHOST
// =====================================

function isLocalhostHostname(
  hostname
){

  const normalized =
  safeString(hostname)
  .toLowerCase();

  return (

    normalized ===
    "localhost"

    ||

    normalized ===
    "127.0.0.1"

    ||

    normalized ===
    "::1"

  );

}



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
      !validateURLProtocol(
        protocol
      )
    ){

      logSecurityEvent(

        "UNTRUSTED PROTOCOL BLOCKED",

        { protocol }

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

    if(
      isLocalhostHostname(
        parsed.hostname
      )
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

    logSecurityEvent(

      "TRUSTED ORIGIN ADDED",

      {

        origin:
        parsed.origin

      }

    );

    return true;

  }

  catch(error){

    logSecurityEvent(

      "ADD TRUSTED ORIGIN FAILED",

      {

        error:
        String(error)

      }

    );

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

    logSecurityEvent(
      "URL LENGTH BLOCKED"
    );

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
      !validateURLProtocol(
        protocol
      )
    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(

        "URL PROTOCOL BLOCKED",

        { protocol }

      );

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

    if(
      isLocalhostHostname(
        parsed.hostname
      )
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

    logSecurityEvent(

      "URL PARSE FAILED",

      {

        error:
        String(error)

      }

    );

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

      logSecurityEvent(

        "UNTRUSTED URL BLOCKED",

        {

          origin:
          parsed.origin

        }

      );

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

    allowedProtocols:
    getAllowedURLProtocols(),

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

  validateProtocol:
  validateURLProtocol,

  addTrusted:
  addTrustedOrigin,

  removeTrusted:
  removeTrustedOrigin,

  isTrusted:
  isTrustedOrigin,

  diagnostics:
  getURLSecurityDiagnostics

});
