// =====================================
// REGISTER SECURITY PATTERNS
// =====================================

function registerSecurityPatterns(){

  if(
    securityState
    .blockedPatterns
    .size > 0
  ){

    return true;

  }

  Object.values(
    SECURITY_PATTERNS
  )
  .flat()
  .forEach((pattern) => {

    if(
      !(pattern instanceof RegExp)
    ){

      logSecurityEvent(
        "INVALID SECURITY PATTERN"
      );

      return;

    }

    securityState
    .blockedPatterns
    .add(
      pattern
    );

  });

  return true;

}



// =====================================
// SECURITY LOGGER
// =====================================

function logSecurityEvent(
  message,
  metadata = null
){

  if(

    !SECURITY_CONFIG
    .ENABLE_SECURITY_LOGGING

  ){

    return false;

  }

  try{

    const safeMessage =
    safeString(
      message
    );

    const safeMetadata =

      metadata == null

      ?

      null

      :

      sanitizeObject(
        metadata
      );

    if(
      typeof logDiagnosticWarning ===
      "function"
    ){

      logDiagnosticWarning(

        "[SECURITY] " +
        safeMessage,

        safeMetadata

      );

    }

    else{

      console.warn(
        "[SECURITY]",
        safeMessage,
        safeMetadata || ""
      );

    }

  }

  catch(error){

    console.error(

      "[SECURITY LOGGER FAILURE]",

      error

    );

    return false;

  }

  return true;

}
