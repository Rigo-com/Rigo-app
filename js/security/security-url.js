// =====================================
// RIGO AI
// SECURITY URL
// ENTERPRISE URL SECURITY LAYER
// =====================================



// =====================================
// BLOCKED PORTS
// =====================================

const BLOCKED_URL_PORTS =
Object.freeze([

  "0",
  "1",
  "7",
  "9",
  "19",
  "21",
  "22",
  "23",
  "25",
  "53",
  "69",
  "111",
  "135",
  "137",
  "139",
  "445",
  "1433",
  "3306",
  "3389"

]);



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
// VALIDATE URL PORT
// =====================================

function validateURLPort(
  port
){

  if(
    !port
  ){

    return true;

  }

  return !BLOCKED_URL_PORTS
  .includes(
    safeString(port)
  );

}



// =====================================
// VALIDATE HOSTNAME
// =====================================

function validateURLHostname(
  hostname
){

  const normalized =
  safeString(hostname)
  .toLowerCase();

  if(!normalized){

    return false;

  }

  if(
    normalized.length > 255
  ){

    return false;

  }

  if(
    /[^\w.-]/u
    .test(normalized)
  ){

    return false;

  }

  return true;

}



// =====================================
// NORMALIZE ORIGIN
// =====================================

function normalizeTrustedOrigin(
  origin
){

  try{

    const parsed =
    new URL(
      safeString(origin)
    );

    parsed.hash = "";
    parsed.pathname = "";
    parsed.search = "";

    return parsed.origin
    .toLowerCase();

  }

  catch(error){

    return null;

  }

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
      !validateURLHostname(
        parsed.hostname
      )
    ){

      logSecurityEvent(

        "INVALID HOSTNAME BLOCKED"

      );

      return false;

    }

    if(
      !validateURLPort(
        parsed.port
      )
    ){

      logSecurityEvent(

        "BLOCKED PORT DETECTED"

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

    const normalizedOrigin =
    normalizeTrustedOrigin(
      parsed.origin
    );

    if(!normalizedOrigin){

      return false;

    }

    securityState
    .trustedOrigins
    .add(
      normalizedOrigin
    );

    logSecurityEvent(

      "TRUSTED ORIGIN ADDED",

      {

        origin:
        normalizedOrigin

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

  const normalized =
  normalizeTrustedOrigin(
    origin
  );

  if(!normalized){

    return false;

  }

  return securityState
  .trustedOrigins
  .delete(
    normalized
  );

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

  const normalized =
  normalizeTrustedOrigin(
    origin
  );

  if(!normalized){

    return false;

  }

  return securityState
  .trustedOrigins
  .has(
    normalized
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

    if(
      normalized.includes("@")
    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(
        "URL USERINFO BLOCKED"
      );

      return null;

    }

    const parsed =
    new URL(
      normalized
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
      !validateURLHostname(
        parsed.hostname
      )
    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(
        "INVALID HOSTNAME BLOCKED"
      );

      return null;

    }

    if(
      !validateURLPort(
        parsed.port
      )
    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(
        "BLOCKED URL PORT"
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

    parsed.hash = "";

    return parsed
    .toString();

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

    parsed.hash = "";

    let normalized =
    parsed.toString();

    if(
      normalized.endsWith("/")
    ){

      normalized =
      normalized.slice(
        0,
        -1
      );

    }

    return normalized;

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

    const normalizedOrigin =
    normalizeTrustedOrigin(
      parsed.origin
    );

    if(

      !securityState
      .trustedOrigins
      .has(
        normalizedOrigin
      )

    ){

      securityState
      .blockedURLs++;

      logSecurityEvent(

        "UNTRUSTED URL BLOCKED",

        {

          origin:
          normalizedOrigin

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

    blockedPorts:
    BLOCKED_URL_PORTS,

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

  validateHostname:
  validateURLHostname,

  validatePort:
  validateURLPort,

  addTrusted:
  addTrustedOrigin,

  removeTrusted:
  removeTrustedOrigin,

  isTrusted:
  isTrustedOrigin,

  diagnostics:
  getURLSecurityDiagnostics

});
