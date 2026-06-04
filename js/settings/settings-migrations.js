// =====================================
// RIGO AI
// SETTINGS MIGRATIONS
// MIGRATION LAYER
// =====================================

import SETTINGS_DEFAULTS
from "./settings-defaults.js";



// =====================================
// VERSION
// =====================================

const SETTINGS_VERSION =
"1.0.0";



// =====================================
// HELPERS
// =====================================

function getSettingsVersion(
  settings
){

  return (

    settings?.version

    ??

    "0.0.0"

  );

}



// =====================================
// MIGRATIONS
// =====================================

const migrations =
Object.freeze({

  "0.0.0":

  function migrateTo100(
    settings
  ){

    return {

      version:
      SETTINGS_VERSION,

      ...structuredClone(
        SETTINGS_DEFAULTS
      ),

      ...settings

    };

  }

});



// =====================================
// MIGRATE
// =====================================

function migrateSettings(
  settings = {}
){

  const version =

    getSettingsVersion(
      settings
    );

  const migration =

    migrations[
      version
    ];

  if(
    typeof migration !==
    "function"
  ){

    return {

      version:
      SETTINGS_VERSION,

      ...structuredClone(
        SETTINGS_DEFAULTS
      ),

      ...settings

    };

  }

  return migration(
    settings
  );

}



// =====================================
// VERSION CHECK
// =====================================

function isLatestVersion(
  settings
){

  return (

    getSettingsVersion(
      settings
    )

    ===

    SETTINGS_VERSION

  );

}



// =====================================
// PUBLIC API
// =====================================

const SettingsMigrations =
Object.freeze({

  SETTINGS_VERSION,

  getSettingsVersion,

  migrateSettings,

  isLatestVersion

});



// =====================================
// EXPORTS
// =====================================

export {

  SETTINGS_VERSION,

  getSettingsVersion,

  migrateSettings,

  isLatestVersion,

  SettingsMigrations

};

export default
SettingsMigrations;
