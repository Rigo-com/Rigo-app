// =====================================
// RIGO AI
// SETTINGS SECURITY
// ENTERPRISE ULTRA FINAL
// =====================================



function sanitizeSettingsObject(
  settings
){

  try{

    return JSON.parse(

      JSON.stringify(
        settings
      )

    );

  }

  catch(error){

    return createSettingsObject();

  }

}



function createSettingsBackup(){

  settingsState
  .backupSettings =
  cloneMemoryObject(

    settingsState
    .runtimeSettings

  );

  return true;

}



function restoreSettingsBackup(){

  if(

    !settingsState
    .backupSettings

  ){

    return false;
  }

  settingsState
  .runtimeSettings =

  cloneMemoryObject(

    settingsState
    .backupSettings

  );

  return true;

}
