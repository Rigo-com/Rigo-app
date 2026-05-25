// =====================================
// RIGO AI
// SECURITY URL
// ENTERPRISE URL SECURITY LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// URL CONFIG
// =====================================

const SECURITY_URL_CONFIG =
Object.freeze({

  MAX_TRUSTED_ORIGINS:
  100,

  MAX_HOSTNAME_LENGTH:
  255

});



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
// PRIVATE NETWORKS
// =====================================

const PRIVATE_NETWORK_PATTERNS =
Object.freeze([

  /^127\./,
  /^10\./,
  /^192\.168\./,

  /^172\.(1[6-9]|2\d|3[0-1])\./,

  /^0\.0\.0\.0$/,

  /^169\.254\./,

  /^::1$/i,

  /^fc/i,
  /^fd/i,
  /^fe80:/i

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
// NORMALIZE HOSTNAME
// =====================================

function normalizeHostname(
  hostname
){

  try{

    return safeString(hostname)

    .normalize("NFKC")

    .trim()
    .toLowerCase();

  }

  catch(error){

    return "";

  }

}



// =====================================
// PRIVATE NETWORK CHECK
// =====================================

function isPrivateHostname(
  hostname
){

  const normalized =
  normalizeHostname(
    hostname
  );

  if(!normalized){

    return true;

  }

  if(

    normalized ===
    "localhost"

    ||

    normalized.endsWith(
      ".localhost"
    )

  ){

    return true;

  }

  return PRIVATE_NETWORK_PATTERNS
  .some((pattern) => {

    return pattern.test(
      normalized
    );

  });

}



// =====================================
// VALIDATE URL PORT
// =====================================

function validateURLPort(
  port
){

  if(!port){

    return true;

  }

  const normalized =
  safeString(port);

  return !BLOCKED_URL_PORTS
  .includes(
    normalized
  );

}



// =====================================
// VALIDATE HOSTNAME
// =====================================

function validateURLHostname(
  hostname
){

  const normalized =
  normalizeHostname(
    hostname
  );

  if(!normalized){

    return false;

  }

  if(

    normalized.length >

    SECURITY_URL_CONFIG
    .MAX_HOSTNAME_LENGTH

  ){

    return false;

  }

  if(
    normalized.includes("..")
  ){

    return false;

  }

  if(
    normalized.startsWith("-")
  ){

    return false;

  }

  if(
    normalized.endsWith("-")
  ){

    return false;

  }

  const validHostname =
  /^[a-z0-9.-]+$/i
  .test(
    normalized
  );

  if(!validHostname){

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

  if(

    securityState
    .trustedOrigins
    .size >=

    SECURITY_URL_CONFIG
    .MAX_TRUSTED_ORIGINS

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

      return false;

    }

    if(
      parsed.username ||
      parsed.password
    ){

      return false;

    }

    if(
      !validateURLHostname(
        parsed.hostname
      )
    ){

      return false;

    }

    if(
      !validateURLPort(
        parsed.port
      )
    ){

      return false;

    }

    if(
      isPrivateHostname(
        parsed.hostname
      )
    ){

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
  safeString(
    url,
    {

      trim:true

    }
  );

  if(!normalized){

    return null;

  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_URL_LENGTH

  ){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedURLs++;

    }

    return null;

  }

  try{

    if(
      normalized.includes("@")
    ){

      if(
        typeof securityState ===
        "object"
      ){

        securityState
        .blockedURLs++;

      }

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

      return null;

    }

    if(
      parsed.username ||
      parsed.password
    ){

      return null;

    }

    if(
      !validateURLHostname(
        parsed.hostname
      )
    ){

      return null;

    }

    if(
      !validateURLPort(
        parsed.port
      )
    ){

      return null;

    }

    if(
      isPrivateHostname(
        parsed.hostname
      )
    ){

      return null;

    }

    parsed.hash = "";

    return parsed.href;

  }

  catch(error){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedURLs++;

    }

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

    return parsed.href;

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
  safeURL(url);

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

      if(
        typeof securityState ===
        "object"
      ){

        securityState
        .blockedURLs++;

      }

      return null;

    }

    return parsed.href;

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

    trustedOriginsCount:

      securityState
      .trustedOrigins
      .size,

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



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "SecurityURL",

    {

      value:
      SecurityURL,

      writable:
      false,

      configurable:
      false

    }

  );

}
