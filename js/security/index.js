// =====================================
// RIGO AI
// SECURITY ENTRY POINT
// =====================================



// =====================================
// RE-EXPORTS
// =====================================

export * from "./security-types.js";

export * from "./security-errors.js";

export * from "./security-sanitize.js";

export * from "./security-validator.js";

export * from "./security-url.js";

export * from "./security-freeze.js";

export * from "./security-policy.js";

export * from "./security-monitor.js";

export * from "./security-report.js";

export * from "./security-sandbox.js";

export * from "./security-runtime.js";

export * from "./security-core.js";



// =====================================
// IMPORTS
// =====================================

import SecuritySanitize
from "./security-sanitize.js";

import SecurityValidator
from "./security-validator.js";

import SecurityURL
from "./security-url.js";

import SecurityFreeze
from "./security-freeze.js";

import SecurityPolicy
from "./security-policy.js";

import SecurityMonitor
from "./security-monitor.js";

import SecurityReport
from "./security-report.js";

import SecuritySandbox
from "./security-sandbox.js";

import SecurityRuntime
from "./security-runtime.js";

import SecurityCore
from "./security-core.js";



// =====================================
// SECURITY MODULE
// =====================================

const Security =
Object.freeze({

  Sanitize:
  SecuritySanitize,

  Validator:
  SecurityValidator,

  URL:
  SecurityURL,

  Freeze:
  SecurityFreeze,

  Policy:
  SecurityPolicy,

  Monitor:
  SecurityMonitor,

  Report:
  SecurityReport,

  Sandbox:
  SecuritySandbox,

  Runtime:
  SecurityRuntime,

  Core:
  SecurityCore

});



// =====================================
// EXPORTS
// =====================================

export {

  Security

};

export default
Security;
