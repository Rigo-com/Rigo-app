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

  ENABLE_HTTP_PROTOCOL:
  false,

  MAX_URL_LENGTH:
  4096,

  MAX_TRUSTED_ORIGINS:
  100,

  MAX_HOSTNAME_LENGTH:
  255,

  MAX_HOSTNAME_LABEL:
  63

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
// URL STATE
// =====================================

const securityURLState =
Object.seal({

  trustedOrigins:
  new Set(),

  validatedURLs:0,

  blockedURLs:0,

  trustedMatches:0,

  failedParses:0,

  lastValidatedAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeURLValue(
  value
){

  try{

    return String(
      value || ""
    )
    .normalize("NFKC")
    .trim();

  }

  catch(error){

    return "";

  }

}



function getAllowedURLProtocols(){

  return (

    SECURITY_URL_CONFIG
    .ENABLE_HTTP_PROTOCOL

  )

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
  normalizeURLValue(
    protocol
  )
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

    return normalizeURLValue(
      hostname
    )
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

  return !BLOCKED_URL_PORTS
  .includes(
    normalizeURLValue(
      port
    )
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
    normalized.includes("@")
  ){

    return false;

  }

  const labels =
  normalized.split(".");

  if(
    labels.some((label) => {

      return (

        !label

        ||

        label.length >

        SECURITY_URL_CONFIG
        .MAX_HOSTNAME_LABEL

        ||

        label.startsWith("-")

        ||

        label.endsWith("-")

      );

    })

  ){

    return false;

  }

  return /^[a-z0-9.-]+$/i
  .test(
    normalized
  );

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
      normalizeURLValue(
        origin
      )
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
// SAFE URL PARSER
// =====================================

function parseSafeURL(
  url
){

  securityURLState
  .validatedURLs++;

  securityURLState
  .lastValidatedAt =
  Date.now();

  const normalized =
  normalizeURLValue(
    url
  );

  if(!normalized){

    return null;

  }

  if(

    normalized.length >

    SECURITY_URL_CONFIG
    .MAX_URL_LENGTH

  ){

    securityURLState
    .blockedURLs++;

    return null;

  }

  try{

    const parsed =
    new URL(
      normalized
    );

    if(
      !validateURLProtocol(
        parsed.protocol
      )
    ){

      securityURLState
      .blockedURLs++;

      return null;

    }

    if(
      parsed.username ||
      parsed.password
    ){

      securityURLState
      .blockedURLs++;

      return null;

    }

    if(
      !validateURLHostname(
        parsed.hostname
      )
    ){

      securityURLState
      .blockedURLs++;

      return null;

    }

    if(
      !validateURLPort(
        parsed.port
      )
    ){

      securityURLState
      .blockedURLs++;

      return null;

    }

    if(
      isPrivateHostname(
        parsed.hostname
      )
    ){

      securityURLState
      .blockedURLs++;

      return null;

    }

    parsed.hash = "";

    return parsed;

  }

  catch(error){

    securityURLState
    .failedParses++;

    return null;

  }

}



// =====================================
// SAFE URL
// =====================================

function safeURL(
  url
){

  const parsed =
  parseSafeURL(
    url
  );

  if(!parsed){

    return null;

  }

  return parsed.href;

}



// =====================================
// NORMALIZE URL
// =====================================

function normalizeURL(
  url
){

  const parsed =
  parseSafeURL(
    url
  );

  if(!parsed){

    return null;

  }

  parsed.hash = "";

  return parsed.href;

}



// =====================================
// ADD TRUSTED ORIGIN
// =====================================

function addTrustedOrigin(
  origin
){

  if(

    securityURLState
    .trustedOrigins
    .size >=

    SECURITY_URL_CONFIG
    .MAX_TRUSTED_ORIGINS

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

  const parsed =
  parseSafeURL(
    normalized
  );

  if(!parsed){

    return false;

  }

  securityURLState
  .trustedOrigins
  .add(
    normalized
  );

  return true;

}



// =====================================
// REMOVE TRUSTED ORIGIN
// =====================================

function removeTrustedOrigin(
  origin
){

  const normalized =
  normalizeTrustedOrigin(
    origin
  );

  if(!normalized){

    return false;

  }

  return securityURLState
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

  const normalized =
  normalizeTrustedOrigin(
    origin
  );

  if(!normalized){

    return false;

  }

  const trusted =

    securityURLState
    .trustedOrigins
    .has(
      normalized
    );

  if(trusted){

    securityURLState
    .trustedMatches++;

  }

  return trusted;

}



// =====================================
// VALIDATE TRUSTED URL
// =====================================

function validateTrustedURL(
  url
){

  const parsed =
  parseSafeURL(
    url
  );

  if(!parsed){

    return null;

  }

  const trusted =
  isTrustedOrigin(
    parsed.origin
  );

  if(!trusted){

    securityURLState
    .blockedURLs++;

    return null;

  }

  return parsed.href;

}



// =====================================
// URL DIAGNOSTICS
// =====================================

function getURLSecurityDiagnostics(){

  return Object.freeze({

    validatedURLs:
    securityURLState
    .validatedURLs,

    blockedURLs:
    securityURLState
    .blockedURLs,

    trustedMatches:
    securityURLState
    .trustedMatches,

    failedParses:
    securityURLState
    .failedParses,

    trustedOrigins:
    securityURLState
    .trustedOrigins
    .size,

    allowedProtocols:
    getAllowedURLProtocols(),

    lastValidatedAt:
    securityURLState
    .lastValidatedAt

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
// EXPORTS
// =====================================

export {

  SECURITY_URL_CONFIG,

  BLOCKED_URL_PORTS,

  PRIVATE_NETWORK_PATTERNS,

  securityURLState,

  normalizeURLValue,

  getAllowedURLProtocols,

  validateURLProtocol,

  normalizeHostname,

  isPrivateHostname,

  validateURLPort,

  validateURLHostname,

  normalizeTrustedOrigin,

  parseSafeURL,

  safeURL,

  normalizeURL,

  addTrustedOrigin,

  removeTrustedOrigin,

  isTrustedOrigin,

  validateTrustedURL,

  getURLSecurityDiagnostics,

  SecurityURL

};



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

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
