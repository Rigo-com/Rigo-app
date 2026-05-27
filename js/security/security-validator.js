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

    /onerror\s*=/i,

    /onload\s*=/i,

    /onclick\s*=/i,

    /onmouseover\s*=/i,

    /srcdoc\s*=/i,

    /<iframe\b/i,

    /<object\b/i,

    /<embed\b/i,

    /<svg\b/i,

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

  MAX_STRING_LENGTH:
  50000,

  MAX_ARRAY_LENGTH:
  5000,

  MAX_OBJECT_KEYS:
  1000,

  MAX_JSON_DEPTH:
  20,

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
// VALIDATOR STATE
// =====================================

const securityValidatorState =
Object.seal({

  validatedInputs:0,

  blockedInputs:0,

  blockedXSS:0,

  blockedSQLInjection:0,

  blockedPromptInjection:0,

  failedValidations:0,

  lastValidatedAt:null

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

    if(

      !validateSecurityRegex(
        pattern
      )

    ){

      return false;

    }

    return pattern.test(
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

  securityValidatorState
  .validatedInputs++;

  securityValidatorState
  .lastValidatedAt =
  Date.now();

  if(
    typeof input !==
    "string"
  ){

    securityValidatorState
    .failedValidations++;

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

    SECURITY_VALIDATOR_CONFIG
    .MAX_STRING_LENGTH

  ){

    securityValidatorState
    .blockedInputs++;

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
  // XSS
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

    securityValidatorState
    .blockedInputs++;

    securityValidatorState
    .blockedXSS++;

    logSecurityEvent?.(
      "XSS PAYLOAD BLOCKED"
    );

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

    securityValidatorState
    .blockedInputs++;

    securityValidatorState
    .blockedSQLInjection++;

    logSecurityEvent?.(
      "SQL INJECTION BLOCKED"
    );

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

    securityValidatorState
    .blockedInputs++;

    securityValidatorState
    .blockedPromptInjection++;

    logSecurityEvent?.(
      "PROMPT INJECTION BLOCKED"
    );

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

    SECURITY_VALIDATOR_CONFIG
    .MAX_ARRAY_LENGTH

  );

}



// =====================================
// VALIDATE OBJECT KEYS
// =====================================

function validateObjectKeys(
  object
){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return true;

  }

  const keys =
  Object.keys(object);

  if(

    keys.length >

    SECURITY_VALIDATOR_CONFIG
    .MAX_OBJECT_KEYS

  ){

    return false;

  }

  return !keys.some((key) => {

    return matchSecurityPatterns(

      key,

      SECURITY_PATTERNS
      .PROTOTYPE_POLLUTION

    );

  });

}



// =====================================
// VALIDATE PAYLOAD
// =====================================

function validatePayload(
  payload
){

  const stack = [

    {
      value:payload,
      depth:0
    }

  ];

  const visited =
  new WeakSet();

  let totalNodes = 0;

  while(stack.length){

    const current =
    stack.pop();

    totalNodes++;

    if(

      totalNodes >

      SECURITY_VALIDATOR_CONFIG
      .MAX_TOTAL_NODES

    ){

      return false;

    }

    if(

      current.depth >

      SECURITY_VALIDATOR_CONFIG
      .MAX_VALIDATION_DEPTH

    ){

      return false;

    }

    const value =
    current.value;

    if(
      typeof value ===
      "string"
    ){

      if(
        !validateSecureInput(
          value
        ).valid
      ){

        return false;

      }

      continue;

    }

    if(

      value == null ||

      typeof value !==
      "object"

    ){

      continue;

    }

    if(
      visited.has(value)
    ){

      return false;

    }

    visited.add(value);

    if(
      Array.isArray(value)
    ){

      if(
        !validateArraySize(
          value
        )
      ){

        return false;

      }

      value.forEach((item) => {

        stack.push({

          value:item,

          depth:
          current.depth + 1

        });

      });

      continue;

    }

    if(
      !validateObjectKeys(
        value
      )
    ){

      return false;

    }

    Object.values(value)
    .forEach((nestedValue) => {

      stack.push({

        value:nestedValue,

        depth:
        current.depth + 1

      });

    });

  }

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSecurityValidatorDiagnostics(){

  return Object.freeze({

    validatedInputs:
    securityValidatorState
    .validatedInputs,

    blockedInputs:
    securityValidatorState
    .blockedInputs,

    blockedXSS:
    securityValidatorState
    .blockedXSS,

    blockedSQLInjection:
    securityValidatorState
    .blockedSQLInjection,

    blockedPromptInjection:

      securityValidatorState
      .blockedPromptInjection,

    failedValidations:
    securityValidatorState
    .failedValidations,

    lastValidatedAt:
    securityValidatorState
    .lastValidatedAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityValidator =
Object.freeze({

  validateInput:
  validateSecureInput,

  validateArraySize,

  validateObjectKeys,

  validatePayload,

  detectPromptInjection,

  normalize:
  normalizeValidationInput,

  diagnostics:
  getSecurityValidatorDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_PATTERNS,

  SECURITY_VALIDATOR_CONFIG,

  securityValidatorState,

  normalizeValidationInput,

  validateSecurityRegex,

  safeRegexTest,

  matchSecurityPatterns,

  decodeValidationPayload,

  detectPromptInjection,

  validateSecureInput,

  validateArraySize,

  validateObjectKeys,

  validatePayload,

  getSecurityValidatorDiagnostics,

  SecurityValidator

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
