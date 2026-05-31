// =====================================
// RIGO AI
// FILE MANAGER
// FILE MANAGEMENT LAYER
// =====================================

import {

  FILE_CONFIG

}
from "./file-config.js";

import {

  FILE_EVENTS

}
from "./file-events.js";

import {

  fileState,

  setFileError

}
from "./file-state.js";

import {

  validateFileId

}
from "./file-utils.js";

import {

  validateFile,

  isDuplicateFile

}
from "./file-validator.js";

import {

  createFileObject

}
from "./file-factory.js";



// =====================================
// EVENT EMITTER
// =====================================

async function emitFileEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "file-manager",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// ADD FILE
// =====================================

async function addFile(
  file
){

  if(
    !validateFile(file)
  ){

    return false;

  }

  if(

    fileState.files
    .length >=

    FILE_CONFIG
    .MAX_FILES

  ){

    setFileError(
      "MAX FILE LIMIT REACHED"
    );

    return false;

  }

  if(
    isDuplicateFile(
      file
    )
  ){

    setFileError(
      "DUPLICATE FILE"
    );

    return false;

  }

  const fileObject =
  createFileObject(
    file
  );

  if(
    !fileObject
  ){

    return false;

  }

  fileState.files
  .push(
    fileObject
  );

  fileState.fingerprints
  .add(
    fileObject.fingerprint
  );

  fileState.lastUpdatedAt =
  Date.now();

  await emitFileEvent(

    FILE_EVENTS
    .FILE_ADDED,

    {

      fileId:
      fileObject.id

    }

  );

  return true;

}



// =====================================
// REMOVE FILE
// =====================================

async function removeFile(
  fileId
){

  if(
    !validateFileId(
      fileId
    )
  ){

    return false;

  }

  const index =

    fileState.files
    .findIndex((file) => {

      return (
        file.id ===
        fileId
      );

    });

  if(
    index < 0
  ){

    return false;

  }

  const removedFile =

    fileState.files[
      index
    ];

  fileState.fingerprints
  .delete(

    removedFile
    .fingerprint

  );

  fileState.files
  .splice(
    index,
    1
  );

  fileState.lastUpdatedAt =
  Date.now();

  await emitFileEvent(

    FILE_EVENTS
    .FILE_REMOVED,

    {

      fileId

    }

  );

  return true;

}



// =====================================
// GET FILES
// =====================================

function getFiles(){

  return [

    ...fileState.files

  ];

}



// =====================================
// FIND FILE
// =====================================

function findFileById(
  fileId
){

  return (

    fileState.files
    .find((file) => {

      return (
        file.id ===
        fileId
      );

    })

    ||

    null

  );

}



// =====================================
// CLEAR FILES
// =====================================

async function clearFiles(){

  fileState.files = [];

  fileState.uploadQueue = [];

  fileState.fingerprints
  .clear();

  fileState.uploading =
  false;

  fileState.lastUpdatedAt =
  Date.now();

  setFileError(
    null
  );

  await emitFileEvent(

    FILE_EVENTS
    .FILE_CLEARED

  );

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  addFile,

  removeFile,

  getFiles,

  findFileById,

  clearFiles

};
