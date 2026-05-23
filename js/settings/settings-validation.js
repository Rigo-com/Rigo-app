// =====================================
// RIGO AI
// SETTINGS VALIDATION
// ENTERPRISE ULTRA FINAL
// =====================================



function validateSettingsObject(
  settings
){

  if(

    !settings ||

    typeof settings !==
    "object"

  ){

    return false;
  }

  if(
    typeof settings.version !==
    "string"
  ){

    return false;
  }

  if(

    !settings.settings ||

    typeof settings.settings !==
    "object"

  ){

    return false;
  }

  try{

    const serialized =
    JSON.stringify(
      settings
    );

    return (

      serialized.length <=

      SETTINGS_CONFIG
      .MAX_SETTINGS_SIZE

    );

  }

  catch(error){

    return false;

  }

}



function validateSettingPath(
  path
){

  return Boolean(
    normalizeSettingKey(
      path
    )
  );

}
