import { serialize, deserialize } from "./storage-utils.js";
import { validateStorageKey, validateStorageRecord } from "./storage-validators.js";
import { scopeStorageKey, getCurrentUserNamespace } from "./storage-scope.js";
import { hasMemoryItem, getMemoryItem, setMemoryItem, removeMemoryItem, clearMemoryStore } from "./storage-memory.js";

function resolveKey(key){
  if(!validateStorageKey(key)) return "";
  try { return scopeStorageKey(key); } catch { return ""; }
}
function getStorage(){ return typeof localStorage === "undefined" ? null : localStorage; }

function saveItem(key,value){
  const storage=getStorage();
  const scopedKey=resolveKey(key);
  if(!storage||!scopedKey||!validateStorageRecord(key,value)) return false;
  try{
    const serialized=serialize(value);
    if(serialized===null) return false;
    storage.setItem(scopedKey,serialized);
    setMemoryItem(key,value);
    return true;
  }catch{return false;}
}

function loadItem(key){
  const storage=getStorage();
  const scopedKey=resolveKey(key);
  if(!storage||!scopedKey) return null;
  try{
    if(hasMemoryItem(key)) return getMemoryItem(key);
    const value=storage.getItem(scopedKey);
    const parsed=value===null?null:deserialize(value);
    if(parsed!==null) setMemoryItem(key,parsed);
    return parsed;
  }catch{return null;}
}

function removeItem(key){
  const storage=getStorage();
  const scopedKey=resolveKey(key);
  if(!storage||!scopedKey) return false;
  try{
    storage.removeItem(scopedKey);
    removeMemoryItem(key);
    return true;
  }catch{return false;}
}

function clearStorage(){
  const storage=getStorage();
  if(!storage) return false;
  try{
    const prefix=`${getCurrentUserNamespace()}.`;
    const keys=[];
    for(let index=0;index<storage.length;index++){
      const key=storage.key(index);
      if(key?.startsWith(prefix)) keys.push(key);
    }
    for(const key of keys) storage.removeItem(key);
    clearMemoryStore();
    return true;
  }catch{return false;}
}

function hasItem(key){
  const storage=getStorage();
  const scopedKey=resolveKey(key);
  if(!storage||!scopedKey) return false;
  try{return hasMemoryItem(key)||storage.getItem(scopedKey)!==null;}catch{return false;}
}

function getEngineStats(){
  const storage=getStorage();
  if(!storage) return Object.freeze({entries:0,available:false});
  try{
    const prefix=`${getCurrentUserNamespace()}.`;
    let entries=0;
    for(let index=0;index<storage.length;index++) if(storage.key(index)?.startsWith(prefix)) entries++;
    return Object.freeze({entries,available:true,cacheEntries:hasMemoryItem("__storage_probe__")?1:0});
  }catch{return Object.freeze({entries:0,available:false,cacheEntries:0});}
}

const StorageEngine=Object.freeze({saveItem,loadItem,removeItem,clearStorage,hasItem,getEngineStats});
export {saveItem,loadItem,removeItem,clearStorage,hasItem,getEngineStats,StorageEngine};
export default StorageEngine;