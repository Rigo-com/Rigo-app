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

  Diagnostics.start();

  Diagnostics.addWarning(
    "DEBUG INITIALIZED"
  );

  alert(
    "DEBUG BOOTED"
  );

  Monitor
  .memory
  .start();

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

  const snapshot =

    createDebugSnapshot();

  UI
  .dashboard
  .render(snapshot);

  UI
  .dashboard
  .show();

  return true;

}



// =====================================
// STOP
// =====================================

function stopDebugSystem(){

  Monitor
  .memory
  .stop();

  Monitor
  .performance
  .stop();

  Monitor
  .network
  .stop();

  Monitor
  .events
  .stop();

  Monitor
  .services
  .stop();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createDebugSnapshot(){

  return Object.freeze({

    diagnostics:

    Diagnostics
    .snapshot(),

    memory:

    Monitor
    .memory
    .snapshot(),

    performance:

    Monitor
    .performance
    .snapshot(),

    network:

    Monitor
    .network
    .snapshot(),

    events:

    Monitor
    .events
    .snapshot(),

    services:

    Monitor
    .services
    .snapshot(),

    timestamp:
    Date.now()

  });

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

  start:
  initializeDebugSystem,

  stop:
  stopDebugSystem,

  report:
  createSystemReport,

  snapshot:
  createDebugSnapshot,

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
