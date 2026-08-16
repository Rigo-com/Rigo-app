import SETTINGS_DEFAULTS from "./settings-defaults.js";
import { SettingsState } from "./settings-state.js";
import SettingsEvents, { SETTINGS_EVENTS, emit } from "./settings-events.js";
import { loadSettings, createBackup } from "./settings-storage.js";
import { validateSettings } from "./settings-validation.js";
import { sanitizeSettings } from "./settings-security.js";
import { migrateSettings } from "./settings-migrations.js";
import { syncFromStorage, syncToStorage } from "./settings-sync.js";
import { deepMerge } from "./settings-utils.js";

const managerOperations = Object.seal({ initialize:null });

function normalizeSettings(settings){
  return validateSettings(sanitizeSettings(migrateSettings(settings || {})));
}

function initialize(){
  if(SettingsState.snapshot().initialized) return true;
  const settings = syncFromStorage();
  SettingsState.setSettings(settings || structuredClone(SETTINGS_DEFAULTS));
  SettingsState.setInitialized(true);
  SettingsState.setHealthy(Boolean(settings));
  emit(SETTINGS_EVENTS.INITIALIZED);
  return true;
}

const boot = initialize;

function load(){
  SettingsState.setLoading(true);
  try{
    const settings = normalizeSettings(loadSettings());
    SettingsState.setSettings(settings);
    SettingsState.setHealthy(true);
    SettingsState.incrementLoads();
    emit(SETTINGS_EVENTS.LOADED, structuredClone(settings));
    return settings;
  }
  catch(error){
    SettingsState.setHealthy(false);
    SettingsState.incrementFailedLoads();
    emit(SETTINGS_EVENTS.VALIDATION_FAILED, { error:String(error?.message || error) });
    return null;
  }
  finally { SettingsState.setLoading(false); }
}

function save(){
  SettingsState.setSaving(true);
  try{
    const current = SettingsState.getSettings();
    const settings = normalizeSettings(current);
    createBackup(current);
    const result = syncToStorage(settings);
    if(!result) throw new Error("SETTINGS_SAVE_FAILED");
    SettingsState.setSettings(settings);
    SettingsState.setHealthy(true);
    SettingsState.incrementSaves();
    emit(SETTINGS_EVENTS.SAVED, structuredClone(settings));
    return true;
  }
  catch(error){
    SettingsState.setHealthy(false);
    SettingsState.incrementFailedSaves();
    emit(SETTINGS_EVENTS.SYNC_FAILED, { error:String(error?.message || error) });
    return false;
  }
  finally { SettingsState.setSaving(false); }
}

function update(updates = {}){
  try{
    const sanitizedUpdates = sanitizeSettings(updates);
    const merged = deepMerge(SettingsState.getSettings(), sanitizedUpdates);
    const validated = validateSettings(merged);
    SettingsState.setSettings(validated);
    SettingsState.setHealthy(true);
    emit(SETTINGS_EVENTS.UPDATED, structuredClone(validated));
    return true;
  }
  catch(error){
    SettingsState.setHealthy(false);
    emit(SETTINGS_EVENTS.VALIDATION_FAILED, { error:String(error?.message || error) });
    return false;
  }
}

function reset(){
  SettingsState.reset();
  emit(SETTINGS_EVENTS.RESET);
  return true;
}

function shutdown(){
  SettingsState.setInitialized(false);
  SettingsState.setLoading(false);
  SettingsState.setSaving(false);
  SettingsState.setSyncing(false);
  emit(SETTINGS_EVENTS.DESTROYED);
  SettingsEvents.clear();
  return true;
}

const getSettings = () => SettingsState.getSettings();
function snapshot(){
  return Object.freeze({
    ...SettingsState.snapshot(),
    diagnostics:SettingsState.diagnostics(),
    timestamp:Date.now()
  });
}
const health = snapshot;

const SettingsManager = Object.freeze({
  id:"settings", priority:20,
  initialize, boot, load, save, update, reset, shutdown,
  getSettings, health, snapshot
});

export { normalizeSettings, initialize, boot, load, save, update, reset, shutdown, getSettings, health, snapshot, SettingsManager };
export default SettingsManager;
