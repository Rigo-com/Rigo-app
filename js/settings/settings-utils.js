// =====================================
// RIGO AI
// SETTINGS UTILS
// UTILITY LAYER
// =====================================

import {
  SETTINGS_SECTIONS
}
from "./settings-types.js";



// =====================================
// IDS
// =====================================

function createSettingsId(
  prefix = "settings"
){

  return (

    String(prefix)

    + "_"

    + Date.now()

    + "_"

    + Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// TYPE HELPERS
// =====================================

function isObject(
  value
){

  return (

    value !== null

    &&

    typeof value ===
    "object"

    &&

    !Array.isArray(
      value
    )

  );

}



// =====================================
// CLONE
// =====================================

function deepClone(
  value
){

  return structuredClone(
    value
  );

}



// =====================================
// MERGE
// =====================================

function deepMerge(
  target = {},
  source = {}
){

  const result =
  deepClone(
    target
  );

  for(
    const [

      key,

      value

    ]

    of Object.entries(
      source
    )
  ){

    if(

      isObject(
        value
      )

      &&

      isObject(
        result[key]
      )

    ){

      result[key] =

        deepMerge(

          result[key],

          value

        );

      continue;

    }

    result[key] =
    deepClone(
      value
    );

  }

  return result;

}



// =====================================
// SETTINGS HELPERS
// =====================================

function isSettingsSection(
  section
){

  return Object.values(

    SETTINGS_SECTIONS

  )
  .includes(
    section
  );

}



function normalizeSettings(
  settings = {}
){

  if(
    !isObject(
      settings
    )
  ){

    return {};
  }

  return deepClone(
    settings
  );

}



// =====================================
// PATH HELPERS
// =====================================

function getSettingValue(
  settings,
  path
){

  if(
    !isObject(
      settings
    )
  ){
    return undefined;
  }

  if(
    typeof path !==
    "string"
  ){
    return undefined;
  }

  return path
  .split(".")
  .reduce(

    (
      current,
      key
    ) =>

      current?.[
        key
      ],

    settings

  );

}



function setSettingValue(

  settings,

  path,

  value

){

  if(
    !isObject(
      settings
    )
  ){
    return false;
  }

  const keys =
  String(path)
  .split(".");

  let current =
  settings;

  while(
    keys.length > 1
  ){

    const key =
    keys.shift();

    if(
      !isObject(
        current[key]
      )
    ){

      current[key] =
      {};

    }

    current =
    current[key];

  }

  current[
    keys[0]
  ] = value;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SettingsUtils =
Object.freeze({

  createSettingsId,

  isObject,

  deepClone,

  deepMerge,

  isSettingsSection,

  normalizeSettings,

  getSettingValue,

  setSettingValue

});



// =====================================
// EXPORTS
// =====================================

export {

  createSettingsId,

  isObject,

  deepClone,

  deepMerge,

  isSettingsSection,

  normalizeSettings,

  getSettingValue,

  setSettingValue,

  SettingsUtils

};

export default
SettingsUtils;
