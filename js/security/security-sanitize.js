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
  5000

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

    catch(error){}

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

  if(
    value == null
  ){

    return "";

  }

  const shouldTrim =

    options.trim === true ||

    (
      options.trim !== false &&

      SECURITY_CONFIG
      .AUTO_TRIM_STRINGS
    );

  let normalized = "";

  try{

    normalized =
    String(value);

  }

  catch(error){

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        "STRING_CONVERSION_FAILED"
      );

    }

    return "";

  }

  try{

    if(
      typeof normalized.normalize ===
      "function"
    ){

      normalized =
      normalized.normalize(
        "NFKC"
      );

    }

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

    SECURITY_CONFIG
    .MAX_STRING_LENGTH

  ){

    normalized =
    characters
    .slice(

      0,

      SECURITY_CONFIG
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

  const escaped =
  escapeHTML(input);

  if(
    typeof securityState ===
    "object"
  ){

    securityState
    .sanitizedPayloads++;

  }

  return escaped;

}



// =====================================
// SANITIZE URL
// =====================================

function sanitizeURL(
  url
){

  const normalized =
  safeString(
    url,
    {

      trim:true

    }
  );

  if(!normalized){

    return "";
  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_URL_LENGTH

  ){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedURLs++;

    }

    return "";
  }

  try{

    const parsed =
    new URL(

      normalized,

      typeof window !==
      "undefined"

      ?

      window.location.origin

      :

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

      if(
        typeof securityState ===
        "object"
      ){

        securityState
        .blockedURLs++;

      }

      return "";
    }

    if(

      SECURITY_CONFIG
      .ENABLE_HTTP_PROTOCOL ===
      false

      &&

      protocol ===
      "http:"

    ){

      if(
        typeof securityState ===
        "object"
      ){

        securityState
        .blockedURLs++;

      }

      return "";
    }

    return parsed.href;

  }

  catch(error){

    return "";

  }

}



// =====================================
// SANITIZE ARRAY
// =====================================

function sanitizeArray(
  values = [],
  visited = new WeakSet(),
  depth = 0
){

  if(
    !Array.isArray(values)
  ){

    return [];
  }

  return values

  .slice(

    0,

    SECURITY_CONFIG
    .MAX_ARRAY_LENGTH

  )

  .map((item) => {

    return sanitizeObject(

      item,

      visited,

      depth + 1

    );

  });

}



// =====================================
// SANITIZE OBJECT
// =====================================

function sanitizeObject(
  object,
  visited = new WeakSet(),
  depth = 0
){

  if(
    object == null
  ){

    return null;

  }

  if(

    depth >

    SECURITY_SANITIZE_CONFIG
    .MAX_DEPTH

  ){

    return null;

  }



  // ===================================
  // PRESERVE PRIMITIVES
  // ===================================

  if(
    typeof object ===
    "string"
  ){

    return safeString(
      object
    );

  }

  if(

    typeof object ===
    "number"

    ||

    typeof object ===
    "boolean"

    ||

    typeof object ===
    "bigint"

  ){

    return object;

  }



  // ===================================
  // SPECIAL OBJECTS
  // ===================================

  if(
    object instanceof Date
  ){

    return new Date(
      object.getTime()
    );

  }

  if(
    object instanceof RegExp
  ){

    return new RegExp(
      object.source,
      object.flags
    );

  }

  if(
    object instanceof URL
  ){

    return sanitizeURL(
      object.href
    );

  }

  if(
    object instanceof Error
  ){

    return {

      name:
      safeString(
        object.name
      ),

      message:
      safeString(
        object.message
      )

    };

  }

  if(
    object instanceof Map
  ){

    return sanitizeObject(

      Object.fromEntries(
        object.entries()
      ),

      visited,

      depth + 1

    );

  }

  if(
    object instanceof Set
  ){

    return sanitizeArray(

      [...object],

      visited,

      depth + 1

    );

  }



  // ===================================
  // CIRCULAR
  // ===================================

  if(
    visited.has(object)
  ){

    return null;

  }

  visited.add(
    object
  );



  // ===================================
  // ARRAYS
  // ===================================

  if(
    Array.isArray(object)
  ){

    return sanitizeArray(

      object,

      visited,

      depth + 1

    );

  }



  // ===================================
  // NON-PLAIN OBJECTS
  // ===================================

  if(
    !isPlainSanitizeObject(
      object
    )
  ){

    return null;

  }



  // ===================================
  // CLEAN OBJECT
  // ===================================

  const keys =
  Object.keys(object)
  .slice(

    0,

    SECURITY_SANITIZE_CONFIG
    .MAX_KEYS

  );

  const cleanObject =
  Object.create(null);

  keys.forEach((key) => {

    const normalizedKey =
    safeString(key);

    if(

      normalizedKey ===
      "__proto__"

      ||

      normalizedKey ===
      "constructor"

      ||

      normalizedKey ===
      "prototype"

    ){

      return;

    }

    try{

      cleanObject[
        normalizedKey
      ] = sanitizeObject(

        object[key],

        visited,

        depth + 1

      );

    }

    catch(error){

      cleanObject[
        normalizedKey
      ] = null;

    }

  });

  return cleanObject;

}



// =====================================
// SANITIZE PROMPT
// =====================================

function sanitizePrompt(
  prompt
){

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

  sanitized =
  sanitized.trim();

  if(
    sanitized !== normalized
  ){

    if(
      typeof securityState ===
      "object"
    ){

      securityState
      .blockedPrompts++;

    }

  }

  return sanitized;

}



// =====================================
// SAFE JSON STRINGIFY
// =====================================

function safeJSONStringify(
  value
){

  try{

    const sanitized =
    sanitizeObject(
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

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(

        "JSON_STRINGIFY_FAILED",

        {

          error:
          String(error)

        }

      );

    }

    return "{}";

  }

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

  object:
  sanitizeObject,

  array:
  sanitizeArray,

  prompt:
  sanitizePrompt,

  stringify:
  safeJSONStringify

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

    "SecuritySanitize",

    {

      value:
      SecuritySanitize,

      writable:
      false,

      configurable:
      false

    }

  );

}
