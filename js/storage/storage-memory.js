import { STORAGE_LIMITS } from "./storage-config.js";
import { deepClone } from "./storage-utils.js";
import { scopeStorageKey, getCurrentUserNamespace } from "./storage-scope.js";

const memoryStore=new Map();

function resolveKey(key){try{return scopeStorageKey(key);}catch{return "";}}
function currentPrefix(){try{return `${getCurrentUserNamespace()}.`;}catch{return "";}}
function setMemoryItem(key,value){
  const scopedKey=resolveKey(key);
  if(!scopedKey)return false;
  memoryStore.set(scopedKey,deepClone(value));
  while(memoryStore.size>STORAGE_LIMITS.MAX_CACHE_ITEMS) memoryStore.delete(memoryStore.keys().next().value);
  return true;
}
function getMemoryItem(key){
  const scopedKey=resolveKey(key);
  if(!scopedKey)return null;
  const value=memoryStore.get(scopedKey);
  return value===undefined?null:deepClone(value);
}
function hasMemoryItem(key){const scopedKey=resolveKey(key);return scopedKey?memoryStore.has(scopedKey):false;}
function removeMemoryItem(key){const scopedKey=resolveKey(key);return scopedKey?memoryStore.delete(scopedKey):false;}
function clearMemoryStore(){
  const prefix=currentPrefix();
  if(!prefix)return false;
  for(const key of Array.from(memoryStore.keys())) if(key.startsWith(prefix)) memoryStore.delete(key);
  return true;
}
function getMemorySize(){return currentPrefix()?Array.from(memoryStore.keys()).filter(key=>key.startsWith(currentPrefix())).length:0;}
function getMemoryStats(){return Object.freeze({items:getMemorySize()});}

const StorageMemory=Object.freeze({setMemoryItem,getMemoryItem,hasMemoryItem,removeMemoryItem,clearMemoryStore,getMemorySize,getMemoryStats});
export {setMemoryItem,getMemoryItem,hasMemoryItem,removeMemoryItem,clearMemoryStore,getMemorySize,getMemoryStats,StorageMemory};
export default StorageMemory;