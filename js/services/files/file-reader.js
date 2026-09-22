import { FILE_CONFIG } from "./file-config.js";
import { FILE_EVENTS } from "./file-events.js";
import { validateFile } from "./file-validator.js";
import { fileState } from "./file-state.js";
import { ServiceManager } from "../service-manager.js";

async function emitFileEvent(eventName,payload={}){
  try{
    const events=await ServiceManager.resolve("events");
    if(!events||typeof events.emit!=="function") return false;
    return await events.emit(eventName,{source:"file-reader",timestamp:Date.now(),...payload});
  }catch{return false;}
}
async function readFileAsText(file){
  return new Promise((resolve,reject)=>{
    if(!validateFile(file)){reject(new Error(fileState.lastError||"INVALID FILE"));return;}
    if(typeof FileReader!=="function"){reject(new Error("FILE_READER_UNAVAILABLE"));return;}
    if(!FILE_CONFIG.TEXT_READABLE_TYPES.includes(file.type)){reject(new Error("FILE TYPE NOT READABLE"));return;}
    const reader=new FileReader();
    reader.onload=async()=>{await emitFileEvent(FILE_EVENTS.FILE_READ);resolve(String(reader.result??""));};
    reader.onerror=()=>reject(new Error("FILE READ FAILED"));
    reader.readAsText(file);
  });
}
export {readFileAsText};