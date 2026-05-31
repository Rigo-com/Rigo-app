// =====================================
// RIGO AI
// SECURITY POLICY
// SECURITY POLICY LAYER
// =====================================

import {

  PolicyError

}
from "./security-errors.js";

import {

  SECURITY_ACTIONS

}
from "./security-types.js";



// =====================================
// DEFAULT POLICY
// =====================================

const DEFAULT_SECURITY_POLICY =
Object.freeze({

  allowHTTP:
  false,

  allowUnsafeURLs:
  false,

  allowPrototypeMutation:
  false,

  allowUnknownObjects:
  false,

  allowUnsafeContent:
  false

});



// =====================================
// CREATE POLICY
// =====================================

function createPolicy(
  overrides = {}
){

  return Object.freeze({

    ...DEFAULT_SECURITY_POLICY,

    ...overrides

  });

}



// =====================================
// POLICY CHECK
// =====================================

function checkPolicy(
  condition,
  message
){

  if(
    condition
  ){

    return true;

  }

  throw new PolicyError(
    message
  );

}



// =====================================
// ENFORCE POLICY
// =====================================

function enforcePolicy(
  policy,
  context = {}
){

  if(
    !policy
  ){

    throw new PolicyError(
      "Policy is required"
    );

  }

  if(

    context.protocol ===
    "http:"

    &&

    policy.allowHTTP ===
    false

  ){

    throw new PolicyError(
      "HTTP protocol is blocked"
    );

  }

  if(

    context.unsafeURL ===
    true

    &&

    policy.allowUnsafeURLs ===
    false

  ){

    throw new PolicyError(
      "Unsafe URL detected"
    );

  }

  if(

    context.prototypeMutation ===
    true

    &&

    policy.allowPrototypeMutation ===
    false

  ){

    throw new PolicyError(
      "Prototype mutation blocked"
    );

  }

  if(

    context.unknownObject ===
    true

    &&

    policy.allowUnknownObjects ===
    false

  ){

    throw new PolicyError(
      "Unknown object blocked"
    );

  }

  if(

    context.unsafeContent ===
    true

    &&

    policy.allowUnsafeContent ===
    false

  ){

    throw new PolicyError(
      "Unsafe content blocked"
    );

  }

  return SECURITY_ACTIONS.ALLOW;

}



// =====================================
// POLICY VALIDATION
// =====================================

function validatePolicy(
  policy
){

  if(

    !policy ||

    typeof policy !==
    "object"

  ){

    throw new PolicyError(
      "Invalid policy"
    );

  }

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SecurityPolicy =
Object.freeze({

  create:
  createPolicy,

  check:
  checkPolicy,

  enforce:
  enforcePolicy,

  validate:
  validatePolicy

});



// =====================================
// EXPORTS
// =====================================

export {

  DEFAULT_SECURITY_POLICY,

  createPolicy,

  checkPolicy,

  enforcePolicy,

  validatePolicy,

  SecurityPolicy

};
