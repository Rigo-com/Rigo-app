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

  return sanitized;

}
