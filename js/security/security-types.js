// =====================================
// RIGO AI
// SECURITY TYPES
// SECURITY CONSTANTS FOUNDATION
// =====================================



// =====================================
// SECURITY LEVELS
// =====================================

const SECURITY_LEVELS =
Object.freeze({

  LOW:
  "low",

  MEDIUM:
  "medium",

  HIGH:
  "high",

  CRITICAL:
  "critical"

});



// =====================================
// SECURITY SEVERITY
// =====================================

const SECURITY_SEVERITY =
Object.freeze({

  INFO:
  "info",

  WARNING:
  "warning",

  ERROR:
  "error",

  CRITICAL:
  "critical"

});



// =====================================
// SECURITY EVENTS
// =====================================

const SECURITY_EVENTS =
Object.freeze({

  VALIDATION_FAILED:
  "security.validation.failed",

  SANITIZATION_FAILED:
  "security.sanitization.failed",

  POLICY_VIOLATION:
  "security.policy.violation",

  URL_BLOCKED:
  "security.url.blocked",

  SANDBOX_VIOLATION:
  "security.sandbox.violation",

  SECURITY_ERROR:
  "security.error"

});



// =====================================
// SECURITY ACTIONS
// =====================================

const SECURITY_ACTIONS =
Object.freeze({

  ALLOW:
  "allow",

  BLOCK:
  "block",

  SANITIZE:
  "sanitize",

  LOG:
  "log",

  REPORT:
  "report"

});



// =====================================
// SECURITY STATUS
// =====================================

const SECURITY_STATUS =
Object.freeze({

  ACTIVE:
  "active",

  DISABLED:
  "disabled",

  BLOCKED:
  "blocked",

  FAILED:
  "failed"

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_LEVELS,

  SECURITY_SEVERITY,

  SECURITY_EVENTS,

  SECURITY_ACTIONS,

  SECURITY_STATUS

};
