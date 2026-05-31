// =====================================
// RIGO AI
// SECURITY ERRORS
// UNIFIED SECURITY ERROR SYSTEM
// =====================================

import {

  SECURITY_SEVERITY

}
from "./security-types.js";



// =====================================
// BASE SECURITY ERROR
// =====================================

class SecurityError
extends Error{

  constructor(
    message = "Security error",
    options = {}
  ){

    super(message);

    if(
  Error.captureStackTrace
){

  Error.captureStackTrace(
    this,
    this.constructor
  );

}
    
    this.name =
    "SecurityError";

    this.code =
    options.code ??
    "SECURITY_ERROR";

    this.severity =
    options.severity ??
    SECURITY_SEVERITY.ERROR;

    this.timestamp =
    Date.now();

    this.details =
    options.details ??
    null;

  }

}



// =====================================
// VALIDATION ERROR
// =====================================

class ValidationError
extends SecurityError{

  constructor(
    message = "Validation failed",
    options = {}
  ){

    super(
      message,
      {
        ...options,
        code:
        options.code ??
        "VALIDATION_ERROR"
      }
    );

    this.name =
    "ValidationError";

  }

}



// =====================================
// SANITIZATION ERROR
// =====================================

class SanitizationError
extends SecurityError{

  constructor(
    message = "Sanitization failed",
    options = {}
  ){

    super(
      message,
      {
        ...options,
        code:
        options.code ??
        "SANITIZATION_ERROR"
      }
    );

    this.name =
    "SanitizationError";

  }

}



// =====================================
// POLICY ERROR
// =====================================

class PolicyError
extends SecurityError{

  constructor(
    message = "Policy violation",
    options = {}
  ){

    super(
      message,
      {
        ...options,
        code:
        options.code ??
        "POLICY_ERROR"
      }
    );

    this.name =
    "PolicyError";

  }

}



// =====================================
// URL ERROR
// =====================================

class URLError
extends SecurityError{

  constructor(
    message = "URL validation failed",
    options = {}
  ){

    super(
      message,
      {
        ...options,
        code:
        options.code ??
        "URL_ERROR"
      }
    );

    this.name =
    "URLError";

  }

}



// =====================================
// SANDBOX ERROR
// =====================================

class SandboxError
extends SecurityError{

  constructor(
    message = "Sandbox violation",
    options = {}
  ){

    super(
      message,
      {
        ...options,
        code:
        options.code ??
        "SANDBOX_ERROR"
      }
    );

    this.name =
    "SandboxError";

  }

}



// =====================================
// RUNTIME SECURITY ERROR
// =====================================

class RuntimeSecurityError
extends SecurityError{

  constructor(
    message = "Runtime security error",
    options = {}
  ){

    super(
      message,
      {
        ...options,
        code:
        options.code ??
        "RUNTIME_SECURITY_ERROR"
      }
    );

    this.name =
    "RuntimeSecurityError";

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  SecurityError,

  ValidationError,

  SanitizationError,

  PolicyError,

  URLError,

  SandboxError,

  RuntimeSecurityError

};
