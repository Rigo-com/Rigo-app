// =====================================
// RIGO AI
// SECURITY CORE
// SECURITY FACADE LAYER
// =====================================

import {

  SecurityRuntime

}
from "./security-runtime.js";

import {

  SecurityReport

}
from "./security-report.js";



// =====================================
// SANITIZE
// =====================================

function sanitize(
  value
){

  return SecurityRuntime
  .secureValue(
    value
  );

}



// =====================================
// VALIDATE
// =====================================

function validate(
  validator,
  value,
  options = {}
){

  return SecurityRuntime
  .validateValue(

    validator,

    value,

    options

  );

}



// =====================================
// URL
// =====================================

function secureURL(
  url
){

  return SecurityRuntime
  .secureURL(
    url
  );

}



// =====================================
// POLICY
// =====================================

function checkPolicy(
  context,
  policy
){

  return SecurityRuntime
  .checkPolicy(

    context,

    policy

  );

}



// =====================================
// CODE
// =====================================

function validateCode(
  code
){

  return SecurityRuntime
  .validateCode(
    code
  );

}



// =====================================
// PAYLOAD
// =====================================

function securePayload(
  payload
){

  return SecurityRuntime
  .securePayload(
    payload
  );

}



// =====================================
// EVENTS
// =====================================

function recordEvent(
  type,
  details,
  severity
){

  return SecurityRuntime
  .recordSecurityEvent(

    type,

    details,

    severity

  );

}



function recordViolation(
  type,
  details
){

  return SecurityRuntime
  .recordViolation(

    type,

    details

  );

}



// =====================================
// REPORTS
// =====================================

function getSummary(){

  return SecurityReport
  .summary();

}



function getReport(){

  return SecurityReport
  .create();

}



function getFilteredReport(
  severity
){

  return SecurityReport
  .filtered(
    severity
  );

}



// =====================================
// PUBLIC API
// =====================================

const SecurityCore =
Object.freeze({

  sanitize,

  validate,

  secureURL,

  checkPolicy,

  validateCode,

  securePayload,

  recordEvent,

  recordViolation,

  getSummary,

  getReport,

  getFilteredReport

});



// =====================================
// EXPORTS
// =====================================

export {

  sanitize,

  validate,

  secureURL,

  checkPolicy,

  validateCode,

  securePayload,

  recordEvent,

  recordViolation,

  getSummary,

  getReport,

  getFilteredReport,

  SecurityCore

};
