// =====================================
// RIGO AI
// SETTINGS VALIDATION
// VALIDATION LAYER
// =====================================

import SETTINGS_DEFAULTS
from "./settings-defaults.js";



// =====================================
// HELPERS
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
// SECTION VALIDATION
// =====================================

function validateSection(

  section,

  defaults

){

  if(
    !isObject(
      section
    )
  ){

    return structuredClone(
      defaults
    );

  }

  const result =

    structuredClone(
      defaults
    );

  for(
    const key
    of Object.keys(
      defaults
    )
  ){

    const defaultValue =

      defaults[key];

    const currentValue =

      section[key];



    if(
      typeof currentValue ===

      typeof defaultValue
    ){

      result[key] =
      currentValue;

    }

  }

  return result;

}



// =====================================
// SETTINGS VALIDATION
// =====================================

function validateSettings(
  settings
){

  if(
    !isObject(
      settings
    )
  ){

    return structuredClone(
      SETTINGS_DEFAULTS
    );

  }

  const validated =
  {};

  for(
    const section
    of Object.keys(
      SETTINGS_DEFAULTS
    )
  ){

    validated[section] =

      validateSection(

        settings[section],

        SETTINGS_DEFAULTS[
          section
        ]

      );

  }

  return validated;

}



// =====================================
// SETTINGS CHECK
// =====================================

function isValidSettings(
  settings
){

  if(
    !isObject(
      settings
    )
  ){

    return false;
  }

  for(
    const section
    of Object.keys(
      SETTINGS_DEFAULTS
    )
  ){

    if(
      !isObject(
        settings[
          section
        ]
      )
    ){

      return false;

    }

  }

  return true;

}



// =====================================
// REPAIR
// =====================================

function repairSettings(
  settings
){

  return validateSettings(
    settings
  );

}



// =====================================
// PUBLIC API
// =====================================

const SettingsValidation =
Object.freeze({

  validateSettings,

  validateSection,

  isValidSettings,

  repairSettings

});



// =====================================
// EXPORTS
// =====================================

export {

  validateSettings,

  validateSection,

  isValidSettings,

  repairSettings,

  SettingsValidation

};

export default
SettingsValidation;
