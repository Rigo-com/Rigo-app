// =====================================
// RIGO AI
// SETTINGS STATE
// FOUNDATION STATE LAYER
// =====================================

import SETTINGS_DEFAULTS
from "./settings-defaults.js";



// =====================================
// SETTINGS STATE
// =====================================

const settingsState =
Object.seal({

  initialized:false,

  loading:false,

  saving:false,

  syncing:false,

  healthy:true,

  settings:
  structuredClone(
    SETTINGS_DEFAULTS
  ),

  diagnostics:
  Object.seal({

    loads:0,

    saves:0,

    syncs:0,

    failedLoads:0,

    failedSaves:0,

    failedSyncs:0

  })

});



// =====================================
// HELPERS
// =====================================

function createSnapshot(){

  return {

    initialized:
    settingsState
    .initialized,

    loading:
    settingsState
    .loading,

    saving:
    settingsState
    .saving,

    syncing:
    settingsState
    .syncing,

    healthy:
    settingsState
    .healthy,

    settings:
    structuredClone(

      settingsState
      .settings

    ),

    diagnostics:{

      ...settingsState
      .diagnostics

    }

  };

}



// =====================================
// FLAGS
// =====================================

function setInitialized(
  value
){

  settingsState
  .initialized =
  Boolean(value);

}



function setLoading(
  value
){

  settingsState
  .loading =
  Boolean(value);

}



function setSaving(
  value
){

  settingsState
  .saving =
  Boolean(value);

}



function setSyncing(
  value
){

  settingsState
  .syncing =
  Boolean(value);

}



function setHealthy(
  value
){

  settingsState
  .healthy =
  Boolean(value);

}



// =====================================
// SETTINGS
// =====================================

function getSettings(){

  return structuredClone(

    settingsState
    .settings

  );

}



function setSettings(
  settings
){

  if(
    !settings
  ){
    return false;
  }

  settingsState
  .settings =

  structuredClone(
    settings
  );

  return true;

}



function updateSettings(
  updates = {}
){

  Object.assign(

    settingsState
    .settings,

    updates

  );

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementLoads(){

  settingsState
  .diagnostics
  .loads++;

}



function incrementSaves(){

  settingsState
  .diagnostics
  .saves++;

}



function incrementSyncs(){

  settingsState
  .diagnostics
  .syncs++;

}



function incrementFailedLoads(){

  settingsState
  .diagnostics
  .failedLoads++;

}



function incrementFailedSaves(){

  settingsState
  .diagnostics
  .failedSaves++;

}



function incrementFailedSyncs(){

  settingsState
  .diagnostics
  .failedSyncs++;

}



// =====================================
// SNAPSHOT
// =====================================

function getSettingsSnapshot(){

  return Object.freeze(
    createSnapshot()
  );

}



// =====================================
// DIAGNOSTICS SNAPSHOT
// =====================================

function getSettingsDiagnostics(){

  return Object.freeze({

    ...settingsState
    .diagnostics

  });

}



// =====================================
// RESET
// =====================================

function resetSettingsState(){

  settingsState
  .initialized = false;

  settingsState
  .loading = false;

  settingsState
  .saving = false;

  settingsState
  .syncing = false;

  settingsState
  .healthy = true;

  settingsState
  .settings =

  structuredClone(
    SETTINGS_DEFAULTS
  );

  settingsState
  .diagnostics
  .loads = 0;

  settingsState
  .diagnostics
  .saves = 0;

  settingsState
  .diagnostics
  .syncs = 0;

  settingsState
  .diagnostics
  .failedLoads = 0;

  settingsState
  .diagnostics
  .failedSaves = 0;

  settingsState
  .diagnostics
  .failedSyncs = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SettingsState =
Object.freeze({

  setInitialized,

  setLoading,

  setSaving,

  setSyncing,

  setHealthy,

  getSettings,

  setSettings,

  updateSettings,

  incrementLoads,

  incrementSaves,

  incrementSyncs,

  incrementFailedLoads,

  incrementFailedSaves,

  incrementFailedSyncs,

  snapshot:
  getSettingsSnapshot,

  diagnostics:
  getSettingsDiagnostics,

  reset:
  resetSettingsState

});



// =====================================
// EXPORTS
// =====================================

export {

  settingsState,

  setInitialized,

  setLoading,

  setSaving,

  setSyncing,

  setHealthy,

  getSettings,

  setSettings,

  updateSettings,

  incrementLoads,

  incrementSaves,

  incrementSyncs,

  incrementFailedLoads,

  incrementFailedSaves,

  incrementFailedSyncs,

  getSettingsSnapshot,

  getSettingsDiagnostics,

  resetSettingsState,

  SettingsState

};

export default
SettingsState;
