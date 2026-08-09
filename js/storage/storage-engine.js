// =====================================
// RIGO AI
// STORAGE ENGINE
// PER-USER PERSISTENCE
// =====================================

import {
  serialize,
  deserialize
}
from "./storage-utils.js";

import {
  validateStorageKey
}
from "./storage-validators.js";

import {
  scopeStorageKey,
  getCurrentUserNamespace
}
from "./storage-scope.js";

function resolveKey(key){
  if(!validateStorageKey(key)){
    return "";
  }

  try{
    return scopeStorageKey(key);
  }
  catch{
    return "";
  }
}

function saveItem(key,value){
  const scopedKey = resolveKey(key);
  if(!scopedKey){return false;}

  try{
    const serialized = serialize(value);
    if(serialized === null){return false;}
    localStorage.setItem(scopedKey,serialized);
    return true;
  }
  catch{
    return false;
  }
}

function loadItem(key){
  const scopedKey = resolveKey(key);
  if(!scopedKey){return null;}

  try{
    const value = localStorage.getItem(scopedKey);
    if(value === null){return null;}
    return deserialize(value);
  }
  catch{
    return null;
  }
}

function removeItem(key){
  const scopedKey = resolveKey(key);
  if(!scopedKey){return false;}

  try{
    localStorage.removeItem(scopedKey);
    return true;
  }
  catch{
    return false;
  }
}

function clearStorage(){
  try{
    const prefix = `${getCurrentUserNamespace()}.`;
    const keys = [];

    for(let index=0;index<localStorage.length;index++){
      const key = localStorage.key(index);
      if(key?.startsWith(prefix)){
        keys.push(key);
      }
    }

    for(const key of keys){
      localStorage.removeItem(key);
    }

    return true;
  }
  catch{
    return false;
  }
}

function hasItem(key){
  const scopedKey = resolveKey(key);
  if(!scopedKey){return false;}

  try{
    return localStorage.getItem(scopedKey) !== null;
  }
  catch{
    return false;
  }
}

function getEngineStats(){
  try{
    const prefix = `${getCurrentUserNamespace()}.`;
    let entries = 0;

    for(let index=0;index<localStorage.length;index++){
      if(localStorage.key(index)?.startsWith(prefix)){
        entries++;
      }
    }

    return Object.freeze({entries});
  }
  catch{
    return Object.freeze({entries:0});
  }
}

const StorageEngine = Object.freeze({
  saveItem,
  loadItem,
  removeItem,
  clearStorage,
  hasItem,
  getEngineStats
});

export {
  saveItem,
  loadItem,
  removeItem,
  clearStorage,
  hasItem,
  getEngineStats,
  StorageEngine
};

export default StorageEngine;
