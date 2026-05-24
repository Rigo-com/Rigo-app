// =====================================
// RIGO AI
// FILE RUNTIME SYSTEM
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
// HELPERS
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



async function trackFileRuntimeError(
  message,
  metadata = null
){

  if(
    typeof DiagnosticsRuntime ===
    "undefined"
  ){

    return false;

  }

  try{

    await DiagnosticsRuntime
    .error?.(
      message,
      metadata
    );

    return true;

  }

  catch(error){

    return false;

  }

}



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

        timestamp:
        Date.now(),

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
// FILE HELPERS
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



function sanitizeFileName(
  filename
){

  return String(
    filename || ""
  )
  .replace(/[<>:"/\\|?*\x00-\x1F]/g,"")
  .replace(/\s+/g," ")
  .trim();

}



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
// VALIDATION
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
    "string" &&

    file.name.trim()
    .length > 0;

  const validSize =

    Number.isFinite(
      file.size
    ) &&

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

  setFileError(null);

  return true;

}



function isDuplicateFile(
  file
){

  return (

    fileRuntimeState
    .fingerprints
    .has(

      createFileFingerprint(
        file
      )

    )

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
// FILE ACTIONS
// =====================================

async function addFile(
  file
){

  if(
    !validateFile(file)
  ){

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



async function removeFile(
  fileId
){

  if(
    !validateFileId(fileId)
  ){

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

    { fileId }

  );

  return true;

}



async function clearFiles(){

  cleanupObjectURLs();

  fileRuntimeState
  .files =
  [];

  fileRuntimeState
  .uploadQueue =
  [];

  fileRuntimeState
  .fingerprints
  .clear();

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
// GETTERS
// =====================================

function getFiles(){

  return [

    ...fileRuntimeState
    .files

  ];

}



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
// TEXT READER
// =====================================

async function readFileAsText(
  file
){

  return new Promise(
    (resolve,reject) => {

      if(
        !validateFile(file)
      ){

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
// OBJECT URLS
// =====================================

function createFileURL(
  file
){

  if(
    !validateFile(file)
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

    fileRuntimeState
    .activeObjectURLs
    .add(objectURL);

    return objectURL;

  }

  catch(error){

    return null;

  }

}



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

    fileRuntimeState
    .activeObjectURLs
    .delete(url);

    return true;

  }

  catch(error){

    return false;

  }

}



function cleanupObjectURLs(){

  for(
    const url
    of fileRuntimeState
    .activeObjectURLs
  ){

    revokeFileURL(
      url
    );

  }

  fileRuntimeState
  .activeObjectURLs
  .clear();

}



// =====================================
// QUEUE
// =====================================

function enqueueUpload(
  fileId
){

  if(
    !validateFileId(fileId)
  ){

    return false;

  }

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
// FORMAT SIZE
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
// RESET
// =====================================

async function resetFileRuntime(){

  await clearFiles();

  fileRuntimeState
  .initialized =
  false;

  fileRuntimeState
  .processingQueue =
  false;

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

    processingQueue:

      fileRuntimeState
      .processingQueue,

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

}
