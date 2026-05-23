// =====================================
// RIGO AI
// SETTINGS UTILS
// ENTERPRISE ULTRA FINAL
// =====================================



function normalizeSettingKey(
  key
){

  return normalizeMemoryString(
    key
  )
  .slice(

    0,

    SETTINGS_CONFIG
    .MAX_KEY_LENGTH

  );

}



function safeSettingValue(
  value
){

  try{

    if(

      value == null ||

      typeof value !==
      "object"

    ){

      return value;
    }

    return cloneMemoryObject(
      value
    );

  }

  catch(error){

    return undefined;

  }

}



function getNestedSetting(
  object,
  path
){

  return normalizeMemoryString(
    path
  )

  .split(".")

  .reduce((current,key) => {

    return current?.[key];

  },

  object);

}



function setNestedSetting(
  object,
  path,
  value
){

  const keys =
  normalizeMemoryString(
    path
  )
  .split(".");

  let current =
  object;

  while(
    keys.length > 1
  ){

    const key =
    keys.shift();

    if(

      !current[key] ||

      typeof current[key] !==
      "object"

    ){

      current[key] = {};

    }

    current =
    current[key];

  }

  current[keys[0]] =
  value;

  return true;

}
