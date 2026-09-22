import {APIValidationError,APIAbortError} from "./api-errors.js";
import {wait as sharedWait,deepClone as sharedDeepClone,deepFreeze as sharedDeepFreeze,createUniqueId} from "../shared/utils.js";
function createRequestId(){return createUniqueId("api");}
const wait=sharedWait;
const deepClone=sharedDeepClone;
const freezeObject=sharedDeepFreeze;
function validateEndpoint(endpoint){
  if(typeof endpoint!=="string"||!endpoint.trim()) throw new APIValidationError("Invalid endpoint");
  return true;
}
function isAbortError(error){return Boolean(error&&error.name==="AbortError");}
async function parseResponse(response){
  const contentType=response.headers.get("content-type")||"";
  try{
    if(contentType.includes("application/json")) return await response.json();
    if(contentType.includes("text/")) return await response.text();
    return await response.blob();
  }catch{return null;}
}
function throwIfAborted(error){if(isAbortError(error))throw new APIAbortError("Request aborted");return false;}
export{createRequestId,wait,deepClone,freezeObject,validateEndpoint,isAbortError,parseResponse,throwIfAborted};