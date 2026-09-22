import { fileState, resetFileState, clearFileError } from "./file-state.js";
import { clearFiles } from "./file-manager.js";

async function initializeFileRuntime(){
  if(fileState.initialized) return true;
  fileState.initialized = true;
  clearFileError();
  return true;
}

async function resetFileRuntime(){
  await clearFiles();
  resetFileState();
  return true;
}

function createFileRuntimeSnapshot(){
  return Object.freeze({
    timestamp:Date.now(),
    uploading:fileState.uploading,
    filesCount:fileState.files.length,
    queueSize:fileState.uploadQueue.length,
    activeObjectURLs:fileState.activeObjectURLs.size
  });
}

function getFileRuntimeDiagnostics(){
  return Object.freeze({
    initialized:fileState.initialized,
    uploading:fileState.uploading,
    files:fileState.files.length,
    queue:fileState.uploadQueue.length,
    activeURLs:fileState.activeObjectURLs.size,
    lastError:fileState.lastError,
    lastUpdatedAt:fileState.lastUpdatedAt,
    timestamp:Date.now()
  });
}

const FileRuntime = Object.freeze({
  initialize:initializeFileRuntime,
  reset:resetFileRuntime,
  snapshot:createFileRuntimeSnapshot,
  diagnostics:getFileRuntimeDiagnostics
});

export { initializeFileRuntime, resetFileRuntime, createFileRuntimeSnapshot, getFileRuntimeDiagnostics, FileRuntime };
export default FileRuntime;
