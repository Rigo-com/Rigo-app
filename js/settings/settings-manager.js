// =====================================
// RIGO AI
// SETTINGS MANAGER
// ENTERPRISE ULTRA FINAL
// =====================================



async function initializeSettingsSystem(){

  if(
    settingsState.initialized
  ){

    return true;
  }

  const loaded =
  await loadSettingsFromStorage();

  if(!loaded){

    settingsState
    .runtimeSettings =
    createSettingsObject();

    await saveSettingsToStorage();

  }

  settingsState
  .initialized = true;

  return true;

}



function getSetting(
  path,
  fallback = null
){

  const value =
  getNestedSetting(

    settingsState
    .runtimeSettings
    .settings,

    path

  );

  return value ?? fallback;

}



async function updateSetting(
  path,
  value
){

  try{

    if(
      !validateSettingPath(
        path
      )
    ){

      return false;
    }

    createSettingsBackup();

    const safeValue =
    safeSettingValue(
      value
    );

    if(
      safeValue === undefined
    ){

      return false;
    }

    settingsState.currentState =
    SETTINGS_STATES.SAVING;

    setNestedSetting(

      settingsState
      .runtimeSettings
      .settings,

      path,

      safeValue

    );

    settingsState
    .runtimeSettings
    .updatedAt =
    Date.now();

    settingsState.dirty =
    true;

    await syncSettingsSystem();

    settingsState.currentState =
    SETTINGS_STATES.READY;

    await emitSettingsEvent(
      "updated",
      {
        path,
        value:safeValue
      }
    );

    return true;

  }

  catch(error){

    settingsState.currentState =
    SETTINGS_STATES.FAILED;

    settingsState.lastError =
    error;

    return false;

  }

}



async function resetSettingsSystem(){

  settingsState
  .runtimeSettings =
  createSettingsObject();

  settingsState
  .backupSettings =
  null;

  await syncSettingsSystem();

  return true;

}
