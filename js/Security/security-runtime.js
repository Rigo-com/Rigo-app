function registerSecurityPatterns(){

  Object.values(
    SECURITY_PATTERNS
  )
  .flat()
  .forEach((pattern) => {

    securityState
    .blockedPatterns
    .add(
      pattern
    );

  });

  return true;

}



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

    if(
      typeof logDiagnosticWarning ===
      "function"
    ){

      logDiagnosticWarning(

        "[SECURITY] " +
        String(message),

        metadata

      );

    }

    else{

      console.warn(
        "[SECURITY]",
        message,
        metadata || ""
      );

    }

  }

  catch(error){

    return false;

  }

  return true;

}
