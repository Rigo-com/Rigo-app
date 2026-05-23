// =====================================
// RIGO AI
// SETTINGS SYNC
// ENTERPRISE ULTRA FINAL
// =====================================



async function syncSettingsSystem(){

  settingsState.syncing =
  true;

  try{

    await saveSettingsToStorage();

    settingsState
    .lastSyncedAt =
    Date.now();

    return true;

  }

  catch(error){

    settingsState
    .lastError =
    error;

    return false;

  }

  finally{

    settingsState.syncing =
    false;

    settingsState.currentState =
    SETTINGS_STATES.READY;

  }

}
