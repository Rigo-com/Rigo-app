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

  alert(
  "DEBUG INITIALIZE STARTED"
);
  
  Diagnostics.start();

  Diagnostics.recordEvent(
  "debug:initialized"
);

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

  Scanner
  .runtime
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

  const runtime =

    Scanner
    .runtime
    .snapshot();

  const circular =

    Scanner
    .circular
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
    .critical,

    events:
    diagnostics
    .eventCount || 0,

    runtimeErrors:
    runtime
    .runtimeErrors || 0,

    circularDependencies:
    circular
    .circularFound || 0

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

  Scanner
  .runtime
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

    runtime:

    Scanner
    .runtime
    .snapshot(),

    module:

    Scanner
    .module
    .snapshot(),

    dependency:

    Scanner
    .dependency
    .snapshot(),

    imports:

    Scanner
    .imports
    .snapshot(),

    syntax:

    Scanner
    .syntax
    .snapshot(),

    circular:

    Scanner
    .circular
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
