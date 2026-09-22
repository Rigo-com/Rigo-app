import { validateFile } from "./file-validator.js";
import { createFileId,sanitizeFileName,getFileExtension,createFileFingerprint } from "./file-utils.js";
function createFileObject(file){
  if(!validateFile(file)) return null;
  const sanitizedName=sanitizeFileName(file.name);
  if(!sanitizedName) return null;
  return Object.freeze({
    id:createFileId(),name:sanitizedName,size:file.size,type:file.type,
    extension:getFileExtension(sanitizedName),lastModified:Number(file.lastModified)||0,
    createdAt:Date.now(),fingerprint:createFileFingerprint(file),rawFile:file
  });
}
export {createFileObject};