// =====================================
// RIGO AI
// SECURITY SANITIZE
// ENTERPRISE SANITIZATION ENGINE
// =====================================



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

    logSecurityEvent(
      "STRING_CONVERSION_FAILED"
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

  normalized =
  normalized.replace(
    /[\u0000-\u001F\u007F]/g,
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
  .replace(/`/g,"&#96;")
  .replace(/=/g,"&#61;");

}



// =====================================
// SANITIZE HTML
// =====================================

function sanitizeHTML(
  input
){

  const sanitized =
  escapeHTML(input);

  if(

    Number.isFinite(

      securityState
      .sanitizedPayloads

    )

  ){

    securityState
    .sanitizedPayloads++;

  }

  else{

    securityState
    .sanitizedPayloads =
    1;

  }

  logSecurityEvent(
    "HTML SANITIZED"
  );

  return sanitized;

}



// =====================================
// SANITIZE URL
// =====================================

function sanitizeURL(
  url
){

  const normalized =
  safeString(url);

  if(!normalized){

    return "";
  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_URL_LENGTH

  ){

    securityState
    .blockedURLs++;

    logSecurityEvent(
      "URL LENGTH BLOCKED"
    );

    return "";
  }

  const blockedProtocols = [

    "javascript:",

    "data:",

    "vbscript:",

    "file:"

  ];

  const lowered =
  normalized
  .toLowerCase();

  const blocked =
  blockedProtocols
  .some((protocol) => {

    return lowered.startsWith(
      protocol
    );

  });

  if(blocked){

    securityState
    .blockedURLs++;

    logSecurityEvent(
      "BLOCKED URL",
      { url }
    );

    return "";
  }

  if(

    SECURITY_CONFIG
    .ENABLE_HTTP_PROTOCOL ===
    false

    &&

    lowered.startsWith(
      "http:"
    )

  ){

    securityState
    .blockedURLs++;

    logSecurityEvent(
      "INSECURE HTTP BLOCKED",
      { url }
    );

    return "";
  }

  return normalized;

}



// =====================================
// SANITIZE ARRAY
// =====================================

function sanitizeArray(
  values = [],
  visited = new WeakSet()
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
      visited
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

    SECURITY_CONFIG
    .MAX_JSON_DEPTH

  ){

    return null;

  }

  if(

    typeof object !==
    "object"

  ){

    return safeString(
      object
    );

  }

  if(
    visited.has(object)
  ){

    return "[Circular]";

  }

  visited.add(
    object
  );

  if(
    Array.isArray(object)
  ){

    return sanitizeArray(
      object,
      visited
    );

  }

  const keys =
  Object.keys(object)
  .slice(

    0,

    SECURITY_CONFIG
    .MAX_OBJECT_KEYS

  );

  const cleanObject =
  Object.create(null);

  keys.forEach((key) => {

    if(

      key === "__proto__" ||

      key === "constructor" ||

      key === "prototype"

    ){

      return;

    }

    try{

      cleanObject[
        safeString(key)
      ] = sanitizeObject(

        object[key],

        visited,

        depth + 1

      );

    }

    catch(error){

      cleanObject[
        safeString(key)
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

  const sanitized =
  normalized

  .replace(
    /ignore previous instructions/gi,
    ""
  )

  .replace(
    /ignore all previous instructions/gi,
    ""
  )

  .replace(
    /system prompt/gi,
    ""
  )

  .replace(
    /developer message/gi,
    ""
  )

  .replace(
    /reveal hidden prompt/gi,
    ""
  )

  .replace(
    /show internal instructions/gi,
    ""
  )

  .trim();

  if(
    sanitized !== normalized
  ){

    securityState
    .blockedPrompts++;

    logSecurityEvent(
      "PROMPT SANITIZED"
    );

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
      sanitized
    );

  }

  catch(error){

    logSecurityEvent(

      "JSON_STRINGIFY_FAILED",

      {
        error:
        String(error)
      }

    );

    return "{}";

  }

}



// =====================================
// PUBLIC API
// =====================================

const SecuritySanitize =
Object.freeze({

  string:
  safeString,

  html:
  sanitizeHTML,

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
