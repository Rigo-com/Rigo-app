// =====================================
// RIGO AI
// SETTINGS DEBUG
// ENTERPRISE FINAL
// =====================================



function getSettingsDiagnostics(){

  return {

    initialized:
    settingsState
    .initialized,

    loading:
    settingsState
    .loading,

    saving:
    settingsState
    .saving,

    syncing:
    settingsState
    .syncing,

    dirty:
    settingsState
    .dirty,

    corrupted:
    settingsState
    .corrupted,

    totalLoads:
    settingsState
    .totalLoads,

    totalSaves:
    settingsState
    .totalSaves,

    failedLoads:
    settingsState
    .failedLoads,

    failedSaves:
    settingsState
    .failedSaves,

    lastLoadedAt:
    settingsState
    .lastLoadedAt,

    lastSavedAt:
    settingsState
    .lastSavedAt,

    lastSyncedAt:
    settingsState
    .lastSyncedAt,

    currentState:
    settingsState
    .currentState

  };

}
