// =====================================
// RIGO AI
// API HELPERS
// =====================================

import {

  APIValidationError,

  APIAbortError

}
from "./api-errors.js";



// =====================================
// REQUEST ID
// =====================================

function createRequestId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return crypto
      .randomUUID();

    }

  }

  catch{}

  return (

    "api_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// WAIT
// =====================================

function wait(
  duration = 0
){

  return new Promise(
    (resolve) => {

      setTimeout(

        resolve,

        duration

      );

    }
  );

}



// =====================================
// DEEP CLONE
// =====================================

function deepClone(
  value
){

  try{

    if(

      typeof structuredClone ===
      "function"

    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch{

    return null;

  }

}



// =====================================
// FREEZE
// =====================================

function freezeObject(
  value,
  visited =
  new WeakSet()
){

  if(

    value === null ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(
      value
    )
  ){

    return value;

  }

  visited.add(
    value
  );

  Reflect
  .ownKeys(value)
  .forEach((key) => {

    freezeObject(

      value[key],

      visited

    );

  });

  return Object.freeze(
    value
  );

}



// =====================================
// ENDPOINT
// =====================================

function validateEndpoint(
  endpoint
){

  const valid =

    typeof endpoint ===
    "string"

    &&

    endpoint.trim()
    .length > 0;

  if(!valid){

    throw new APIValidationError(
      "Invalid endpoint"
    );

  }

  return true;

}



// =====================================
// ABORT ERROR
// =====================================

function isAbortError(
  error
){

  if(!error){

    return false;

  }

  return (

    error.name ===
    "AbortError"

  );

}



// =====================================
// RESPONSE
// =====================================

async function parseResponse(
  response
){

  const contentType =

    response.headers
    .get(
      "content-type"
    ) || "";

  try{

    if(

      contentType.includes(
        "application/json"
      )

    ){

      return await response
      .json();

    }

    if(

      contentType.includes(
        "text/"
      )

    ){

      return await response
      .text();

    }

    return await response
    .blob();

  }

  catch{

    return null;

  }

}



// =====================================
// ABORT CHECK
// =====================================

function throwIfAborted(
  error
){

  if(
    isAbortError(
      error
    )
  ){

    throw new APIAbortError(
      "Request aborted"
    );

  }

  return false;

}



// =====================================
// EXPORTS
// =====================================

export {

  createRequestId,

  wait,

  deepClone,

  freezeObject,

  validateEndpoint,

  isAbortError,

  parseResponse,

  throwIfAborted

};
