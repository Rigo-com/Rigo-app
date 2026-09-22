import { FILE_CONFIG } from "./file-config.js";
import { FILE_EVENTS } from "./file-events.js";
import { fileState,setFileError } from "./file-state.js";
import { validateFileId } from "./file-utils.js";
import { validateFile,isDuplicateFile } from "./file-validator.js";
import { createFileObject } from "./file-factory.js";
import { revokeFileURL,cleanupObjectURLs } from "./file-url.js";
import { readFileAsText } from "./file-reader.js";
import { clearUploadQueue } from "./file-queue.js";
import { ServiceManager } from "../service-manager.js";
async function emitFileEvent(eventName,payload={}){
  try{const events=await ServiceManager.resolve("events");if(!events||typeof events.emit!=="function") return false;return await events.emit(eventName,{source:"file-manager",timestamp:Date.now(),...payload});}catch{return false;}
}
async function addFile(file){
  if(!validateFile(file)) return false;
  if(fileState.files.length>=FILE_CONFIG.MAX_FILES){setFileError("MAX FILE LIMIT REACHED");return false;}
  if(isDuplicateFile(file)){setFileError("DUPLICATE FILE");return false;}
  const fileObject=createFileObject(file); if(!fileObject) return false;
  fileState.files.push(fileObject); fileState.fingerprints.add(fileObject.fingerprint); fileState.lastUpdatedAt=Date.now();
  await emitFileEvent(FILE_EVENTS.FILE_ADDED,{fileId:fileObject.id}); return true;
}
async function removeFile(fileId){
  if(!validateFileId(fileId)) return false;
  const index=fileState.files.findIndex(file=>file.id===fileId); if(index<0) return false;
  const removedFile=fileState.files[index]; if(removedFile.previewURL) revokeFileURL(removedFile.previewURL);
  fileState.fingerprints.delete(removedFile.fingerprint); fileState.files.splice(index,1);
  fileState.uploadQueue=fileState.uploadQueue.filter(id=>id!==fileId); fileState.lastUpdatedAt=Date.now();
  await emitFileEvent(FILE_EVENTS.FILE_REMOVED,{fileId}); return true;
}
function getFiles(){return [...fileState.files];}
function findFileById(fileId){return fileState.files.find(file=>file.id===fileId)||null;}
async function readFileText(fileId){const file=findFileById(fileId);if(!file) return null;return readFileAsText(file.rawFile);}
async function clearFiles(){cleanupObjectURLs();clearUploadQueue();fileState.files=[];fileState.fingerprints.clear();fileState.uploading=false;fileState.lastUpdatedAt=Date.now();setFileError(null);await emitFileEvent(FILE_EVENTS.FILE_CLEARED);return true;}
export {addFile,removeFile,getFiles,findFileById,readFileText,clearFiles};
