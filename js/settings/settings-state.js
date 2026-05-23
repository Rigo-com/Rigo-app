// =====================================
// RIGO AI
// SETTINGS STATE
// ENTERPRISE ULTRA FINAL
// =====================================



const settingsState =
Object.seal({

  initialized:false,

  loading:false,

  saving:false,

  syncing:false,

  dirty:false,

  corrupted:false,

  lastLoadedAt:null,

  lastSavedAt:null,

  lastSyncedAt:null,

  totalLoads:0,

  totalSaves:0,

  failedLoads:0,

  failedSaves:0,

  lastError:null,

  currentState:
  SETTINGS_STATES.READY,

  runtimeSettings:
  createSettingsObject(),

  backupSettings:null

});
