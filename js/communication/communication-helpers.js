// =====================================
// RIGO AI
// COMMUNICATION HELPERS
// UTILITY LAYER
// =====================================

import {
  COMMUNICATION_TIMERS
}
from "./communication-config.js";



// =====================================
// IDS
// =====================================

function createCommunicationId(
  prefix = "comm"
){

  return (

    String(prefix)

    + "_"

    + Date.now()

    + "_"

    + Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// DELAY
// =====================================

function waitCommunication(
  duration =
  COMMUNICATION_TIMERS
  .RETRY_DELAY
){

  return new Promise(
    resolve => {

      setTimeout(
        resolve,
        duration
      );

    }
  );

}



// =====================================
// HASHING
// =====================================

function createMessageHash(
  value = ""
){

  return String(
    value
  )
  .trim()
  .toLowerCase();

}



// =====================================
// VALIDATION
// =====================================

function isValidRequestId(
  requestId
){

  return (

    typeof requestId ===
    "string"

    &&

    requestId.length > 0

  );

}



function isValidPayload(
  payload
){

  return (

    payload !== null

    &&

    typeof payload ===
    "object"

  );

}



function isValidUrl(
  url
){

  if(
    typeof url !==
    "string"
  ){
    return false;
  }

  try{

    new URL(
      url
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// RESPONSE HELPERS
// =====================================

function isSuccessResponse(
  response
){

  return Boolean(

    response

    &&

    response.ok ===
    true

  );

}



function normalizeError(
  error
){

  if(
    error instanceof Error
  ){

    return {

      name:
      error.name,

      message:
      error.message

    };

  }

  return {

    name:
    "Error",

    message:
    String(
      error ??
      "Unknown Error"
    )

  };

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationHelpers =
Object.freeze({

  createCommunicationId,

  waitCommunication,

  createMessageHash,

  isValidRequestId,

  isValidPayload,

  isValidUrl,

  isSuccessResponse,

  normalizeError

});



// =====================================
// EXPORTS
// =====================================

export {

  createCommunicationId,

  waitCommunication,

  createMessageHash,

  isValidRequestId,

  isValidPayload,

  isValidUrl,

  isSuccessResponse,

  normalizeError,

  CommunicationHelpers

};

export default
CommunicationHelpers;
