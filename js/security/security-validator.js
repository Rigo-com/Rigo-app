// =====================================
// RIGO AI
// SECURITY VALIDATOR
// ENTERPRISE VALIDATION ENGINE
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SECURITY PATTERNS
// =====================================

const SECURITY_PATTERNS =
Object.freeze({



  // ===================================
  // XSS
  // ===================================

  XSS:[

    /<script\b/i,

    /<\/script>/i,

    /javascript\s*:/i,

    /vbscript\s*:/i,

    /data\s*:/i,

    /onerror\s*=/i,

    /onload\s*=/i,

    /onclick\s*=/i,

    /onmouseover\s*=/i,

    /srcdoc\s*=/i,

    /<iframe\b/i,

    /<object\b/i,

    /<embed\b/i,

    /<svg\b/i,

    /<link\b/i,

    /<meta\b/i,

    /document\.cookie/i,

    /document\.write/i,

    /window\.location/i,

    /data:text\/html/i

  ],



  // ===================================
  // SQL INJECTION
  // ===================================

  SQL_INJECTION:[

    /\bunion\b\s+\bselect\b/i,

    /\bdrop\b\s+\btable\b/i,

    /\binsert\b\s+\binto\b/i,

    /\bdelete\b\s+\bfrom\b/i,

    /\bupdate\b\s+.+\bset\b/i,

    /\bor\b\s+1\s*=\s*1\b/i,

    /--/,

    /;\s*shutdown/i,

    /\bexec\b/i,

    /\bbenchmark\s*\(/i

  ],



  // ===================================
  // PROTOTYPE POLLUTION
  // ===================================

  PROTOTYPE_POLLUTION:[

    /^__proto__$/i,

    /^prototype$/i,

    /^constructor$/i,

    /^constructor\.prototype$/i

  ]

});



// =====================================
// VALIDATOR CONFIG
// =====================================

const SECURITY_VALIDATOR_CONFIG =
Object.freeze({

  MAX_REGEX_SOURCE_LENGTH:
  500,

  MAX_DECODE_ITERATIONS:
  3,

  MAX_VALIDATION_DEPTH:
  20,

  MAX_TOTAL_NODES:
  10000

});



// =====================================
// HELPERS
// =====================================

function deepFreezeValidation(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(value);

  Reflect
  .ownKeys(value)
  .forEach((key) => {

    try{

      deepFreezeValidation(
        value[key],
        visited
      );

    }

    catch(error){}

  });

  return Object.freeze(
    value
  );

}



function safeValidationResult(
  result
){

  return deepFreezeValidation(
    result
  );

}



function normalizeValidationInput(
  input
){

  try{

    return String(input ?? "")

    .normalize("NFKC")

    .replace(
      /\0/g,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

  }

  catch(error){

    return "";

  }

}



// =====================================
// SAFE REGEX VALIDATION
// =====================================

function validateSecurityRegex(
  pattern
){

  try{

    if(
      !(pattern instanceof RegExp)
    ){

      return false;

    }

    const source =
    String(
      pattern.source || ""
    );

    if(!source){

      return false;

    }

    if(

      source.length >

      SECURITY_VALIDATOR_CONFIG
      .MAX_REGEX_SOURCE_LENGTH

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
// SAFE REGEX TEST
// =====================================

function safeRegexTest(
  pattern,
  input
){

  try{

    const valid =
    validateSecurityRegex(
      pattern
    );

    if(!valid){

      return false;

    }

    const safePattern =
    new RegExp(

      pattern.source,

      pattern.flags
      .replace(/g/g,"")

    );

    return safePattern.test(
      input
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// MATCH SECURITY PATTERNS
// =====================================

function matchSecurityPatterns(
  input,
  patterns = []
){

  const normalized =
  normalizeValidationInput(
    input
  );

  return patterns.some((pattern) => {

    return safeRegexTest(
      pattern,
      normalized
    );

  });

}



// =====================================
// SAFE DECODE
// =====================================

function decodeValidationPayload(
  input
){

  let normalized =
  normalizeValidationInput(
    input
  );

  let iterations =
  0;

  while(

    iterations <

    SECURITY_VALIDATOR_CONFIG
    .MAX_DECODE_ITERATIONS

  ){

    try{

      const decoded =
      decodeURIComponent(
        normalized
      );

      if(
        decoded === normalized
      ){

        break;

      }

      normalized =
      decoded;

    }

    catch(error){

      break;

    }

    iterations++;

  }

  return normalized;

}



// =====================================
// PROMPT INJECTION DETECTION
// =====================================

function detectPromptInjection(
  input
){

  const normalized =

    normalizeValidationInput(
      input
    )

    .toLowerCase();

  const suspiciousPatterns = [

    "ignore previous instructions",

    "ignore all previous",

    "system prompt",

    "developer message",

    "reveal hidden",

    "disable safety",

    "bypass restrictions",

    "show internal prompt",

    "act as unrestricted",

    "jailbreak"

  ];

  let score = 0;

  suspiciousPatterns
  .forEach((pattern) => {

    const compactPattern =

      pattern.replace(
        /\s+/g,
        ""
      );

    const compactInput =

      normalized.replace(
        /\s+/g,
        ""
      );

    if(

      normalized.includes(pattern)

      ||

      compactInput.includes(
        compactPattern
      )

    ){

      score += 20;

    }

  });

  return safeValidationResult({

    detected:
    score >= 40,

    score

  });

}



// =====================================
// VALIDATE SECURE INPUT
// =====================================

function validateSecureInput(
  input
){

  if(
    typeof input !==
    "string"
  ){

    return safeValidationResult({

      valid:false,

      reason:
      "INVALID_INPUT",

      checkedAt:
      Date.now()

    });

  }

  const normalized =
  normalizeValidationInput(
    input
  );

  if(!normalized){

    return safeValidationResult({

      valid:false,

      reason:
      "EMPTY_INPUT",

      checkedAt:
      Date.now()

    });

  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_STRING_LENGTH

  ){

    return safeValidationResult({

      valid:false,

      reason:
      "MAX_LENGTH_EXCEEDED",

      checkedAt:
      Date.now()

    });

  }

  const decoded =
  decodeValidationPayload(
    normalized
  );



  // ===================================
  // XSS DETECTION
  // ===================================

  const hasXSS =

    matchSecurityPatterns(

      normalized,

      SECURITY_PATTERNS
      .XSS

    )

    ||

    matchSecurityPatterns(

      decoded,

      SECURITY_PATTERNS
      .XSS

    );

  if(hasXSS){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedRequests++;

    }

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "XSS PAYLOAD BLOCKED"
      );

    }

    return safeValidationResult({

      valid:false,

      reason:
      "XSS",

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // SQL INJECTION
  // ===================================

  const hasSQLInjection =

    matchSecurityPatterns(

      normalized,

      SECURITY_PATTERNS
      .SQL_INJECTION

    )

    ||

    matchSecurityPatterns(

      decoded,

      SECURITY_PATTERNS
      .SQL_INJECTION

    );

  if(hasSQLInjection){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedRequests++;

    }

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "SQL INJECTION BLOCKED"
      );

    }

    return safeValidationResult({

      valid:false,

      reason:
      "SQL_INJECTION",

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // PROMPT INJECTION
  // ===================================

  const promptAnalysis =
  detectPromptInjection(
    normalized
  );

  if(
    promptAnalysis.detected
  ){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedPrompts++;

    }

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "PROMPT INJECTION BLOCKED"
      );

    }

    return safeValidationResult({

      valid:false,

      reason:
      "PROMPT_INJECTION",

      score:
      promptAnalysis.score,

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // VALID
  // ===================================

  return safeValidationResult({

    valid:true,

    reason:null,

    normalizedLength:
    normalized.length,

    checkedAt:
    Date.now()

  });

}



// =====================================
// VALIDATE JSON DEPTH
// =====================================

function validateJSONDepth(
  value,
  depth = 0,
  visited = new WeakSet()
){

  if(

    depth >

    SECURITY_CONFIG
    .MAX_JSON_DEPTH

  ){

    return false;

  }

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return true;

  }

  if(
    visited.has(value)
  ){

    return false;

  }

  visited.add(value);

  return Object.values(value)
  .every((nestedValue) => {

    return validateJSONDepth(

      nestedValue,

      depth + 1,

      visited

    );

  });

}



// =====================================
// VALIDATE ARRAY SIZE
// =====================================

function validateArraySize(
  array
){

  if(
    !Array.isArray(array)
  ){

    return true;

  }

  return (

    array.length <=

    SECURITY_CONFIG
    .MAX_ARRAY_LENGTH

  );

}



// =====================================
// VALIDATE OBJECT KEYS
// =====================================

function validateObjectKeys(
  object,
  visited = new WeakSet()
){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return true;

  }

  if(
    visited.has(object)
  ){

    return false;

  }

  visited.add(object);

  const keys =
  Object.keys(object);

  if(

    keys.length >

    SECURITY_CONFIG
    .MAX_OBJECT_KEYS

  ){

    return false;

  }

  const polluted =
  keys.some((key) => {

    return matchSecurityPatterns(

      key,

      SECURITY_PATTERNS
      .PROTOTYPE_POLLUTION

    );

  });

  if(polluted){

    return false;

  }

  return Object.values(object)
  .every((value) => {

    if(

      value &&

      typeof value ===
      "object"

    ){

      return validateObjectKeys(
        value,
        visited
      );

    }

    return true;

  });

}



// =====================================
// VALIDATE PAYLOAD
// =====================================

function validatePayload(
  payload,
  state = {

    depth:0,

    totalNodes:0,

    visited:
    new WeakSet()

  }

){

  if(

    state.depth >

    SECURITY_VALIDATOR_CONFIG
    .MAX_VALIDATION_DEPTH

  ){

    return false;

  }

  state.totalNodes++;

  if(

    state.totalNodes >

    SECURITY_VALIDATOR_CONFIG
    .MAX_TOTAL_NODES

  ){

    return false;

  }

  if(
    typeof payload ===
    "string"
  ){

    return validateSecureInput(
      payload
    ).valid;

  }

  if(

    payload == null ||

    typeof payload !==
    "object"

  ){

    return true;

  }

  if(
    state.visited.has(payload)
  ){

    return false;

  }

  state.visited.add(
    payload
  );

  const validDepth =
  validateJSONDepth(
    payload
  );

  if(!validDepth){

    return false;

  }

  if(
    Array.isArray(payload)
  ){

    if(
      !validateArraySize(
        payload
      )
    ){

      return false;

    }

    return payload.every((item) => {

      return validatePayload(

        item,

        {

          depth:
          state.depth + 1,

          totalNodes:
          state.totalNodes,

          visited:
          state.visited

        }

      );

    });

  }

  if(
    !validateObjectKeys(
      payload
    )
  ){

    return false;

  }

  return Object.values(payload)
  .every((value) => {

    return validatePayload(

      value,

      {

        depth:
        state.depth + 1,

        totalNodes:
        state.totalNodes,

        visited:
        state.visited

      }

    );

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityValidator =
Object.freeze({

  validateInput:
  validateSecureInput,

  validateJSONDepth,

  validateArraySize,

  validateObjectKeys,

  validatePayload,

  detectPromptInjection,

  normalize:
  normalizeValidationInput

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

    "SecurityValidator",

    {

      value:
      SecurityValidator,

      writable:
      false,

      configurable:
      false

    }

  );

}
