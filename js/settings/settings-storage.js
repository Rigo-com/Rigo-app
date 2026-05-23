// =====================================
// RIGO AI
// SETTINGS STORAGE
// ENTERPRISE ULTRA FINAL
// =====================================



const SETTINGS_STORAGE_KEY =
"rigo_settings";



function isSettingsStorageAvailable(){

  return (

    typeof localStorage !==
    "undefined"

  );

}



async function saveSettingsToStorage(){

  try{

    if(
      !isSettingsStorageAvailable()
    ){

      return false;
    }

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

    if(
      !isSettingsStorageAvailable()
    ){

      return false;
    }

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

    const migrated =
    migrateSettingsObject(
      parsed
    );

    if(

      !validateSettingsObject(
        migrated
      )

    ){

      return false;
    }

    settingsState
    .runtimeSettings =
    migrated;

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
