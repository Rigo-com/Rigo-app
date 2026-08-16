import SETTINGS_DEFAULTS from "./settings-defaults.js";

const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);

function validateSection(section, defaults){
  if(!isObject(section)) return structuredClone(defaults);
  const result = structuredClone(defaults);
  for(const key of Object.keys(defaults)){
    const defaultValue = defaults[key];
    const currentValue = section[key];
    if(typeof currentValue === typeof defaultValue) result[key] = currentValue;
  }
  return result;
}

function validateSettings(settings){
  if(!isObject(settings)) return structuredClone(SETTINGS_DEFAULTS);
  const validated = {};
  if(typeof settings.version === "string" && settings.version.trim()) validated.version = settings.version.trim();
  for(const section of Object.keys(SETTINGS_DEFAULTS)){
    validated[section] = validateSection(settings[section], SETTINGS_DEFAULTS[section]);
  }
  return validated;
}

function isValidSettings(settings){
  if(!isObject(settings)) return false;
  for(const section of Object.keys(SETTINGS_DEFAULTS)) if(!isObject(settings[section])) return false;
  return true;
}

const repairSettings = validateSettings;
const SettingsValidation = Object.freeze({ validateSettings, validateSection, isValidSettings, repairSettings });
export { validateSettings, validateSection, isValidSettings, repairSettings, SettingsValidation };
export default SettingsValidation;
