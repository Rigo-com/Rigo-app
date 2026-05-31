// =====================================
// RIGO AI
// SECURITY URL
// URL SECURITY LAYER
// =====================================

import {

  URLError

}
from "./security-errors.js";



// =====================================
// CONFIG
// =====================================

const SECURITY_URL_CONFIG =
Object.freeze({

  ALLOWED_PROTOCOLS:
  Object.freeze([

    "https:"

  ]),

  BLOCKED_PROTOCOLS:
  Object.freeze([

    "javascript:",

    "data:",

    "vbscript:",

    "file:",

    "blob:"

  ])

});



// =====================================
// PARSE URL
// =====================================

function parseURL(
  value
){

  if(
    typeof value !==
    "string"
  ){

    throw new URLError(
      "URL must be a string"
    );

  }

  try{

    return new URL(
      value.trim()
    );

  }

  catch{

    throw new URLError(
      "Invalid URL"
    );

  }

}



// =====================================
// PROTOCOL
// =====================================

function validateProtocol(
  protocol
){

  const normalized =
  String(protocol)
  .toLowerCase();

  if(

    SECURITY_URL_CONFIG
    .BLOCKED_PROTOCOLS
    .includes(
      normalized
    )

  ){

    throw new URLError(
      "Blocked URL protocol"
    );

  }

  if(

    !SECURITY_URL_CONFIG
    .ALLOWED_PROTOCOLS
    .includes(
      normalized
    )

  ){

    throw new URLError(
      "Unsupported URL protocol"
    );

  }

  return true;

}



// =====================================
// VALIDATE URL
// =====================================

function validateURL(
  value
){

  const parsed =
  parseURL(
    value
  );

  validateProtocol(
    parsed.protocol
  );

  return true;

}



// =====================================
// SANITIZE URL
// =====================================

function sanitizeURL(
  value
){

  const parsed =
  parseURL(
    value
  );

  validateProtocol(
    parsed.protocol
  );

  return parsed.href;

}



// =====================================
// SAFE URL
// =====================================

function isSafeURL(
  value
){

  try{

    validateURL(
      value
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const SecurityURL =
Object.freeze({

  validate:
  validateURL,

  sanitize:
  sanitizeURL,

  isSafe:
  isSafeURL,

  parse:
  parseURL

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_URL_CONFIG,

  parseURL,

  validateProtocol,

  validateURL,

  sanitizeURL,

  isSafeURL,

  SecurityURL

};
