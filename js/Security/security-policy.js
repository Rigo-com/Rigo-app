const ALLOWED_URL_PROTOCOLS =
Object.freeze(

  SECURITY_CONFIG
  .ENABLE_HTTP_PROTOCOL

  ?

  [
    "http:",
    "https:"
  ]

  :

  [
    "https:"
  ]

);



const SECURITY_PATTERNS =
Object.freeze({

  XSS:[
    /<script/i,
    /<\/script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<svg/i,
    /<link/i,
    /<meta/i,
    /data:text\/html/i
  ],

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
    /you are now/i,
    /system override/i
  ],

  PROTOTYPE_POLLUTION:[
    /^__proto__$/i,
    /^prototype$/i,
    /^constructor$/i
  ]

});
