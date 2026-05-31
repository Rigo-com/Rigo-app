// =====================================
// RIGO AI
// FILE URL
// OBJECT URL MANAGEMENT LAYER
// =====================================

import {

  fileState

}
from "./file-state.js";

import {

  validateFile

}
from "./file-validator.js";



// =====================================
// CREATE URL
// =====================================

function createFileURL(
  file
){

  if(
    !validateFile(
      file
    )
  ){

    return null;

  }

  if(
    typeof URL ===
    "undefined"
  ){

    return null;

  }

  try{

    const objectURL =

      URL.createObjectURL(
        file
      );

    fileState
    .activeObjectURLs
    .add(
      objectURL
    );

    return objectURL;

  }

  catch{

    return null;

  }

}



// =====================================
// REVOKE URL
// =====================================

function revokeFileURL(
  url
){

  if(
    typeof URL ===
    "undefined"
  ){

    return false;

  }

  try{

    URL.revokeObjectURL(
      url
    );

    fileState
    .activeObjectURLs
    .delete(
      url
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// CLEANUP URLS
// =====================================

function cleanupObjectURLs(){

  for(

    const url

    of

    fileState
    .activeObjectURLs

  ){

    revokeFileURL(
      url
    );

  }

  fileState
  .activeObjectURLs
  .clear();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  createFileURL,

  revokeFileURL,

  cleanupObjectURLs

};
