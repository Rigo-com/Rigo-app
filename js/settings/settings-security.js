// =====================================
// RIGO AI
// SETTINGS SECURITY
// SECURITY LAYER
// =====================================



// =====================================
// DANGEROUS KEYS
// =====================================

const BLOCKED_KEYS =
Object.freeze([

  "__proto__",

  "prototype",

  "constructor"

]);



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

  );

}



// =====================================
// SANITIZE
// =====================================

function sanitizeSettings(
  settings
){

  if(
    !isObject(
      settings
    )
  ){

    return {};
  }

  const sanitized =
  {};

  for(
    const [

      key,

      value

    ]

    of Object.entries(
      settings
    )
  ){

    if(
      BLOCKED_KEYS
      .includes(
        key
      )
    ){
      continue;
    }

    if(
      isObject(
        value
      )
    ){

      sanitized[key] =

        sanitizeSettings(
          value
        );

      continue;

    }

    sanitized[key] =
    value;

  }

  return sanitized;

}



// =====================================
// INTEGRITY
// =====================================

function verifyIntegrity(
  settings
){

  try{

    sanitizeSettings(
      settings
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const SettingsSecurity =
Object.freeze({

  sanitizeSettings,

  verifyIntegrity

});



// =====================================
// EXPORTS
// =====================================

export {

  BLOCKED_KEYS,

  sanitizeSettings,

  verifyIntegrity,

  SettingsSecurity

};

export default
SettingsSecurity;
