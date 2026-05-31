// =====================================
// RIGO AI
// FILE RUNTIME
// FILE ORCHESTRATION LAYER
// =====================================

import {

  fileState,

  resetFileState,

  clearFileError

}
from "./file-state.js";

import {

  clearFiles

}
from "./file-manager.js";



// =====================================
// INITIALIZE
// =====================================

async function initializeFileRuntime(){

  if(
    fileState
    .initialized
  ){

    return true;

  }

  fileState
  .initialized =
  true;

  clearFileError();

  return true;

}



// =====================================
// RESET
// =====================================

async function resetFileRuntime(){

  await clearFiles();

  resetFileState();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createFileRuntimeSnapshot(){

  return Object.freeze({

    timestamp:
    Date.now(),

    uploading:
    fileState
    .uploading,

    filesCount:

      fileState
      .files
      .length,

    queueSize:

      fileState
      .uploadQueue
      .length,

    activeObjectURLs:

      fileState
      .activeObjectURLs
      .size

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getFileRuntimeDiagnostics(){

  return Object.freeze({

    initialized:
    fileState
    .initialized,

    uploading:
    fileState
    .uploading,

    files:

      fileState
      .files
      .length,

    queue:

      fileState
      .uploadQueue
      .length,

    activeURLs:

      fileState
      .activeObjectURLs
      .size,

    lastError:
    fileState
    .lastError,

    lastUpdatedAt:

      fileState
      .lastUpdatedAt,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const FileRuntime =
Object.freeze({

  initialize:
  initializeFileRuntime,

  reset:
  resetFileRuntime,

  snapshot:
  createFileRuntimeSnapshot,

  diagnostics:
  getFileRuntimeDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeFileRuntime,

  resetFileRuntime,

  createFileRuntimeSnapshot,

  getFileRuntimeDiagnostics,

  FileRuntime

};

export default
FileRuntime;
