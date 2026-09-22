import { fileState } from "./file-state.js";
import { validateFile } from "./file-validator.js";

function createFileURL(file){
  if(!validateFile(file) || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return null;

  try{
    const objectURL = URL.createObjectURL(file);
    fileState.activeObjectURLs.add(objectURL);
    return objectURL;
  }catch{
    return null;
  }
}

function revokeFileURL(url){
  if(typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return false;
  if(typeof url !== "string" || !url) return false;

  try{
    URL.revokeObjectURL(url);
    fileState.activeObjectURLs.delete(url);
    return true;
  }catch{
    return false;
  }
}

function cleanupObjectURLs(){
  const urls = [...fileState.activeObjectURLs];
  let success = true;
  for(const url of urls){
    if(!revokeFileURL(url)) success = false;
  }
  return success;
}

export { createFileURL, revokeFileURL, cleanupObjectURLs };
