// =====================================
// RIGO AI
// FILE SYSTEM
// ENTERPRISE ULTIMATE FINAL
// =====================================



// =====================================
// FILE CONFIG
// =====================================

const FILE_CONFIG =
deepFreeze({

  MAX_FILE_SIZE:
  10 * 1024 * 1024,

  MAX_FILES:
  5,

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
// FILE STATE
// =====================================

const fileState =
Object.seal({

  uploading:false,

  files:[],

  activeObjectURLs:
  new Set(),

  lastError:null,

  lastUpdatedAt:null

});



// =====================================
// SET FILE ERROR
// =====================================

function setFileError(
  message = null
){

  fileState.lastError =

    message
    ? String(message)
    : null;

}



// =====================================
// CREATE FILE ID
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
// VALIDATE FILE ID
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
// GET FILE EXTENSION
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
// VALIDATE FILE EXTENSION
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

    file.type.trim()
    .length > 0 &&

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

    console.error(
      "INVALID FILE TYPE"
    );

    return false;

  }

  const validSize =

    file.size <=

    FILE_CONFIG
    .MAX_FILE_SIZE;

  if(!validSize){

    setFileError(
      "FILE TOO LARGE"
    );

    console.error(
      "FILE TOO LARGE"
    );

    return false;

  }

  setFileError(null);

  return true;

}



// =====================================
// CHECK DUPLICATE FILE
// =====================================

function isDuplicateFile(
  file
){

  return fileState.files
  .some((existingFile) => {

    return (

      existingFile.name ===
      file.name &&

      existingFile.size ===
      file.size &&

      existingFile.lastModified ===
      file.lastModified

    );

  });

}



// =====================================
// CREATE FILE OBJECT
// =====================================

function createFileObject(
  file
){

  if(
    !validateFile(file)
  ){

    return null;

  }

  const fileObject = {

    id:createFileId(),

    name:file.name,

    size:file.size,

    type:file.type,

    extension:
    getFileExtension(
      file.name
    ),

    lastModified:
    file.lastModified,

    createdAt:
    Date.now(),

    rawFile:file

  };

  return Object.freeze(
    fileObject
  );

}



// =====================================
// ADD FILE
// =====================================

function addFile(
  file
){

  const validFile =
  validateFile(
    file
  );

  if(!validFile){

    return false;

  }

  if(
    fileState.files.length >=
    FILE_CONFIG.MAX_FILES
  ){

    setFileError(
      "MAX FILE LIMIT REACHED"
    );

    console.error(
      "MAX FILE LIMIT REACHED"
    );

    return false;

  }

  const duplicate =
  isDuplicateFile(
    file
  );

  if(duplicate){

    setFileError(
      "DUPLICATE FILE"
    );

    console.error(
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

  fileState.files.push(
    fileObject
  );

  fileState.lastUpdatedAt =
  Date.now();

  setFileError(null);

  return true;

}



// =====================================
// REMOVE FILE
// =====================================

function removeFile(
  fileId
){

  const validId =
  validateFileId(
    fileId
  );

  if(!validId){

    setFileError(
      "INVALID FILE ID"
    );

    return false;

  }

  const index =
  fileState.files.findIndex(
    (file) => {

      return (
        file.id ===
        fileId
      );

    }
  );

  if(index < 0){

    setFileError(
      "FILE NOT FOUND"
    );

    return false;

  }

  fileState.files.splice(
    index,
    1
  );

  fileState.lastUpdatedAt =
  Date.now();

  setFileError(null);

  return true;

}



// =====================================
// CLEAR FILES
// =====================================

function clearFiles(){

  cleanupObjectURLs();

  fileState.files.length =
  0;

  fileState.uploading =
  false;

  fileState.lastUpdatedAt =
  Date.now();

  setFileError(null);

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

  const validId =
  validateFileId(
    fileId
  );

  if(!validId){

    return null;

  }

  return (

    fileState.files.find(
      (file) => {

        return (
          file.id ===
          fileId
        );

      }
    ) ||

    null

  );

}



// =====================================
// FORMAT FILE SIZE
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
// READ FILE TEXT
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
            fileState.lastError ||
            "INVALID FILE"
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

        setFileError(
          "FILE TYPE NOT READABLE"
        );

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
      () => {

        setFileError(null);

        resolve(
          String(
            reader.result ||
            ""
          )
        );

      };

      reader.onerror =
      () => {

        setFileError(
          "FILE READ FAILED"
        );

        reject(
          new Error(
            "FILE READ FAILED"
          )
        );

      };

      reader.onabort =
      () => {

        setFileError(
          "FILE READ ABORTED"
        );

        reject(
          new Error(
            "FILE READ ABORTED"
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
// CREATE OBJECT URL
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

  const hasObjectURL =

    typeof URL !==
    "undefined" &&

    typeof URL
    .createObjectURL ===
    "function";

  if(!hasObjectURL){

    setFileError(
      "OBJECT URL UNSUPPORTED"
    );

    return null;

  }

  try{

    const objectURL =
    URL.createObjectURL(
      file
    );

    fileState
    .activeObjectURLs
    .add(objectURL);

    setFileError(null);

    return objectURL;

  }

  catch(error){

    setFileError(
      "OBJECT URL ERROR"
    );

    console.error(
      "OBJECT URL ERROR:",
      error
    );

    return null;

  }

}



// =====================================
// REVOKE OBJECT URL
// =====================================

function revokeFileURL(
  url
){

  if(
    typeof url !==
    "string"
  ){

    setFileError(
      "INVALID URL"
    );

    return false;

  }

  const hasRevoke =

    typeof URL !==
    "undefined" &&

    typeof URL
    .revokeObjectURL ===
    "function";

  if(!hasRevoke){

    setFileError(
      "REVOKE UNSUPPORTED"
    );

    return false;

  }

  try{

    URL.revokeObjectURL(
      url
    );

    fileState
    .activeObjectURLs
    .delete(url);

    setFileError(null);

    return true;

  }

  catch(error){

    setFileError(
      "REVOKE URL ERROR"
    );

    console.error(
      "REVOKE URL ERROR:",
      error
    );

    return false;

  }

}



// =====================================
// CLEANUP OBJECT URLS
// =====================================

function cleanupObjectURLs(){

  fileState
  .activeObjectURLs
  .forEach((url) => {

    revokeFileURL(
      url
    );

  });

  fileState
  .activeObjectURLs
  .clear();

}
