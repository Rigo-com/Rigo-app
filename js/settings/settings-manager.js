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

  await emitSettingsEvent(
    "updated",
    {
      path,
      value:safeValue
    }
  );

  return true;

}



async function resetSettingsSystem(){

  settingsState
  .runtimeSettings =
  createSettingsObject();

  await syncSettingsSystem();

  return true;

}
