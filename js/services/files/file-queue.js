// =====================================
// RIGO AI
// FILE QUEUE
// UPLOAD QUEUE LAYER
// =====================================

import {

  FILE_CONFIG

}
from "./file-config.js";

import {

  fileState

}
from "./file-state.js";

import {

  validateFileId

}
from "./file-utils.js";



// =====================================
// ENQUEUE
// =====================================

function enqueueUpload(
  fileId
){

  if(
    !validateFileId(
      fileId
    )
  ){

    return false;

  }

  if(

    fileState
    .uploadQueue
    .length >=

    FILE_CONFIG
    .MAX_QUEUE_SIZE

  ){

    return false;

  }

  fileState
  .uploadQueue
  .push(
    fileId
  );

  return true;

}



// =====================================
// DEQUEUE
// =====================================

function dequeueUpload(){

  if(

    fileState
    .uploadQueue
    .length === 0

  ){

    return null;

  }

  return fileState
  .uploadQueue
  .shift();

}



// =====================================
// GET QUEUE
// =====================================

function getUploadQueue(){

  return [

    ...fileState
    .uploadQueue

  ];

}



// =====================================
// CLEAR QUEUE
// =====================================

function clearUploadQueue(){

  fileState
  .uploadQueue = [];

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  enqueueUpload,

  dequeueUpload,

  getUploadQueue,

  clearUploadQueue

};
