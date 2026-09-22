import { STORAGE_LIMITS } from "./storage-config.js";
import { isObject,isString,isValidKey,getSerializedSize } from "./storage-utils.js";

function validateStorageKey(key){return isValidKey(key);}
function validateStorageValue(value){
  if(value===undefined)return false;
  const size=getSerializedSize(value);
  return size>0&&size<=STORAGE_LIMITS.MAX_STORAGE_SIZE;
}
function validateStorageRecord(key,value){return validateStorageKey(key)&&validateStorageValue(value);}
function validateMemoryRecord(memory){
  if(!isObject(memory))return false;
  return isString(memory.id)&&memory.content!==undefined;
}
const StorageValidators=Object.freeze({validateStorageKey,validateStorageValue,validateStorageRecord,validateMemoryRecord});
export {validateStorageKey,validateStorageValue,validateStorageRecord,validateMemoryRecord,StorageValidators};
export default StorageValidators;