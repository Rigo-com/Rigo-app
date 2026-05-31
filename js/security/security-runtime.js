// =====================================
// RIGO AI
// SECURITY RUNTIME
// SECURITY ORCHESTRATION LAYER
// =====================================

import {

  SecuritySanitize

}
from "./security-sanitize.js";

import {

  SecurityValidator

}
from "./security-validator.js";

import {

  SecurityURL

}
from "./security-url.js";

import {

  SecurityPolicy,

  DEFAULT_SECURITY_POLICY

}
from "./security-policy.js";

import {

  SecuritySandbox

}
from "./security-sandbox.js";

import {

  SecurityMonitor

}
from "./security-monitor.js";

import {

  SECURITY_EVENTS,

  SECURITY_SEVERITY

}
from "./security-types.js";



// =====================================
// SECURE VALUE
// =====================================

function secureValue(
  value
){

  return SecuritySanitize
  .value(
    value
  );

}



// =====================================
// VALIDATE VALUE
// =====================================

function validateValue(
  validator,
  value,
  options = {}
){

  return validator(
    value,
    options
  );

}



// =====================================
// SECURE URL
// =====================================

function secureURL(
  url
){

  return SecurityURL
  .sanitize(
    url
  );

}



// =====================================
// CHECK POLICY
// =====================================

function checkPolicy(
  context,
  policy =
  DEFAULT_SECURITY_POLICY
){

  return SecurityPolicy
  .enforce(
    policy,
    context
  );

}



// =====================================
// CHECK CODE
// =====================================

function validateCode(
  code
){

  return SecuritySandbox
  .validateExecution(
    code
  );

}



// =====================================
// SECURITY EVENT
// =====================================

function recordSecurityEvent(
  type,
  details = {},
  severity =
  SECURITY_SEVERITY.INFO
){

  return SecurityMonitor
  .record(

    type,

    details,

    severity

  );

}



// =====================================
// SECURITY VIOLATION
// =====================================

function recordViolation(
  type,
  details = {}
){

  return SecurityMonitor
  .violation(

    type,

    details

  );

}



// =====================================
// SECURE PAYLOAD
// =====================================

function securePayload(
  payload
){

  try{

    const sanitized =

      SecuritySanitize
      .value(
        payload
      );

    recordSecurityEvent(

      SECURITY_EVENTS
      .SANITIZATION_FAILED,

      {

        success:true

      }

    );

    return sanitized;

  }

  catch(error){

    recordViolation(

      SECURITY_EVENTS
      .SANITIZATION_FAILED,

      {

        error:
        error.message

      }

    );

    throw error;

  }

}



// =====================================
// PUBLIC API
// =====================================

const SecurityRuntime =
Object.freeze({

  secureValue,

  validateValue,

  secureURL,

  checkPolicy,

  validateCode,

  securePayload,

  recordSecurityEvent,

  recordViolation

});



// =====================================
// EXPORTS
// =====================================

export {

  secureValue,

  validateValue,

  secureURL,

  checkPolicy,

  validateCode,

  securePayload,

  recordSecurityEvent,

  recordViolation,

  SecurityRuntime

};
