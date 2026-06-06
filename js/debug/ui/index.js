// =====================================
// RIGO AI
// DEBUG UI INDEX
// PUBLIC API
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  DebugDashboard
}
from "./debug-dashboard.js";

import {
  DebugTable
}
from "./debug-table.js";

import {
  DebugWidgets
}
from "./debug-widgets.js";

import {
  DebugConsole
}
from "./debug-console.js";



// =====================================
// EXPORTS
// =====================================

export {

  DebugDashboard,

  DebugTable,

  DebugWidgets,

  DebugConsole

};



// =====================================
// DEFAULT API
// =====================================

const DebugUI =
Object.freeze({

  dashboard:
  DebugDashboard,

  table:
  DebugTable,

  widgets:
  DebugWidgets,

  console:
  DebugConsole

});



// =====================================
// EXPORTS
// =====================================

export default
DebugUI;
