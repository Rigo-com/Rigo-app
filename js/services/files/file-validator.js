// =====================================
// RIGO AI
// FILE VALIDATOR
// FILE VALIDATION LAYER
// =====================================

import {

  FILE_CONFIG

}
from "./file-config.js";

import {

  fileState,

  setFileError

}
from "./file-state.js";

import {

  getFileExtension,

  createFileFingerprint

}
from "./file-utils.js";



// =====================================
// FILE EXTENSION
// =====================================

function validateFileExtension(
  filename
){

  const extension =
  getFileExtension(
    filename
  );

  return (

    FILE_CONFIG
    .ALLOWED_EXTENSIONS
    .includes(
      extension
    )

  );

}



// =====================================
// FILE VALIDATION
// =====================================

function validateFile(
  file
){

  if(

    !file ||

    typeof file !==
    "object"

  ){

    setFileError(
      "INVALID FILE OBJECT"
    );

    return false;

  }

  const validName =

    typeof file.name ===
    "string"

    &&

    file.name.trim()
    .length > 0;

  const validSize =

    Number.isFinite(
      file.size
    )

    &&

    file.size >= 0;

  const validType =

    typeof file.type ===
    "string";

  if(

    !validName ||

    !validSize ||

    !validType

  ){

    setFileError(
      "INVALID FILE DATA"
    );

    return false;

  }

  const validMimeType =

    FILE_CONFIG
    .ALLOWED_TYPES
    .includes(
      file.type
    );

  const validExtension =
  validateFileExtension(
    file.name
  );

  if(

    !validMimeType ||

    !validExtension

  ){

    setFileError(
      "INVALID FILE TYPE"
    );

    return false;

  }

  if(

    file.size >

    FILE_CONFIG
    .MAX_FILE_SIZE

  ){

    setFileError(
      "FILE TOO LARGE"
    );

    return false;

  }

  setFileError(
    null
  );

  return true;

}



// =====================================
// DUPLICATE CHECK
// =====================================

function isDuplicateFile(
  file
){

  return (

    fileState
    .fingerprints
    .has(

      createFileFingerprint(
        file
      )

    )

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  validateFileExtension,

  validateFile,

  isDuplicateFile

};
