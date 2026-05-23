// =====================================
// RIGO AI
// FILE RUNTIME SYSTEM
// ENTERPRISE ATTACHMENT ENGINE FINAL
// =====================================



// =====================================
// FILE CONFIG
// =====================================

const FILE_CONFIG =
Object.freeze({

  MAX_FILE_SIZE:
  10 * 1024 * 1024,

  MAX_FILES:
  5,

  MAX_QUEUE_SIZE:
  20,

  ALLOWED_TYPES:[

    "image/jpeg",

    "image/png",

    "image/webp",

    "text/plain",

    "application/json",

    "application/pdf"

  ],

  ALLOWED_EXTENSIONS:[

    ".jpg",

    ".jpeg",

    ".png",

    ".webp",

    ".txt",

    ".json",

    ".pdf"

  ],

  TEXT_READABLE_TYPES:[

    "text/plain",

    "application/json"

  ]

});



// =====================================
// FILE EVENTS
// =====================================

const FILE_RUNTIME_EVENTS =
Object.freeze({

  FILE_ADDED:
  "file.added",

  FILE_REMOVED:
  "file.removed",

  FILE_READ:
  "file.read",

  FILE_UPLOAD_STARTED:
  "file.upload.started",

  FILE_UPLOAD_COMPLETED:
  "file.upload.completed",

  FILE_UPLOAD_FAILED:
  "file.upload.failed",

  FILE_CLEARED:
  "file.cleared"

});



// =====================================
// FILE STATE
// =====================================

const fileRuntimeState =
Object.seal({

  initialized:false,

  uploading:false,

  processingQueue:false,

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
// DIAGNOSTICS
// =====================================

async function trackFileRuntimeError(
  message,
  metadata = null
){

  if(
    typeof DiagnosticsRuntime !==
    "undefined"
  ){

    try{

      await DiagnosticsRuntime
      .error(
        message,
        metadata
      );

    }

    catch(error){}

  }

}



// =====================================
// EVENTS
// =====================================

async function emitFileRuntimeEvent(
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
        "file-runtime",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// ERROR
// =====================================

function setFileError(
  message = null
){

  fileRuntimeState
  .lastError =

    message
    ? String(message)
    : null;

}



// =====================================
// FILE ID
// =====================================

function createFileId(){

  if(

    typeof crypto !==
    "undefined" &&

    typeof crypto.randomUUID ===
    "function"

  ){

    return (

      "file_" +

      crypto.randomUUID()

    );

  }

  return (

    "file_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// SANITIZE NAME
// =====================================

function sanitizeFileName(
  filename
){

  return String(
    filename || ""
  )
  .replace(/[<>:"/\\|?*\x00-\x1F]/g,"")
  .trim();

}



// =====================================
// FILE ID VALIDATION
// =====================================

function validateFileId(
  fileId
){

  return (

    typeof fileId ===
    "string" &&

    fileId.trim()
    .length > 0

  );

}



// =====================================
// FILE EXTENSION
// =====================================

function getFileExtension(
  filename
){

  if(
    typeof filename !==
    "string"
  ){

    return "";
  }

  const normalizedName =
  filename
  .trim()
  .toLowerCase();

  const lastDotIndex =
  normalizedName
  .lastIndexOf(".");

  if(
    lastDotIndex < 0
  ){

    return "";
  }

  return normalizedName
  .slice(lastDotIndex);

}



// =====================================
// EXTENSION VALIDATION
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
// FINGERPRINT
// =====================================

function createFileFingerprint(
  file
){

  return [

    file.name,

    file.size,

    file.type,

    file.lastModified

  ]
  .join("|");

}



// =====================================
// VALIDATE FILE
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

  const hasValidName =

    typeof file.name ===
    "string" &&

    file.name.trim()
    .length > 0;

  const hasValidSize =

    Number.isFinite(
      file.size
    ) &&

    file.size >= 0;

  const hasValidType =

    typeof file.type ===
    "string";

  if(

    !hasValidName ||

    !hasValidSize ||

    !hasValidType

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

    !validMimeType &&

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

  setFileError(null);

  return true;

}



// =====================================
// DUPLICATES
// =====================================

function isDuplicateFile(
  file
){

  const fingerprint =
  createFileFingerprint(
    file
  );

  return (

    fileRuntimeState
    .fingerprints
    .has(fingerprint)

  );

}



// =====================================
// FILE OBJECT
// =====================================

function createFileObject(
  file
){

  if(
    !validateFile(file)
  ){

    return null;

  }

  const sanitizedName =
  sanitizeFileName(
    file.name
  );

  const fingerprint =
  createFileFingerprint(
    file
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

    fingerprint,

    rawFile:
    file

  });

}



// =====================================
// ADD FILE
// =====================================

async function addFile(
  file
){

  const validFile =
  validateFile(
    file
  );

  if(!validFile){

    await trackFileRuntimeError(
      fileRuntimeState
      .lastError
    );

    return false;

  }

  if(

    fileRuntimeState
    .files
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
    isDuplicateFile(file)
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

  if(!fileObject){

    return false;

  }

  fileRuntimeState
  .files
  .push(fileObject);

  fileRuntimeState
  .fingerprints
  .add(
    fileObject
    .fingerprint
  );

  fileRuntimeState
  .lastUpdatedAt =
  Date.now();

  setFileError(null);

  await emitFileRuntimeEvent(

    FILE_RUNTIME_EVENTS
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

  const validId =
  validateFileId(
    fileId
  );

  if(!validId){

    return false;

  }

  const index =
  fileRuntimeState
  .files
  .findIndex((file) => {

    return (
      file.id ===
      fileId
    );

  });

  if(index < 0){

    return false;

  }

  const removedFile =

    fileRuntimeState
    .files[index];

  fileRuntimeState
  .fingerprints
  .delete(

    removedFile
    .fingerprint

  );

  fileRuntimeState
  .files
  .splice(index,1);

  fileRuntimeState
  .lastUpdatedAt =
  Date.now();

  await emitFileRuntimeEvent(

    FILE_RUNTIME_EVENTS
    .FILE_REMOVED,

    {

      fileId

    }

  );

  return true;

}



// =====================================
// CLEAR FILES
// =====================================

async function clearFiles(){

  cleanupObjectURLs();

  fileRuntimeState
  .activeObjectURLs
  .clear();

  fileRuntimeState
  .files
  .length = 0;

  fileRuntimeState
  .fingerprints
  .clear();

  fileRuntimeState
  .uploadQueue
  .length = 0;

  fileRuntimeState
  .uploading =
  false;

  fileRuntimeState
  .lastUpdatedAt =
  Date.now();

  setFileError(null);

  await emitFileRuntimeEvent(

    FILE_RUNTIME_EVENTS
    .FILE_CLEARED

  );

  return true;

}



// =====================================
// GET FILES
// =====================================

function getFiles(){

  return [

    ...fileRuntimeState
    .files

  ];

}



// =====================================
// FIND FILE
// =====================================

function findFileById(
  fileId
){

  return (

    fileRuntimeState
    .files
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
// FILE SIZE
// =====================================

function formatFileSize(
  bytes
){

  const safeBytes =
  Number(bytes);

  if(

    !Number.isFinite(
      safeBytes
    ) ||

    safeBytes < 0

  ){

    return "0 B";

  }

  if(
    safeBytes < 1024
  ){

    return (

      Math.round(
        safeBytes
      ) +

      " B"

    );

  }

  const units = [

    "KB",

    "MB",

    "GB"

  ];

  let value =
  safeBytes / 1024;

  let unitIndex =
  0;

  while(

    value >= 1024 &&

    unitIndex <
    units.length - 1

  ){

    value =
    value / 1024;

    unitIndex++;

  }

  return (

    value.toFixed(1) +

    " " +

    units[unitIndex]

  );

}



// =====================================
// READ TEXT
// =====================================

async function readFileAsText(
  file
){

  return new Promise(
    (resolve,reject) => {

      const validFile =
      validateFile(
        file
      );

      if(!validFile){

        reject(
          new Error(
            fileRuntimeState
            .lastError
          )
        );

        return;

      }

      const readableType =

        FILE_CONFIG
        .TEXT_READABLE_TYPES
        .includes(
          file.type
        );

      if(!readableType){

        reject(
          new Error(
            "FILE TYPE NOT READABLE"
          )
        );

        return;

      }

      const reader =
      new FileReader();

      reader.onload =
      async () => {

        await emitFileRuntimeEvent(

          FILE_RUNTIME_EVENTS
          .FILE_READ

        );

        resolve(
          String(
            reader.result ||
            ""
          )
        );

      };

      reader.onerror =
      () => {

        reject(
          new Error(
            "FILE READ FAILED"
          )
        );

      };

      reader.readAsText(
        file
      );

    }
  );

}



// =====================================
// OBJECT URL
// =====================================

function createFileURL(
  file
){

  const validFile =
  validateFile(
    file
  );

  if(!validFile){

    return null;

  }

  try{

    const objectURL =
    URL.createObjectURL(
      file
    );

    fileRuntimeState
    .activeObjectURLs
    .add(objectURL);

    return objectURL;

  }

  catch(error){

    return null;

  }

}



// =====================================
// REVOKE URL
// =====================================

function revokeFileURL(
  url
){

  try{

    URL.revokeObjectURL(
      url
    );

    fileRuntimeState
    .activeObjectURLs
    .delete(url);

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CLEANUP URLS
// =====================================

function cleanupObjectURLs(){

  fileRuntimeState
  .activeObjectURLs
  .forEach((url) => {

    revokeFileURL(
      url
    );

  });

  fileRuntimeState
  .activeObjectURLs
  .clear();

}



// =====================================
// UPLOAD QUEUE
// =====================================

function enqueueUpload(
  fileId
){

  if(

    fileRuntimeState
    .uploadQueue
    .length >=

    FILE_CONFIG
    .MAX_QUEUE_SIZE

  ){

    return false;

  }

  fileRuntimeState
  .uploadQueue
  .push(fileId);

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeFileRuntime(){

  if(
    fileRuntimeState
    .initialized
  ){

    return true;

  }

  fileRuntimeState
  .initialized =
  true;

  setFileError(null);

  await emitFileRuntimeEvent(

    FILE_RUNTIME_EVENTS
    .FILE_CLEARED

  );

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
    fileRuntimeState
    .uploading,

    filesCount:

      fileRuntimeState
      .files
      .length,

    queueSize:

      fileRuntimeState
      .uploadQueue
      .length,

    activeObjectURLs:

      fileRuntimeState
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
    fileRuntimeState
    .initialized,

    uploading:
    fileRuntimeState
    .uploading,

    files:

      fileRuntimeState
      .files
      .length,

    queue:

      fileRuntimeState
      .uploadQueue
      .length,

    activeURLs:

      fileRuntimeState
      .activeObjectURLs
      .size,

    lastError:
    fileRuntimeState
    .lastError,

    lastUpdatedAt:

      fileRuntimeState
      .lastUpdatedAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const FileRuntime =
Object.freeze({

  initialize:
  initializeFileRuntime,

  add:
  addFile,

  remove:
  removeFile,

  clear:
  clearFiles,

  get:
  getFiles,

  find:
  findFileById,

  readText:
  readFileAsText,

  createURL:
  createFileURL,

  revokeURL:
  revokeFileURL,

  cleanupURLs:
  cleanupObjectURLs,

  enqueue:
  enqueueUpload,

  snapshot:
  createFileRuntimeSnapshot,

  formatSize:
  formatFileSize,

  diagnostics:
  getFileRuntimeDiagnostics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.FileRuntime =
  FileRuntime;

  window.initializeFileRuntime =
  initializeFileRuntime;

}
