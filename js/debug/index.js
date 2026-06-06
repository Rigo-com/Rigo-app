// =====================================
// RIGO AI
// DEBUG SYSTEM
// ROOT API
// =====================================

import Diagnostics
from "./diagnostics/index.js";

import Scanner
from "./scanner/index.js";

import Monitor
from "./monitor/index.js";

import Reporter
from "./reporter/index.js";

import UI
from "./ui/index.js";



// =====================================
// INITIALIZE
// =====================================

function initializeDebugSystem(){

  Diagnostics
  .initialize();

  Monitor
  .memory
  .start();

  Monitor
  .performance
  .start();

  Monitor
  .network
  .start();

  Monitor
  .events
  .start();

  Monitor
  .services
  .start();

  return true;

}



// =====================================
// CREATE REPORT
// =====================================

function createSystemReport(){

  const diagnostics =

    Diagnostics
    .snapshot();

  return Reporter
  .builder
  .health({

    healthScore:
    diagnostics
    .healthScore,

    warnings:
    diagnostics
    .warnings,

    errors:
    diagnostics
    .errors,

    critical:
    diagnostics
    .critical

  });

}



// =====================================
// OPEN DASHBOARD
// =====================================

function openDashboard(){

  const report =

    createSystemReport();

  UI
  .dashboard
  .render(report);

  UI
  .dashboard
  .show();

  return true;

}



// =====================================
// API
// =====================================

const Debug =
Object.freeze({

  diagnostics:
  Diagnostics,

  scanner:
  Scanner,

  monitor:
  Monitor,

  reporter:
  Reporter,

  ui:
  UI,

  initialize:
  initializeDebugSystem,

  report:
  createSystemReport,

  dashboard:
  openDashboard

});



// =====================================
// EXPORTS
// =====================================

export {

  Debug

};

export default
Debug;
