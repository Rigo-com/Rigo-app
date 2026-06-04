// =====================================
// RIGO AI
// SETTINGS STORAGE
// STORAGE LAYER
// =====================================

import SETTINGS_DEFAULTS
from "./settings-defaults.js";



// =====================================
// STORAGE KEYS
// =====================================

const SETTINGS_KEY =
"rigo.settings";

const BACKUP_KEY =
"rigo.settings.backup";



// =====================================
// LOAD
// =====================================

function loadSettings(){

  try{

    const raw =

      localStorage.getItem(
        SETTINGS_KEY
      );

    if(
      !raw
    ){

      return structuredClone(
        SETTINGS_DEFAULTS
      );

    }

    return JSON.parse(
      raw
    );

  }

  catch{

    return structuredClone(
      SETTINGS_DEFAULTS
    );

  }

}



// =====================================
// SAVE
// =====================================

function saveSettings(
  settings
){

  try{

    localStorage.setItem(

      SETTINGS_KEY,

      JSON.stringify(
        settings
      )

    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// BACKUP
// =====================================

function createBackup(
  settings
){

  try{

    localStorage.setItem(

      BACKUP_KEY,

      JSON.stringify(
        settings
      )

    );

    return true;

  }

  catch{

    return false;

  }

}



function loadBackup(){

  try{

    const raw =

      localStorage.getItem(
        BACKUP_KEY
      );

    if(
      !raw
    ){
      return null;
    }

    return JSON.parse(
      raw
    );

  }

  catch{

    return null;

  }

}



// =====================================
// REMOVE
// =====================================

function removeSettings(){

  try{

    localStorage.removeItem(
      SETTINGS_KEY
    );

    return true;

  }

  catch{

    return false;

  }

}



function removeBackup(){

  try{

    localStorage.removeItem(
      BACKUP_KEY
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// RESET
// =====================================

function resetStorage(){

  removeSettings();

  removeBackup();

  return true;

}



// =====================================
// STORAGE STATUS
// =====================================

function getStorageStatus(){

  return Object.freeze({

    hasSettings:

    localStorage.getItem(
      SETTINGS_KEY
    ) !== null,

    hasBackup:

    localStorage.getItem(
      BACKUP_KEY
    ) !== null

  });

}



// =====================================
// PUBLIC API
// =====================================

const SettingsStorage =
Object.freeze({

  loadSettings,

  saveSettings,

  createBackup,

  loadBackup,

  removeSettings,

  removeBackup,

  resetStorage,

  status:
  getStorageStatus

});



// =====================================
// EXPORTS
// =====================================

export {

  SETTINGS_KEY,

  BACKUP_KEY,

  loadSettings,

  saveSettings,

  createBackup,

  loadBackup,

  removeSettings,

  removeBackup,

  resetStorage,

  getStorageStatus,

  SettingsStorage

};

export default
SettingsStorage;
