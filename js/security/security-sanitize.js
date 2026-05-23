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
    /\u0000/g,
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

  const blockedProtocols = [

    "javascript:",

    "data:",

    "vbscript:"

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

  return normalized;

}



// =====================================
// SANITIZE OBJECT
// =====================================

function sanitizeObject(
  object,
  visited = new WeakSet()
){

  if(
    object == null
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

    return null;

  }

  visited.add(
    object
  );

  if(
    Array.isArray(object)
  ){

    return object.map((item) => {

      return sanitizeObject(
        item,
        visited
      );

    });

  }

  const cleanObject =
  Object.create(null);

  Object.entries(object)
  .forEach(([key,value]) => {

    if(

      key === "__proto__" ||

      key === "constructor" ||

      key === "prototype"

    ){

      return;

    }

    cleanObject[
      safeString(key)
    ] = sanitizeObject(
      value,
      visited
    );

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

  return normalized

  .replace(
    /ignore previous instructions/gi,
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

  .trim();

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

  prompt:
  sanitizePrompt

});
