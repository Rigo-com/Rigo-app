// =====================================
// RIGO AI
// SECURITY VALIDATOR
// ENTERPRISE VALIDATION ENGINE
// =====================================



// =====================================
// SECURITY PATTERNS
// =====================================

const SECURITY_PATTERNS =
Object.freeze({

  XSS:[

    /<script/i,

    /javascript:/i,

    /onerror\s*=/i,

    /onload\s*=/i,

    /<iframe/i,

    /document\.cookie/i

  ],

  SQL_INJECTION:[

    /union\s+select/i,

    /drop\s+table/i,

    /insert\s+into/i,

    /delete\s+from/i

  ]

});



// =====================================
// SAFE STRING
// =====================================

function safeString(
  value
){

  if(
    value == null
  ){

    return "";
  }

  let normalized =
  String(value);

  if(

    SECURITY_CONFIG
    .AUTO_TRIM_STRINGS

  ){

    normalized =
    normalized.trim();

  }

  return normalized;

}



// =====================================
// PROMPT INJECTION DETECTION
// =====================================

function detectPromptInjection(
  input
){

  const suspiciousPatterns = [

    "ignore previous instructions",

    "system prompt",

    "developer message",

    "bypass restrictions",

    "reveal hidden",

    "disable safety"

  ];

  let score = 0;

  const normalized =
  input.toLowerCase();

  suspiciousPatterns
  .forEach((pattern) => {

    if(
      normalized.includes(
        pattern
      )
    ){

      score += 20;

    }

  });

  return {

    detected:
    score >= 40,

    score

  };

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

    return deepFreezeSecurity({

      valid:false,

      reason:
      "INVALID_INPUT",

      checkedAt:
      Date.now()

    });

  }

  const normalized =
  safeString(input);

  if(!normalized){

    return deepFreezeSecurity({

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

    return deepFreezeSecurity({

      valid:false,

      reason:
      "MAX_LENGTH_EXCEEDED",

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // XSS DETECTION
  // ===================================

  const hasXSS =

    SECURITY_PATTERNS
    .XSS
    .some((pattern) => {

      return (

        pattern instanceof
        RegExp

        &&

        pattern.test(
          normalized
        )

      );

    });

  if(hasXSS){

    if(

      Number.isFinite(

        securityState
        .blockedRequests

      )

    ){

      securityState
      .blockedRequests++;

    }

    else{

      securityState
      .blockedRequests =
      1;

    }

    logSecurityEvent(
      "XSS PAYLOAD BLOCKED"
    );

    return deepFreezeSecurity({

      valid:false,

      reason:"XSS",

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

    return deepFreezeSecurity({

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
  // VALID INPUT
  // ===================================

  return deepFreezeSecurity({

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
  depth = 0
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

  return Object.values(value)
  .every((nestedValue) => {

    return validateJSONDepth(

      nestedValue,

      depth + 1

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

    return false;

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
  object
){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return false;

  }

  return (

    Object.keys(object)
    .length <=

    SECURITY_CONFIG
    .MAX_OBJECT_KEYS

  );

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

  detectPromptInjection

});
