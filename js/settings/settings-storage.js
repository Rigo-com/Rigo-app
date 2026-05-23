// =====================================
// RIGO AI
// SETTINGS STORAGE
// ENTERPRISE ULTRA FINAL
// =====================================



const SETTINGS_STORAGE_KEY =
"rigo_settings";



async function saveSettingsToStorage(){

  try{

    settingsState.saving =
    true;

    const settings =
    settingsState
    .runtimeSettings;

    if(

      !validateSettingsObject(
        settings
      )

    ){

      return false;
    }

    localStorage.setItem(

      SETTINGS_STORAGE_KEY,

      JSON.stringify(
        settings
      )

    );

    settingsState
    .lastSavedAt =
    Date.now();

    settingsState
    .totalSaves++;

    return true;

  }

  catch(error){

    settingsState
    .failedSaves++;

    return false;

  }

  finally{

    settingsState.saving =
    false;

  }

}



async function loadSettingsFromStorage(){

  try{

    settingsState.loading =
    true;

    const raw =
    localStorage.getItem(

      SETTINGS_STORAGE_KEY

    );

    if(!raw){

      return false;
    }

    const parsed =
    JSON.parse(raw);

    if(

      !validateSettingsObject(
        parsed
      )

    ){

      return false;
    }

    settingsState
    .runtimeSettings =
    parsed;

    settingsState
    .lastLoadedAt =
    Date.now();

    settingsState
    .totalLoads++;

    return true;

  }

  catch(error){

    settingsState
    .failedLoads++;

    return false;

  }

  finally{

    settingsState.loading =
    false;

  }

}
