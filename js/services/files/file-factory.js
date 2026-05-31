// =====================================
// RIGO AI
// FILE FACTORY
// FILE ENTITY FACTORY
// =====================================

import {

  validateFile

}
from "./file-validator.js";

import {

  createFileId,

  sanitizeFileName,

  getFileExtension,

  createFileFingerprint

}
from "./file-utils.js";



// =====================================
// FILE OBJECT
// =====================================

function createFileObject(
  file
){

  if(
    !validateFile(
      file
    )
  ){

    return null;

  }

  const sanitizedName =
  sanitizeFileName(
    file.name
  );

  return Object.freeze({

    id:
    createFileId(),

    name:
    sanitizedName,

    size:
    file.size,

    type:
    file.type,

    extension:
    getFileExtension(
      sanitizedName
    ),

    lastModified:
    file.lastModified,

    createdAt:
    Date.now(),

    fingerprint:
    createFileFingerprint(
      file
    ),

    rawFile:
    file

  });

}



// =====================================
// EXPORTS
// =====================================

export {

  createFileObject

};
