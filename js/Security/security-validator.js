function validateSecureInput(
  input
){

  if(
    typeof input !==
    "string"
  ){

    return {

      valid:false,

      reason:"INVALID_INPUT"

    };

  }

  const normalized =
  safeString(input);

  if(!normalized){

    return {

      valid:false,

      reason:"EMPTY_INPUT"

    };

  }

  const hasXSS =

    SECURITY_PATTERNS
    .XSS
    .some((pattern) => {

      return pattern.test(
        normalized
      );

    });

  if(hasXSS){

    securityState
    .blockedRequests++;

    logSecurityEvent(
      "XSS PAYLOAD BLOCKED"
    );

    return {

      valid:false,

      reason:"XSS"

    };

  }

  const promptAnalysis =
  detectPromptInjection(
    normalized
  );

  if(
    promptAnalysis.detected
  ){

    return {

      valid:false,

      reason:
      "PROMPT_INJECTION",

      score:
      promptAnalysis.score

    };

  }

  return {

    valid:true,

    reason:null

  };

}
