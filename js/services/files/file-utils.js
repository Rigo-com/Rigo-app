// =====================================
// RIGO AI
// FILE UTILS
// FILE UTILITY LAYER
// =====================================



// =====================================
// FILE ID
// =====================================

function createFileId(){

  if(

    typeof crypto !==
    "undefined"

    &&

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
// FILE NAME
// =====================================

function sanitizeFileName(
  filename
){

  return String(
    filename ?? ""
  )
  .replace(
    /[<>:"/\\|?*\x00-\x1F]/g,
    ""
  )
  .replace(
    /\s+/g,
    " "
  )
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
    "string"

    &&

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
  .slice(
    lastDotIndex
  );

}



// =====================================
// FILE FINGERPRINT
// =====================================

function createFileFingerprint(
  file
){

  return [

    file?.name,

    file?.size,

    file?.type,

    file?.lastModified

  ]
  .join("|");

}



// =====================================
// FILE SIZE FORMAT
// =====================================

function formatFileSize(
  bytes
){

  const safeBytes =
  Number(bytes);

  if(

    !Number.isFinite(
      safeBytes
    )

    ||

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

    value >= 1024

    &&

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
// EXPORTS
// =====================================

export {

  createFileId,

  sanitizeFileName,

  validateFileId,

  getFileExtension,

  createFileFingerprint,

  formatFileSize

};
