// =====================================
// RIGO AI
// DEBUG UI INDEX
// PUBLIC API
// =====================================

export {
  DebugDashboard
}
from "./debug-dashboard.js";

export {
  DebugTable
}
from "./debug-table.js";

export {
  DebugWidgets
}
from "./debug-widgets.js";

export {
  DebugConsole
}
from "./debug-console.js";



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



export default
DebugUI;
