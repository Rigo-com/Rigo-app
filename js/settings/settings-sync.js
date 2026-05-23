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

    return false;

  }

  finally{

    settingsState.syncing =
    false;

  }

}
