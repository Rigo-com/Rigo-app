// =====================================
// RIGO AI
// FILE STATE
// FILE STATE LAYER
// =====================================



// =====================================
// STATE
// =====================================

const fileState =
Object.seal({

  initialized:false,

  uploading:false,

  files:[],

  uploadQueue:[],

  activeObjectURLs:
  new Set(),

  fingerprints:
  new Set(),

  lastError:null,

  lastUpdatedAt:null

});



// =====================================
// ERROR
// =====================================

function setFileError(
  message = null
){

  fileState.lastError =

    message == null

    ? null

    : String(
        message
      );

}



function clearFileError(){

  fileState.lastError =
  null;

}



// =====================================
// RESET
// =====================================

function resetFileState(){

  fileState.initialized =
  false;

  fileState.uploading =
  false;

  fileState.files = [];

  fileState.uploadQueue = [];

  fileState.activeObjectURLs
  .clear();

  fileState.fingerprints
  .clear();

  fileState.lastError =
  null;

  fileState.lastUpdatedAt =
  null;

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  fileState,

  setFileError,

  clearFileError,

  resetFileState

};

export default
fileState;
