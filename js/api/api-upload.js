// =====================================
// RIGO AI
// API UPLOAD
// FILE UPLOAD ENGINE
// =====================================

import {

  API_CONFIG

}
from "./api-config.js";

import {

  apiState

}
from "./api-state.js";

import {

  APIValidationError

}
from "./api-errors.js";

import {

  executeRequest

}
from "./api-request.js";



// =====================================
// VALIDATE FILE
// =====================================

function validateFile(
  file
){

  if(

    typeof File ===
    "undefined"

  ){

    throw new APIValidationError(
      "File API unavailable"
    );

  }

  if(

    !(file instanceof File)

  ){

    throw new APIValidationError(
      "Invalid file"
    );

  }

  return true;

}



// =====================================
// UPLOAD
// =====================================

async function uploadFile(
  file,
  options = {}
){

  validateFile(
    file
  );

  const formData =
  new FormData();

  formData.append(
    "file",
    file
  );

  apiState
  .diagnostics
  .uploads++;

  return executeRequest({

    endpoint:

      options.endpoint ||

      API_CONFIG
      .UPLOAD_ENDPOINT,

    method:"POST",

    body:
    formData,

    headers:{

      Accept:
      "application/json"

    },

    ...options

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  uploadFile

};
