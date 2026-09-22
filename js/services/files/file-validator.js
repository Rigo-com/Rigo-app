import { FILE_CONFIG } from "./file-config.js";
import { fileState, setFileError } from "./file-state.js";
import { getFileExtension, sanitizeFileName, createFileFingerprint } from "./file-utils.js";
const MIME_EXTENSIONS=Object.freeze({"image/jpeg":Object.freeze([".jpg",".jpeg"]),"image/png":Object.freeze([".png"]),"image/webp":Object.freeze([".webp"]),"text/plain":Object.freeze([".txt"]),"application/json":Object.freeze([".json"]),"application/pdf":Object.freeze([".pdf"])});
function validateFileExtension(filename){return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(getFileExtension(filename));}
function validateFile(file){
  if(!file||typeof file!=="object"){setFileError("INVALID FILE OBJECT");return false;}
  const safeName=sanitizeFileName(file.name);
  const validName=safeName.length>0&&safeName!=="."&&safeName!==".."&&safeName.length<=255;
  const validSize=Number.isFinite(file.size)&&file.size>=0;
  const validType=typeof file.type==="string"&&file.type.length>0;
  if(!validName||!validSize||!validType){setFileError("INVALID FILE DATA");return false;}
  const validMimeType=FILE_CONFIG.ALLOWED_TYPES.includes(file.type);
  const validExtension=validateFileExtension(safeName);
  const extension=getFileExtension(safeName);
  const mimeMatchesExtension=MIME_EXTENSIONS[file.type]?.includes(extension)===true;
  if(!validMimeType||!validExtension||!mimeMatchesExtension){setFileError("INVALID FILE TYPE");return false;}
  if(file.size>FILE_CONFIG.MAX_FILE_SIZE){setFileError("FILE TOO LARGE");return false;}
  setFileError(null); return true;
}
function isDuplicateFile(file){return fileState.fingerprints.has(createFileFingerprint(file));}
export {MIME_EXTENSIONS,validateFileExtension,validateFile,isDuplicateFile};
