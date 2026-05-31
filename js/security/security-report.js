// =====================================
// RIGO AI
// SECURITY REPORT
// SECURITY REPORTING LAYER
// =====================================

import {

  getEvents,

  getMetrics

}
from "./security-monitor.js";

import {

  SECURITY_SEVERITY

}
from "./security-types.js";



// =====================================
// SUMMARY
// =====================================

function createSecuritySummary(){

  const metrics =
  getMetrics();

  const events =
  getEvents();

  const criticalEvents =

    events.filter((event) =>

      event.severity ===
      SECURITY_SEVERITY.CRITICAL

    ).length;

  return Object.freeze({

    generatedAt:
    Date.now(),

    totalEvents:
    metrics.totalEvents,

    totalViolations:
    metrics.totalViolations,

    criticalEvents

  });

}



// =====================================
// REPORT
// =====================================

function createSecurityReport(){

  return Object.freeze({

    summary:
    createSecuritySummary(),

    events:
    getEvents()

  });

}



// =====================================
// FILTERED REPORT
// =====================================

function createFilteredReport(
  severity
){

  const events =

    getEvents()
    .filter((event) =>

      event.severity ===
      severity

    );

  return Object.freeze({

    generatedAt:
    Date.now(),

    severity,

    count:
    events.length,

    events

  });

}



// =====================================
// CLEAR REPORT
// =====================================

function createEmptyReport(){

  return Object.freeze({

    generatedAt:
    Date.now(),

    summary:
    Object.freeze({

      totalEvents:0,

      totalViolations:0,

      criticalEvents:0

    }),

    events:[]

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityReport =
Object.freeze({

  summary:
  createSecuritySummary,

  create:
  createSecurityReport,

  filtered:
  createFilteredReport,

  empty:
  createEmptyReport

});



// =====================================
// EXPORTS
// =====================================

export {

  createSecuritySummary,

  createSecurityReport,

  createFilteredReport,

  createEmptyReport,

  SecurityReport

};
