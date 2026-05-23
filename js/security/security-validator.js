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



  // ===================================
  // XSS
  // ===================================

  XSS:[

    /<script/i,

    /<\/script/i,

    /javascript:/i,

    /vbscript:/i,

    /data:/i,

    /onerror\s*=/i,

    /onload\s*=/i,

    /onclick\s*=/i,

    /onmouseover\s*=/i,

    /srcdoc\s*=/i,

    /<iframe/i,

    /<object/i,

    /<embed/i,

    /<svg/i,

    /<link/i,

    /<meta/i,

    /document\.cookie/i,

    /data:text\/html/i

  ],



  // ===================================
  // SQL INJECTION
  // ===================================

  SQL_INJECTION:[

    /union\s+select/i,

    /drop\s+table/i,

    /insert\s+into/i,

    /delete\s+from/i,

    /update\s+.*set/i,

    /or\s+1=1/i

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

  let normalized = "";

  try{

    normalized =
    String(value);

  }

  catch(error){

    logSecurityEvent(
      "SAFE_STRING_FAILED"
    );

    return "";

  }

  if(
    typeof normalized.normalize ===
    "function"
  ){

    normalized =
    normalized.normalize(
      "NFKC"
    );

  }

  if(

    SECURITY_CONFIG
    .AUTO_TRIM_STRINGS

  ){

    normalized =
    normalized.trim();

  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_STRING_LENGTH

  ){

    normalized =
    normalized.slice(

      0,

      SECURITY_CONFIG
      .MAX_STRING_LENGTH

    );

  }

  return normalized;

}



// =====================================
// MATCH SECURITY PATTERNS
// =====================================

function matchSecurityPatterns(
  input,
  patterns = []
){

  return patterns.some((pattern) => {

    return (

      pattern instanceof
      RegExp

      &&

      pattern.test(
        input
      )

    );

  });

}



// =====================================
// PROMPT INJECTION DETECTION
// =====================================

function detectPromptInjection(
  input
){

  if(
    typeof SecurityPolicy !==
    "undefined"

    &&

    typeof SecurityPolicy
    .validateExecution ===
    "function"
  ){

    const allowed =
    SecurityPolicy
    .validateExecution(
      "prompt"
    );

    if(!allowed){

      return {

        detected:true,

        score:100

      };

    }

  }

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
  safeString(input)
  .toLowerCase();

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
  matchSecurityPatterns(

    normalized,

    SECURITY_PATTERNS
    .XSS

  );

  if(hasXSS){

    securityState
    .blockedRequests++;

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
  // SQL INJECTION
  // ===================================

  const hasSQLInjection =
  matchSecurityPatterns(

    normalized,

    SECURITY_PATTERNS
    .SQL_INJECTION

  );

  if(hasSQLInjection){

    securityState
    .blockedRequests++;

    logSecurityEvent(
      "SQL INJECTION BLOCKED"
    );

    return deepFreezeSecurity({

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

    securityState
    .blockedPrompts++;

    logSecurityEvent(

      "PROMPT INJECTION BLOCKED"

    );

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

  return !polluted;

}



// =====================================
// VALIDATE PAYLOAD
// =====================================

function validatePayload(
  payload
){

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

    return validateArraySize(
      payload
    );

  }

  if(

    payload &&

    typeof payload ===
    "object"

  ){

    return validateObjectKeys(
      payload
    );

  }

  return true;

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

  detectPromptInjection

});
