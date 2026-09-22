import { FILE_CONFIG } from "./file-config.js";
import { fileState } from "./file-state.js";
import { validateFileId } from "./file-utils.js";

function enqueueUpload(fileId){
  if(!validateFileId(fileId)) return false;

  const exists = fileState.files.some(file => file.id === fileId);
  if(!exists) return false;

  if(fileState.uploadQueue.includes(fileId)) return false;
  if(fileState.uploadQueue.length >= FILE_CONFIG.MAX_QUEUE_SIZE) return false;

  fileState.uploadQueue.push(fileId);
  return true;
}

function dequeueUpload(){
  if(fileState.uploadQueue.length === 0) return null;
  return fileState.uploadQueue.shift();
}

function getUploadQueue(){
  return [...fileState.uploadQueue];
}

function clearUploadQueue(){
  fileState.uploadQueue = [];
  return true;
}

export { enqueueUpload, dequeueUpload, getUploadQueue, clearUploadQueue };
