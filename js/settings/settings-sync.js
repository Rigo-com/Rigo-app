// =====================================
// RIGO AI
// SETTINGS SYNC
// SYNCHRONIZATION LAYER
// =====================================

import {
  loadSettings,
  saveSettings
}
from "./settings-storage.js";

import {
  validateSettings
}
from "./settings-validation.js";

import {
  sanitizeSettings
}
from "./settings-security.js";

import {
  migrateSettings
}
from "./settings-migrations.js";



// =====================================
// LOAD & SYNC
// =====================================

function syncFromStorage(){

  try{

    let settings =
    loadSettings();

    settings =
    migrateSettings(
      settings
    );

    settings =
    sanitizeSettings(
      settings
    );

    settings =
    validateSettings(
      settings
    );

    return settings;

  }

  catch{

    return null;

  }

}



// =====================================
// SAVE & SYNC
// =====================================

function syncToStorage(
  settings
){

  try{

    const sanitized =

      sanitizeSettings(
        settings
      );

    const validated =

      validateSettings(
        sanitized
      );

    return saveSettings(
      validated
    );

  }

  catch{

    return false;

  }

}



// =====================================
// FULL SYNC
// =====================================

function synchronizeSettings(
  settings
){

  const synchronized =

    syncFromStorage();

  if(
    !synchronized
  ){

    return false;

  }

  return syncToStorage(

    settings ??

    synchronized

  );

}



// =====================================
// PUBLIC API
// =====================================

const SettingsSync =
Object.freeze({

  syncFromStorage,

  syncToStorage,

  synchronizeSettings

});



// =====================================
// EXPORTS
// =====================================

export {

  syncFromStorage,

  syncToStorage,

  synchronizeSettings,

  SettingsSync

};

export default
SettingsSync;
