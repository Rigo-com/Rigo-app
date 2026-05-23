// =====================================
// RIGO AI
// SETTINGS MIGRATIONS
// ENTERPRISE FINAL
// =====================================



function migrateSettingsObject(
  settings
){

  if(!settings){

    return createSettingsObject();
  }

  const version =
  normalizeMemoryString(
    settings.version
  );



  // ===================================
  // FUTURE MIGRATIONS
  // ===================================

  switch(version){

    case "1.0.0":

    default:

      return settings;

  }

}
