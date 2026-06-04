// =====================================
// RIGO AI
// SETTINGS DEBUG
// DIAGNOSTICS LAYER
// =====================================

import {
  getSettingsSnapshot,
  getSettingsDiagnostics
}
from "./settings-state.js";



// =====================================
// SNAPSHOT
// =====================================

function createDebugSnapshot(){

  return Object.freeze(

    getSettingsSnapshot()

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function getDebugDiagnostics(){

  return Object.freeze(

    getSettingsDiagnostics()

  );

}



// =====================================
// REPORT
// =====================================

function createDebugReport(){

  return Object.freeze({

    timestamp:
    Date.now(),

    snapshot:
    getSettingsSnapshot(),

    diagnostics:
    getSettingsDiagnostics()

  });

}



// =====================================
// EXPORT
// =====================================

function exportDebugReport(){

  return JSON.stringify(

    createDebugReport(),

    null,

    2

  );

}



// =====================================
// PUBLIC API
// =====================================

const SettingsDebug =
Object.freeze({

  snapshot:
  createDebugSnapshot,

  diagnostics:
  getDebugDiagnostics,

  report:
  createDebugReport,

  exportReport:
  exportDebugReport

});



// =====================================
// EXPORTS
// =====================================

export {

  createDebugSnapshot,

  getDebugDiagnostics,

  createDebugReport,

  exportDebugReport,

  SettingsDebug

};

export default
SettingsDebug;
