// =====================================
// RIGO AI
// SETTINGS MANAGER
// ORCHESTRATION LAYER
// =====================================

import {
  SettingsState
}
from "./settings-state.js";

import {
  SETTINGS_EVENTS,
  emit
}
from "./settings-events.js";

import {
  loadSettings,
  saveSettings,
  createBackup
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

import {
  syncFromStorage,
  syncToStorage
}
from "./settings-sync.js";



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    SettingsState
    .snapshot()
    .initialized
  ){
    return true;
  }

  const settings =
  syncFromStorage();

  if(
    settings
  ){

    SettingsState
    .setSettings(
      settings
    );

  }

  SettingsState
  .setInitialized(
    true
  );

  emit(
    SETTINGS_EVENTS
    .INITIALIZED
  );

  return true;

}



// =====================================
// LOAD
// =====================================

function load(){

  try{

    SettingsState
    .setLoading(
      true
    );

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

    SettingsState
    .setSettings(
      settings
    );

    SettingsState
    .incrementLoads();

    emit(

      SETTINGS_EVENTS
      .LOADED,

      settings

    );

    return settings;

  }

  catch(error){

    SettingsState
    .incrementFailedLoads();

    return null;

  }

  finally{

    SettingsState
    .setLoading(
      false
    );

  }

}



// =====================================
// SAVE
// =====================================

function save(){

  try{

    SettingsState
    .setSaving(
      true
    );

    const settings =

      SettingsState
      .getSettings();

    createBackup(
      settings
    );

    const result =

      syncToStorage(
        settings
      );

    if(
      result
    ){

      SettingsState
      .incrementSaves();

      emit(

        SETTINGS_EVENTS
        .SAVED,

        settings

      );

    }

    return result;

  }

  catch{

    SettingsState
    .incrementFailedSaves();

    return false;

  }

  finally{

    SettingsState
    .setSaving(
      false
    );

  }

}



// =====================================
// UPDATE
// =====================================

function update(
  updates = {}
){

  SettingsState
  .updateSettings(
    updates
  );

  emit(

    SETTINGS_EVENTS
    .UPDATED,

    updates

  );

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  SettingsState
  .reset();

  emit(
    SETTINGS_EVENTS
    .RESET
  );

  return true;

}



// =====================================
// GET SETTINGS
// =====================================

function getSettings(){

  return SettingsState
  .getSettings();

}



// =====================================
// HEALTH
// =====================================

function health(){

  return Object.freeze({

    ...SettingsState
    .snapshot(),

    diagnostics:

    SettingsState
    .diagnostics()

  });

}



// =====================================
// PUBLIC API
// =====================================

const SettingsManager =
Object.freeze({

  initialize,

  load,

  save,

  update,

  reset,

  getSettings,

  health

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  load,

  save,

  update,

  reset,

  getSettings,

  health,

  SettingsManager

};

export default
SettingsManager;
