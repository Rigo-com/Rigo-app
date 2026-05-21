// =====================================
// VALIDATE SECURE INPUT
// =====================================

function validateSecureInput(
  input
){

  if(
    typeof input !==
    "string"
  ){

    return deepFreezeSecurity({

      valid:false,

      reason:
      "INVALID_INPUT",

      checkedAt:
      Date.now()

    });

  }

  const normalized =
  safeString(input);

  if(!normalized){

    return deepFreezeSecurity({

      valid:false,

      reason:
      "EMPTY_INPUT",

      checkedAt:
      Date.now()

    });

  }

  if(

    normalized.length >

    SECURITY_CONFIG
    .MAX_STRING_LENGTH

  ){

    return deepFreezeSecurity({

      valid:false,

      reason:
      "MAX_LENGTH_EXCEEDED",

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // XSS DETECTION
  // ===================================

  const hasXSS =

    SECURITY_PATTERNS
    .XSS
    .some((pattern) => {

      return (

        pattern instanceof
        RegExp

        &&

        pattern.test(
          normalized
        )

      );

    });

  if(hasXSS){

    if(

      Number.isFinite(

        securityState
        .blockedRequests

      )

    ){

      securityState
      .blockedRequests++;

    }

    else{

      securityState
      .blockedRequests =
      1;

    }

    logSecurityEvent(
      "XSS PAYLOAD BLOCKED"
    );

    return deepFreezeSecurity({

      valid:false,

      reason:"XSS",

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // PROMPT INJECTION
  // ===================================

  const promptAnalysis =
  detectPromptInjection(
    normalized
  );

  if(
    promptAnalysis.detected
  ){

    return deepFreezeSecurity({

      valid:false,

      reason:
      "PROMPT_INJECTION",

      score:
      promptAnalysis.score,

      checkedAt:
      Date.now()

    });

  }



  // ===================================
  // VALID INPUT
  // ===================================

  return deepFreezeSecurity({

    valid:true,

    reason:null,

    normalizedLength:
    normalized.length,

    checkedAt:
    Date.now()

  });

}
