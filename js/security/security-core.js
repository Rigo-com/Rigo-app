// =====================================
// RIGO AI
// SECURITY CORE
// ENTERPRISE SECURITY FOUNDATION
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SECURITY CONFIG
// =====================================

const SECURITY_CONFIG =
Object.freeze({

  MAX_STRING_LENGTH:
  25000,

  MAX_JSON_DEPTH:
  10,

  MAX_RATE_LIMIT:
  30,

  RATE_LIMIT_WINDOW:
  10000,

  MAX_URL_LENGTH:
  2048,

  MAX_TRACKED_KEYS:
  500,

  MAX_OBJECT_KEYS:
  1000,

  MAX_ARRAY_LENGTH:
  5000,

  MAX_PROMPT_SCORE:
  100,

  MAX_SECURITY_PATTERNS:
  500,

  ENABLE_XSS_PROTECTION:
  true,

  ENABLE_RATE_LIMITING:
  true,

  ENABLE_PROMPT_PROTECTION:
  true,

  ENABLE_SECURITY_LOGGING:
  true,

  ENABLE_HTTP_PROTOCOL:
  false,

  AUTO_TRIM_STRINGS:
  false,

  LOG_THROTTLE_MS:
  250

});



// =====================================
// SECURITY EVENTS
// =====================================

const SECURITY_EVENTS =
Object.freeze({

  INITIALIZED:
  "security.initialized",

  BLOCKED:
  "security.blocked",

  SANITIZED:
  "security.sanitized",

  RATE_LIMIT:
  "security.rate_limit",

  SUSPICIOUS:
  "security.suspicious"

});



// =====================================
// FREEZE STATES
// =====================================

const FREEZE_STATES =
Object.freeze({

  PENDING:
  "pending",

  FROZEN:
  "frozen"

});



// =====================================
// SYMBOL MARKERS
// =====================================

const ACCESSOR_BLOCKED_SYMBOL =
Symbol(
  "ACCESSOR_BLOCKED"
);



const CIRCULAR_REFERENCE_SYMBOL =
Symbol(
  "CIRCULAR_REFERENCE"
);



// =====================================
// INTERNAL MARKERS
// =====================================

const ACCESSOR_BLOCKED_MARKER =
Object.freeze({

  [ACCESSOR_BLOCKED_SYMBOL]:
  true

});



const CIRCULAR_REFERENCE_MARKER =
Object.freeze({

  [CIRCULAR_REFERENCE_SYMBOL]:
  true

});



// =====================================
// INTERNAL SECURITY STATE
// =====================================

function createSecurityState(){

  return {

    initialized:
    false,

    createdAt:
    Date.now(),

    initializedAt:
    null,

    failedInitializations:
    0,

    blockedRequests:
    0,

    suspiciousActivities:
    0,

    sanitizedPayloads:
    0,

    blockedURLs:
    0,

    blockedPrompts:
    0,

    rateLimitHits:
    0,

    lastLogAt:
    0,

    lastError:
    null,

    requestTracker:
    new Map(),

    blockedPatterns:
    new Set(),

    trustedOrigins:
    new Set(

      typeof window !==
      "undefined"

      &&

      window.location

      &&

      typeof window
      .location
      .origin ===
      "string"

      ?

      [

        String(
          window
          .location
          .origin
        )
        .trim()
        .toLowerCase()

      ]

      :

      []

    )

  };

}



const securityState =
Object.seal(
  createSecurityState()
);



// =====================================
// HELPERS
// =====================================

function isPlainObject(
  value
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype

    ||

    prototype === null

  );

}



function safeString(
  value
){

  try{

    if(
      value == null
    ){

      return "";
    }

    return String(value)
    .trim();

  }

  catch(error){

    return "";

  }

}



function createSecuritySnapshot(){

  return Object.freeze({

    initialized:
    securityState
    .initialized,

    createdAt:
    securityState
    .createdAt,

    initializedAt:
    securityState
    .initializedAt,

    failedInitializations:
    securityState
    .failedInitializations,

    blockedRequests:
    securityState
    .blockedRequests,

    suspiciousActivities:
    securityState
    .suspiciousActivities,

    sanitizedPayloads:
    securityState
    .sanitizedPayloads,

    blockedURLs:
    securityState
    .blockedURLs,

    blockedPrompts:
    securityState
    .blockedPrompts,

    rateLimitHits:
    securityState
    .rateLimitHits,

    blockedPatternsCount:

      securityState
      .blockedPatterns
      .size,

    trustedOrigins:[

      ...securityState
      .trustedOrigins

    ],

    healthy:

      securityState
      .initialized

      &&

      !securityState
      .lastError,

    lastError:

      securityState
      .lastError

      ?

      String(
        securityState
        .lastError
      )

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// SAFE SECURITY METADATA
// =====================================

function sanitizeSecurityMetadata(
  metadata
){

  if(
    metadata == null
  ){

    return {};
  }

  try{

    if(
      isPlainObject(
        metadata
      )
    ){

      return metadata;
    }

    return {

      normalized:
      true

    };

  }

  catch(error){

    return {

      sanitized:
      true

    };

  }

}



// =====================================
// LOG THROTTLE
// =====================================

function shouldThrottleSecurityLog(){

  const now =
  Date.now();

  if(

    now -

    securityState
    .lastLogAt <

    SECURITY_CONFIG
    .LOG_THROTTLE_MS

  ){

    return true;

  }

  securityState
  .lastLogAt =
  now;

  return false;

}



// =====================================
// SECURITY LOGGER
// =====================================

async function logSecurityEvent(
  message,
  metadata = null
){

  if(

    !SECURITY_CONFIG
    .ENABLE_SECURITY_LOGGING

  ){

    return false;

  }

  if(
    shouldThrottleSecurityLog()
  ){

    return false;

  }

  try{

    const safeMessage =
    safeString(
      message
    );

    const safeMetadata =
    sanitizeSecurityMetadata(
      metadata
    );

    if(
      typeof logDiagnosticWarning ===
      "function"
    ){

      await Promise.resolve(

        logDiagnosticWarning(

          "[SECURITY] " +
          safeMessage,

          safeMetadata

        )

      );

    }

    else{

      console.warn(

        "[SECURITY]",

        safeMessage,

        safeMetadata || ""

      );

    }

  }

  catch(error){

    console.error(

      "[SECURITY LOGGER FAILURE]",

      error

    );

    return false;

  }

  return true;

}



// =====================================
// REGEX VALIDATION
// =====================================

function validateSecurityPattern(
  pattern
){

  try{

    if(
      !(pattern instanceof RegExp)
    ){

      return false;

    }

    const source =
    safeString(
      pattern.source
    );

    if(!source){

      return false;

    }

    if(
      source.length >
      500
    ){

      return false;

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// REGISTER SECURITY PATTERNS
// =====================================

function registerSecurityPatterns(){

  if(
    securityState
    .blockedPatterns
    .size > 0
  ){

    return true;

  }

  if(
    typeof SECURITY_PATTERNS !==
    "object"
  ){

    logSecurityEvent(
      "SECURITY PATTERNS MISSING"
    );

    return false;

  }

  const patternGroups =
  Object.values(
    SECURITY_PATTERNS
  );

  for(
    const group of
    patternGroups
  ){

    if(
      !Array.isArray(group)
    ){

      continue;
    }

    for(
      const pattern of
      group
    ){

      if(

        securityState
        .blockedPatterns
        .size >=

        SECURITY_CONFIG
        .MAX_SECURITY_PATTERNS

      ){

        break;
      }

      const valid =
      validateSecurityPattern(
        pattern
      );

      if(!valid){

        logSecurityEvent(
          "INVALID SECURITY PATTERN"
        );

        continue;
      }

      securityState
      .blockedPatterns
      .add(
        pattern
      );

    }

  }

  return true;

}



// =====================================
// HARDEN SECURITY STATE
// =====================================

function hardenSecurityState(){

  try{

    Object.freeze(
      SECURITY_CONFIG
    );

    Object.freeze(
      FREEZE_STATES
    );

    Object.freeze(
      SECURITY_EVENTS
    );

    Object.freeze(
      ACCESSOR_BLOCKED_MARKER
    );

    Object.freeze(
      CIRCULAR_REFERENCE_MARKER
    );

    return true;

  }

  catch(error){

    logSecurityEvent(

      "SECURITY HARDEN FAILED",

      {

        error:
        String(error)
      }

    );

    return false;

  }

}



// =====================================
// INITIALIZE SECURITY
// =====================================

function initializeSecuritySystem(){

  if(
    securityState
    .initialized
  ){

    return true;

  }

  try{

    const patternsReady =
    registerSecurityPatterns();

    if(!patternsReady){

      throw new Error(
        "SECURITY_PATTERNS_FAILED"
      );

    }

    const hardened =
    hardenSecurityState();

    if(!hardened){

      throw new Error(
        "SECURITY_HARDEN_FAILED"
      );

    }

    securityState
    .initialized =
    true;

    securityState
    .initializedAt =
    Date.now();

    securityState
    .lastError =
    null;

    logSecurityEvent(
      "SECURITY SYSTEM READY"
    );

    return true;

  }

  catch(error){

    securityState
    .initialized =
    false;

    securityState
    .failedInitializations++;

    securityState
    .lastError =
    error;

    logSecurityEvent(

      "SECURITY INIT FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// SECURITY HEALTHCHECK
// =====================================

function validateSecurityHealth(){

  return (

    securityState
    .initialized

    &&

    !securityState
    .lastError

    &&

    securityState
    .blockedPatterns
    .size > 0

  );

}



// =====================================
// SECURITY DIAGNOSTICS
// =====================================

function getSecurityDiagnostics(){

  return createSecuritySnapshot();

}



// =====================================
// PUBLIC API
// =====================================

const SecurityCore =
Object.freeze({

  initialize:
  initializeSecuritySystem,

  diagnostics:
  getSecurityDiagnostics,

  snapshot:
  createSecuritySnapshot,

  validate:
  validateSecurityHealth,

  log:
  logSecurityEvent

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

    "SecurityCore",

    {

      value:
      SecurityCore,

      writable:
      false,

      configurable:
      false

    }

  );

}
