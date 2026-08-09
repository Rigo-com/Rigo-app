// =====================================
// RIGO AI
// SETTINGS STORAGE
// PER-USER STORAGE LAYER
// =====================================

import SETTINGS_DEFAULTS
from "./settings-defaults.js";

import {
  scopeStorageKey
}
from "../storage/storage-scope.js";

const SETTINGS_KEY =
"rigo.settings";

const BACKUP_KEY =
"rigo.settings.backup";

function resolveKey(key){
  try{
    return scopeStorageKey(key);
  }
  catch{
    return "";
  }
}

function loadSettings(){
  try{
    const key = resolveKey(SETTINGS_KEY);
    if(!key){return structuredClone(SETTINGS_DEFAULTS);}
    const raw = localStorage.getItem(key);
    if(!raw){return structuredClone(SETTINGS_DEFAULTS);}
    return JSON.parse(raw);
  }
  catch{
    return structuredClone(SETTINGS_DEFAULTS);
  }
}

function saveSettings(settings){
  try{
    const key = resolveKey(SETTINGS_KEY);
    if(!key){return false;}
    localStorage.setItem(key,JSON.stringify(settings));
    return true;
  }
  catch{
    return false;
  }
}

function createBackup(settings){
  try{
    const key = resolveKey(BACKUP_KEY);
    if(!key){return false;}
    localStorage.setItem(key,JSON.stringify(settings));
    return true;
  }
  catch{
    return false;
  }
}

function loadBackup(){
  try{
    const key = resolveKey(BACKUP_KEY);
    if(!key){return null;}
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  catch{
    return null;
  }
}

function removeSettings(){
  try{
    const key = resolveKey(SETTINGS_KEY);
    if(!key){return false;}
    localStorage.removeItem(key);
    return true;
  }
  catch{
    return false;
  }
}

function removeBackup(){
  try{
    const key = resolveKey(BACKUP_KEY);
    if(!key){return false;}
    localStorage.removeItem(key);
    return true;
  }
  catch{
    return false;
  }
}

function resetStorage(){
  removeSettings();
  removeBackup();
  return true;
}

function getStorageStatus(){
  try{
    const settingsKey = resolveKey(SETTINGS_KEY);
    const backupKey = resolveKey(BACKUP_KEY);
    return Object.freeze({
      hasSettings:Boolean(settingsKey&&localStorage.getItem(settingsKey)!==null),
      hasBackup:Boolean(backupKey&&localStorage.getItem(backupKey)!==null)
    });
  }
  catch{
    return Object.freeze({hasSettings:false,hasBackup:false});
  }
}

const SettingsStorage = Object.freeze({
  loadSettings,saveSettings,createBackup,loadBackup,
  removeSettings,removeBackup,resetStorage,status:getStorageStatus
});

export {
  SETTINGS_KEY,BACKUP_KEY,loadSettings,saveSettings,createBackup,
  loadBackup,removeSettings,removeBackup,resetStorage,getStorageStatus,
  SettingsStorage
};

export default SettingsStorage;
