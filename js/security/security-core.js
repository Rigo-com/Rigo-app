// =====================================
// RIGO AI
// SECURITY CORE
// ENTERPRISE SECURITY FOUNDATION
// =====================================



// =====================================
// SECURITY CONFIG
// =====================================

const SECURITY_CONFIG =
Object.freeze({

  MAX_STRING_LENGTH:50000,

  MAX_JSON_DEPTH:10,

  MAX_RATE_LIMIT:30,

  RATE_LIMIT_WINDOW:10000,

  MAX_URL_LENGTH:2048,

  MAX_TRACKED_KEYS:500,

  MAX_OBJECT_KEYS:1000,

  MAX_ARRAY_LENGTH:5000,

  MAX_PROMPT_SCORE:100,

  ENABLE_XSS_PROTECTION:true,

  ENABLE_RATE_LIMITING:true,

  ENABLE_PROMPT_PROTECTION:true,

  ENABLE_SECURITY_LOGGING:true,

  ENABLE_HTTP_PROTOCOL:false,

  AUTO_TRIM_STRINGS:false

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
// INTERNAL SECURITY STATE
// =====================================

function createSecurityState(){

  return {

    initialized:false,

    createdAt:
    Date.now(),

    blockedRequests:0,

    suspiciousActivities:0,

    sanitizedPayloads:0,

    blockedURLs:0,

    blockedPrompts:0,

    rateLimitHits:0,

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
        window.location.origin
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
// FREEZE STATES
// =====================================

const FREEZE_STATES =
Object.freeze({

  PENDING:"pending",

  FROZEN:"frozen"

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
// SECURITY LOGGER
// =====================================

function logSecurityEvent(
  message,
  metadata = null
){

  if(

    !SECURITY_CONFIG
    .ENABLE_SECURITY_LOGGING

  ){

    return false;

  }

  try{

    if(
      typeof DiagnosticsRuntime !==
      "undefined"
    ){

      DiagnosticsRuntime
      .info(

        message,

        metadata

      );

    }

    else{

      console.info(

        "[SECURITY]",

        message,

        metadata || ""

      );

    }

  }

  catch(error){

    console.error(error);

  }

  return true;

}



// =====================================
// REGISTER PATTERNS
// =====================================

function registerSecurityPatterns(){

  const patterns = [

    "<script",

    "javascript:",

    "data:text/html",

    "onerror=",

    "onload=",

    "../",

    "..\\",

    "%3Cscript",

    "eval(",

    "Function("

  ];

  patterns.forEach((pattern) => {

    securityState
    .blockedPatterns
    .add(
      pattern
      .toLowerCase()
    );

  });

  return true;

}



// =====================================
// FREEZE CRITICAL OBJECTS
// =====================================

function freezeCriticalObjects(){

  try{

    Object.freeze(
      SECURITY_CONFIG
    );

    Object.freeze(
      FREEZE_STATES
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// INITIALIZE SECURITY
// =====================================

function initializeSecuritySystem(){

  if(
    securityState.initialized
  ){

    return true;

  }

  try{

    registerSecurityPatterns();

    freezeCriticalObjects();

    securityState.initialized =
    true;

    logSecurityEvent(
      "SECURITY SYSTEM READY"
    );

    return true;

  }

  catch(error){

    logSecurityEvent(

      "SECURITY INIT FAILED",

      {

        error:
        String(error)

      }

    );

    securityState.initialized =
    false;

    return false;

  }

}



// =====================================
// SECURITY DIAGNOSTICS
// =====================================

function getSecurityDiagnostics(){

  return Object.freeze({

    initialized:
    securityState
    .initialized,

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

    trustedOrigins:[

      ...securityState
      .trustedOrigins

    ],

    blockedPatterns:[

      ...securityState
      .blockedPatterns

    ]

  });

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

  state:
  securityState

});
