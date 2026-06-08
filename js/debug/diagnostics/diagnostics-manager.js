// =====================================
// RIGO AI
// DIAGNOSTICS MANAGER
// DEBUG FOUNDATION MANAGER
// =====================================

import {
  diagnosticsState
}
from "./diagnostics-state.js";

import {
  DiagnosticsEvents,
  emit
}
from "./diagnostics-events.js";



// =====================================
// INITIALIZE
// =====================================

function initializeDiagnostics(){

  if(
    diagnosticsState
    .initialized
  ){

    return true;

  }

  diagnosticsState
  .initialized =
  true;

  diagnosticsState
  .startedAt =
  Date.now();

  recordEvent(
  DiagnosticsEvents
  .INITIALIZED
);
  
  emit(
    DiagnosticsEvents
    .INITIALIZED
  );

  return true;

}



// =====================================
// START
// =====================================

function startDiagnostics(){

  initializeDiagnostics();

  diagnosticsState
  .active =
  true;

  recordEvent(
  DiagnosticsEvents
  .STARTED
);
  
  emit(
    DiagnosticsEvents
    .STARTED
  );

  return true;

}



// =====================================
// STOP
// =====================================

function stopDiagnostics(){

  diagnosticsState
  .active =
  false;

  diagnosticsState
  .scanning =
  false;

  diagnosticsState
  .monitoring =
  false;

  recordEvent(
  DiagnosticsEvents
  .STOPPED
);
  
  emit(
    DiagnosticsEvents
    .STOPPED
  );

  return true;

}



// =====================================
// HEALTH SCORE
// =====================================

function updateHealthScore(){

  let score = 100;

  score -=
  diagnosticsState
  .criticalIssues
  .length * 20;

  score -=
  diagnosticsState
  .errors
  .length * 5;

  score -=
  diagnosticsState
  .warnings
  .length * 2;

  diagnosticsState
  .healthScore =
  Math.max(
    0,
    score
  );

  return diagnosticsState
  .healthScore;

}



// =====================================
// EVENT HISTORY
// =====================================

function recordEvent(
  type,
  payload = null
){

  diagnosticsState
  .eventHistory
  .push({

    type,

    payload,

    timestamp:
    Date.now()

  });

  return true;

}



// =====================================
// WARNING
// =====================================

function addWarning(
  warning
){

  diagnosticsState
  .warnings
  .push(
    warning
  );

  diagnosticsState
  .diagnostics
  .warnings++;

  updateHealthScore();

  recordEvent(
  DiagnosticsEvents.WARNING,
  warning
);
  
  emit(
    DiagnosticsEvents
    .WARNING,
    warning
  );

  return true;

}



// =====================================
// ERROR
// =====================================

function addError(
  error
){

  diagnosticsState
  .errors
  .push(
    error
  );

  diagnosticsState
  .diagnostics
  .errors++;

  updateHealthScore();

  recordEvent(
  DiagnosticsEvents.ERROR,
  error
);
  
  emit(
    DiagnosticsEvents
    .ERROR,
    error
  );

  return true;

}



// =====================================
// CRITICAL
// =====================================

function addCriticalIssue(
  issue
){

  diagnosticsState
  .criticalIssues
  .push(
    issue
  );

  diagnosticsState
  .diagnostics
  .critical++;

  updateHealthScore();

  recordEvent(
  DiagnosticsEvents.CRITICAL,
  issue
);
  
  emit(
    DiagnosticsEvents
    .CRITICAL,
    issue
  );

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createDiagnosticsSnapshot(){

  return Object.freeze({

    initialized:
    diagnosticsState
    .initialized,

    active:
    diagnosticsState
    .active,

    scanning:
    diagnosticsState
    .scanning,

    monitoring:
    diagnosticsState
    .monitoring,

    healthScore:
    diagnosticsState
    .healthScore,

    diagnostics:{

      ...diagnosticsState
      .diagnostics

    },

    errors:

    diagnosticsState
    .errors
    .length,

    warnings:

    diagnosticsState
    .warnings
    .length,

    critical:

    diagnosticsState
    .criticalIssues
    .length,

    eventCount:

    diagnosticsState
    .eventHistory
    .length,

    lastEvent:

    diagnosticsState
    .eventHistory[
    diagnosticsState
    .eventHistory
    .length - 1
    ] || null,


    recentEvents:

[

  ...diagnosticsState
  .eventHistory

]
.slice(-25),
    
    timestamp:
    Date.now()

  });

}



// =====================================
// API
// =====================================

const DiagnosticsManager =
Object.freeze({

  initialize:
  initializeDiagnostics,

  start:
  startDiagnostics,

  stop:
  stopDiagnostics,

  recordEvent,
  
  addWarning,

  addError,

  addCriticalIssue,

  updateHealthScore,

  snapshot:
  createDiagnosticsSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  DiagnosticsManager

};

export default
DiagnosticsManager;
