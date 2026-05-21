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

  let normalized =
  String(value);

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



function escapeHTML(
  input
){

  return safeString(input)

  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#39;");

}



function sanitizeHTML(
  input
){

  const sanitized =
  escapeHTML(input);

  securityState
  .sanitizedPayloads++;

  return sanitized;

}
