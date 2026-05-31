// =====================================
// RIGO AI
// SECURITY SANITIZE
// ENTERPRISE SANITIZATION ENGINE
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SANITIZER CONFIG
// =====================================

const SECURITY_SANITIZE_CONFIG =
Object.freeze({

  MAX_DEPTH:
  10,

  MAX_KEYS:
  1000,

  MAX_ARRAY_LENGTH:
  5000,

  MAX_STRING_LENGTH:
  50000,

  MAX_TOTAL_NODES:
  10000,

  ENABLE_HTTP_PROTOCOL:
  false

});



// =====================================
// SANITIZER STATE
// =====================================

const securitySanitizeState =
Object.seal({

  sanitizedStrings:0,

  sanitizedObjects:0,

  sanitizedArrays:0,

  sanitizedURLs:0,

  sanitizedPrompts:0,

  blockedURLs:0,

  failedSanitizations:0,

  lastSanitizedAt:null

});



// =====================================
// HELPERS
// =====================================

function isPlainSanitizeObject(
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



function safeFreezeSanitized(
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

      safeFreezeSanitized(
        value[key],
        visited
      );

    }

    catch{}

  });

  return Object.freeze(
    value
  );

}



// =====================================
// SAFE STRING
// =====================================

function safeString(
  value,
  options = {}
){

  securitySanitizeState
  .sanitizedStrings++;

  securitySanitizeState
  .lastSanitizedAt =
  Date.now();

  if(
    value == null
  ){

    return "";

  }

  const shouldTrim =
  options.trim !== false;

  let normalized = "";

  try{

    normalized =
    String(value);

  }

  catch(error){

    securitySanitizeState
    .failedSanitizations++;

    return "";

  }

  try{

    normalized =
    normalized.normalize(
      "NFKC"
    );

  }

  catch(error){}

  normalized =
  normalized

  .replace(
    /[\u0000-\u001F\u007F]/g,
    ""
  )

  .replace(
    /[\u202A-\u202E]/g,
    ""
  );

  if(
    shouldTrim
  ){

    normalized =
    normalized.trim();

  }

  const characters =
  Array.from(
    normalized
  );

  if(

    characters.length >

    SECURITY_SANITIZE_CONFIG
    .MAX_STRING_LENGTH

  ){

    normalized =
    characters
    .slice(

      0,

      SECURITY_SANITIZE_CONFIG
      .MAX_STRING_LENGTH

    )
    .join("");

  }

  return normalized;

}



// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(
  input
){

  return safeString(input)

  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#39;")
  .replace(/`/g,"&#96;");

}



// =====================================
// SANITIZE HTML
// =====================================

function sanitizeHTML(
  input
){

  return escapeHTML(
    input
  );

}



// =====================================
// SANITIZE URL
// =====================================

function sanitizeURL(
  url
){

  securitySanitizeState
  .sanitizedURLs++;

  const normalized =
  safeString(
    url
  );

  if(!normalized){

    return "";
  }

  try{

    const parsed =
    new URL(

      normalized,

      "https://localhost"

    );

    const protocol =
    parsed.protocol
    .toLowerCase();

    const blockedProtocols =

      new Set([

        "javascript:",

        "data:",

        "vbscript:",

        "file:"

      ]);

    if(
      blockedProtocols.has(
        protocol
      )
    ){

      securitySanitizeState
      .blockedURLs++;

      return "";
    }

    if(

      SECURITY_SANITIZE_CONFIG
      .ENABLE_HTTP_PROTOCOL ===
      false

      &&

      protocol ===
      "http:"

    ){

      securitySanitizeState
      .blockedURLs++;

      return "";
    }

    return parsed.href;

  }

  catch(error){

    securitySanitizeState
    .failedSanitizations++;

    return "";

  }

}



// =====================================
// SANITIZE PROMPT
// =====================================

function sanitizePrompt(
  prompt
){

  securitySanitizeState
  .sanitizedPrompts++;

  const normalized =
  safeString(prompt);

  const blockedPatterns = [

    /ignore\s+previous\s+instructions/gi,

    /ignore\s+all\s+previous/gi,

    /system\s+prompt/gi,

    /developer\s+message/gi,

    /reveal\s+hidden/gi,

    /show\s+internal/gi,

    /disable\s+safety/gi,

    /bypass\s+restrictions/gi,

    /jailbreak/gi

  ];

  let sanitized =
  normalized;

  blockedPatterns
  .forEach((pattern) => {

    sanitized =
    sanitized.replace(
      pattern,
      ""
    );

  });

  return sanitized.trim();

}



// =====================================
// SANITIZE VALUE
// =====================================

function sanitizeValue(
  input
){

  const stack = [

    {
      source:input,
      parent:null,
      key:null,
      depth:0
    }

  ];

  const visited =
  new WeakMap();

  let totalNodes = 0;

  let root = null;

  while(stack.length){

    const current =
    stack.pop();

    totalNodes++;

    if(

      totalNodes >

      SECURITY_SANITIZE_CONFIG
      .MAX_TOTAL_NODES

    ){

      break;

    }

    if(

      current.depth >

      SECURITY_SANITIZE_CONFIG
      .MAX_DEPTH

    ){

      continue;

    }

    const value =
    current.source;

    let sanitized =
    null;



    // ================================
    // PRIMITIVES
    // ================================

    if(
      value == null
    ){

      sanitized = null;

    }

    else if(
      typeof value ===
      "string"
    ){

      sanitized =
      safeString(value);

    }

    else if(

      typeof value ===
      "number"

      ||

      typeof value ===
      "boolean"

      ||

      typeof value ===
      "bigint"

    ){

      sanitized = value;

    }



    // ================================
    // SPECIAL OBJECTS
    // ================================

    else if(
      value instanceof Date
    ){

      sanitized =
      new Date(
        value.getTime()
      );

    }

    else if(
      value instanceof URL
    ){

      sanitized =
      sanitizeURL(
        value.href
      );

    }

    else if(
      value instanceof Error
    ){

      sanitized = {

        name:
        safeString(
          value.name
        ),

        message:
        safeString(
          value.message
        )

      };

    }



    // ================================
    // ARRAYS
    // ================================

    else if(
  Array.isArray(
    value
  )
){

  securitySanitizeState
  .sanitizedArrays++;

  if(
    visited.has(value)
  ){

    sanitized =
    visited.get(value);

  }

  else{

    sanitized = [];

    visited.set(
      value,
      sanitized
    );

    value
    .slice(
      0,
      SECURITY_SANITIZE_CONFIG
      .MAX_ARRAY_LENGTH
    )
    .forEach((item,index) => {

      stack.push({

        source:item,

        parent:sanitized,

        key:index,

        depth:
        current.depth + 1

      });

    });

  }

}

      

    // ================================
    // OBJECTS
    // ================================

    else if(
      isPlainSanitizeObject(
        value
      )
    ){

      securitySanitizeState
      .sanitizedObjects++;

      if(
        visited.has(value)
      ){

        sanitized =
        visited.get(value);

      }

      else{

        sanitized =
        Object.create(null);

        visited.set(
          value,
          sanitized
        );

        Object.keys(value)
        .slice(

          0,

          SECURITY_SANITIZE_CONFIG
          .MAX_KEYS

        )
        .forEach((key) => {

          const normalizedKey =
          safeString(key);

          if(

            normalizedKey ===
            "__proto__"

            ||

            normalizedKey ===
            "prototype"

            ||

            normalizedKey ===
            "constructor"

          ){

            return;

          }

          stack.push({

            source:
            value[key],

            parent:
            sanitized,

            key:
            normalizedKey,

            depth:
            current.depth + 1

          });

        });

      }

    }



    // ================================
    // INVALID TYPES
    // ================================

    else{

      sanitized = null;

    }



    // ================================
    // ROOT
    // ================================

    if(
      current.parent === null
    ){

      root = sanitized;

      continue;

    }



    // ================================
    // ASSIGN
    // ================================

    current.parent[
      current.key
    ] = sanitized;

  }

  return root;

}



// =====================================
// SAFE JSON STRINGIFY
// =====================================

function safeJSONStringify(
  value
){

  try{

    const sanitized =
    sanitizeValue(
      value
    );

    return JSON.stringify(

      sanitized,

      (_, currentValue) => {

        if(
          typeof currentValue ===
          "bigint"
        ){

          return String(
            currentValue
          );

        }

        return currentValue;

      }

    );

  }

  catch(error){

    securitySanitizeState
    .failedSanitizations++;

    return "{}";

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSecuritySanitizeDiagnostics(){

  return Object.freeze({

    sanitizedStrings:
    securitySanitizeState
    .sanitizedStrings,

    sanitizedObjects:
    securitySanitizeState
    .sanitizedObjects,

    sanitizedArrays:
    securitySanitizeState
    .sanitizedArrays,

    sanitizedURLs:
    securitySanitizeState
    .sanitizedURLs,

    sanitizedPrompts:
    securitySanitizeState
    .sanitizedPrompts,

    blockedURLs:
    securitySanitizeState
    .blockedURLs,

    failedSanitizations:

      securitySanitizeState
      .failedSanitizations,

    lastSanitizedAt:
    securitySanitizeState
    .lastSanitizedAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecuritySanitize =
safeFreezeSanitized({

  string:
  safeString,

  html:
  sanitizeHTML,

  escapeHTML,

  url:
  sanitizeURL,

  value:
  sanitizeValue,

  prompt:
  sanitizePrompt,

  stringify:
  safeJSONStringify,

  diagnostics:
  getSecuritySanitizeDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_SANITIZE_CONFIG,

  securitySanitizeState,

  isPlainSanitizeObject,

  safeFreezeSanitized,

  safeString,

  escapeHTML,

  sanitizeHTML,

  sanitizeURL,

  sanitizePrompt,

  sanitizeValue,

  safeJSONStringify,

  getSecuritySanitizeDiagnostics,

  SecuritySanitize

};



