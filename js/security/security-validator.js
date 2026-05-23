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
// NORMALIZE VALIDATION INPUT
// =====================================

function normalizeValidationInput(
  input
){

  return safeString(input)

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



// =====================================
// SAFE REGEX TEST
// =====================================

function safeRegexTest(
  pattern,
  input
){

  try{

    if(
      !(pattern instanceof RegExp)
    ){

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
// DECODE ENCODED PAYLOADS
// =====================================

function decodeValidationPayload(
  input
){

  let normalized =
  normalizeValidationInput(
    input
  );

  try{

    normalized =
    decodeURIComponent(
      normalized
    );

  }

  catch(error){}

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
  normalizeValidationInput(
    input
  );

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

    )

    ||

    matchSecurityPatterns(

      decoded,

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
  object,
  visited = new WeakSet()
){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return false;

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

    if(
      !validateArraySize(
        payload
      )
    ){

      return false;

    }

    return payload.every((item) => {

      return validatePayload(
        item
      );

    });

  }

  if(

    payload &&

    typeof payload ===
    "object"

  ){

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
        value
      );

    });

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
