// =====================================
// ALLOWED URL PROTOCOLS
// =====================================

const ALLOWED_URL_PROTOCOLS =
Object.freeze(

  SECURITY_CONFIG
  .ENABLE_HTTP_PROTOCOL

  ?

  Object.freeze([
    "http:",
    "https:"
  ])

  :

  Object.freeze([
    "https:"
  ])

);



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
    /data:text\/html/i
  ],



  // ===================================
  // PROMPT INJECTION
  // ===================================

  PROMPT_INJECTION:[
    /ignore previous instructions/i,
    /ignore all previous/i,
    /forget previous instructions/i,
    /reveal system prompt/i,
    /show developer message/i,
    /developer mode/i,
    /disregard all rules/i,
    /execute hidden instructions/i,
    /override security/i,
    /bypass restrictions/i,
    /print hidden context/i,
    /you are now (an?|the)/i,
    /system override/i
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
