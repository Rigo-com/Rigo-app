import SETTINGS_DEFAULTS from "./settings-defaults.js";
import { SettingsState } from "./settings-state.js";
import { SETTINGS_STATES, SETTINGS_OPERATIONS, SETTINGS_STATUS } from "./settings-types.js";
import SettingsEvents, { SETTINGS_EVENTS, emit } from "./settings-events.js";
import { loadSettings, createBackup } from "./settings-storage.js";
import { validateSettings } from "./settings-validation.js";
import { sanitizeSettings, verifyIntegrity } from "./settings-security.js";
import { migrateSettings } from "./settings-migrations.js";
import { syncFromStorage, syncToStorage } from "./settings-sync.js";
import { deepMerge, normalizeSettings as normalizeUtilitySettings, getSettingValue, setSettingValue, isSettingsSection } from "./settings-utils.js";

function normalizeSettings(settings){
  const normalized = normalizeUtilitySettings(settings || {});
  return validateSettings(sanitizeSettings(migrateSettings(normalized)));
}

function initialize(){
  if(SettingsState.snapshot().initialized) return true;
  SettingsState.setSyncing(true);
  const settings = syncFromStorage();
  if(settings) SettingsState.incrementSyncs();
  else SettingsState.incrementFailedSyncs();
  SettingsState.setSettings(settings || structuredClone(SETTINGS_DEFAULTS));
  SettingsState.setInitialized(true);
  SettingsState.setHealthy(Boolean(settings));
  emit(SETTINGS_EVENTS.INITIALIZED, {
    operation:SETTINGS_OPERATIONS.LOAD,
    status:settings ? SETTINGS_STATUS.SUCCESS : SETTINGS_STATUS.FAILED
  });
  SettingsState.setSyncing(false);
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
    if(!verifyIntegrity(settings)) throw new Error("SETTINGS_INTEGRITY_FAILED");
    createBackup(current);
    SettingsState.setSyncing(true);
    const result = syncToStorage(settings);
    if(!result){
      SettingsState.incrementFailedSyncs();
      throw new Error("SETTINGS_SAVE_FAILED");
    }
    SettingsState.incrementSyncs();
    SettingsState.setSettings(settings);
    SettingsState.setHealthy(true);
    SettingsState.incrementSaves();
    emit(SETTINGS_EVENTS.SAVED, { operation:SETTINGS_OPERATIONS.SAVE, status:SETTINGS_STATUS.SUCCESS, settings:structuredClone(settings) });
    return true;
  }
  catch(error){
    SettingsState.setHealthy(false);
    SettingsState.incrementFailedSaves();
    emit(SETTINGS_EVENTS.SYNC_FAILED, { operation:SETTINGS_OPERATIONS.SYNC, status:SETTINGS_STATUS.FAILED, error:String(error?.message || error) });
    return false;
  }
  finally { SettingsState.setSaving(false); SettingsState.setSyncing(false); }
}

function update(updates = {}){
  try{
    const sanitizedUpdates = sanitizeSettings(updates);
    const merged = deepMerge(SettingsState.getSettings(), sanitizedUpdates);
    const validated = validateSettings(merged);
    SettingsState.updateSettings(validated);
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

function getValue(path){
  return getSettingValue(SettingsState.getSettings(), path);
}

function setValue(path, value){
  const section = String(path || "").split(".")[0];
  if(!isSettingsSection(section)) return false;
  const next = SettingsState.getSettings();
  if(!setSettingValue(next, path, value)) return false;
  return update(next);
}
function snapshot(){
  const stateSnapshot = SettingsState.snapshot();
  const state = stateSnapshot.saving ? SETTINGS_STATES.SAVING
    : stateSnapshot.syncing ? SETTINGS_STATES.SYNCING
    : stateSnapshot.loading ? SETTINGS_STATES.LOADING
    : stateSnapshot.healthy ? SETTINGS_STATES.READY
    : SETTINGS_STATES.ERROR;
  return Object.freeze({
    ...stateSnapshot,
    state,
    diagnostics:SettingsState.diagnostics(),
    timestamp:Date.now()
  });
}
const health = snapshot;

const SettingsManager = Object.freeze({
  id:"settings", priority:20,
  initialize, boot, load, save, update, reset, shutdown,
  getSettings, getValue, setValue, health, snapshot
});

export { normalizeSettings, initialize, boot, load, save, update, reset, shutdown, getSettings, getValue, setValue, health, snapshot, SettingsManager };
export default SettingsManager;
