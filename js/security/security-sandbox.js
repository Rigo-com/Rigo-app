// =====================================
// RIGO AI
// SECURITY SANDBOX
// EXECUTION SAFETY LAYER
// =====================================

import {

  SandboxError

}
from "./security-errors.js";



// =====================================
// CONFIG
// =====================================

const SECURITY_SANDBOX_CONFIG =
Object.freeze({

  BLOCKED_PATTERNS:
  Object.freeze([

    /\beval\s*\(/i,

    /\bFunction\s*\(/i,

    /\bsetTimeout\s*\(/i,

    /\bsetInterval\s*\(/i,

    /\bimport\s*\(/i,

    /\brequire\s*\(/i,

    /\bglobalThis\b/i,

    /\bwindow\b/i,

    /\bdocument\b/i,

    /\bprocess\b/i

  ])

});



// =====================================
// SAFE CODE CHECK
// =====================================

function isSafeCode(
  code
){

  if(
    typeof code !==
    "string"
  ){

    return false;

  }

  return !

  SECURITY_SANDBOX_CONFIG
  .BLOCKED_PATTERNS

  .some((pattern) =>

    pattern.test(
      code
    )

  );

}



// =====================================
// VALIDATE EXECUTION
// =====================================

function validateExecution(
  code
){

  if(
    !isSafeCode(
      code
    )
  ){

    throw new SandboxError(
      "Unsafe code detected"
    );

  }

  return true;

}



// =====================================
// RESTRICTED SCOPE
// =====================================

function createRestrictedScope(
  scope = {}
){

  if(

    !scope ||

    typeof scope !==
    "object"

  ){

    throw new SandboxError(
      "Invalid sandbox scope"
    );

  }

  const blockedKeys =
  new Set([

    "window",

    "document",

    "globalThis",

    "process",

    "require",

    "eval",

    "Function"

  ]);

  const restricted =
  Object.create(null);

  Object.entries(scope)
  .forEach(([

    key,

    value

  ]) => {

    if(
      blockedKeys.has(
        key
      )
    ){

      return;

    }

    restricted[key] =
    value;

  });

  return Object.freeze(
    restricted
  );

}



// =====================================
// CONTEXT
// =====================================

function createContext(
  scope = {}
){

  return Object.freeze({

    createdAt:
    Date.now(),

    scope:
    createRestrictedScope(
      scope
    )

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecuritySandbox =
Object.freeze({

  isSafeCode,

  validateExecution,

  createRestrictedScope,

  createContext

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_SANDBOX_CONFIG,

  isSafeCode,

  validateExecution,

  createRestrictedScope,

  createContext,

  SecuritySandbox

};

export default SecuritySandbox;
