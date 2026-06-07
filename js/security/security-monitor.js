// =====================================
// RIGO AI
// SECURITY MONITOR
// SECURITY EVENT MONITORING LAYER
// =====================================

import {

  SECURITY_SEVERITY,

  SECURITY_EVENTS

}
from "./security-types.js";



// =====================================
// CONFIG
// =====================================

const SECURITY_MONITOR_CONFIG =
Object.freeze({

  MAX_EVENTS:
  1000

});



// =====================================
// STATE
// =====================================

const securityMonitorState =
Object.seal({

  events:[]

});



// =====================================
// EVENT ID
// =====================================

function createEventId(){

  if(

    typeof crypto !==
    "undefined"

    &&

    typeof crypto.randomUUID ===
    "function"

  ){

    return crypto.randomUUID();

  }

  return `event_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;

}



// =====================================
// EVENT
// =====================================

function createSecurityEvent(
  type,
  details = {},
  severity =
  SECURITY_SEVERITY.INFO
){

  if(
    typeof type !==
    "string"
  ){

    throw new TypeError(
      "Invalid event type"
    );

  }

  return Object.freeze({

    id:
    createEventId(),

    type,

    severity,

    timestamp:
    Date.now(),

    details

  });

}



// =====================================
// RECORD EVENT
// =====================================

function recordEvent(
  type,
  details = {},
  severity =
  SECURITY_SEVERITY.INFO
){

  const event =
  createSecurityEvent(

    type,

    details,

    severity

  );

  securityMonitorState
  .events
  .push(event);

  if(

    securityMonitorState
    .events.length >

    SECURITY_MONITOR_CONFIG
    .MAX_EVENTS

  ){

    securityMonitorState
    .events.shift();

  }

  return event;

}



// =====================================
// VIOLATION
// =====================================

function recordViolation(
  type,
  details = {}
){

  return recordEvent(

    type,

    details,

    SECURITY_SEVERITY.ERROR

  );

}



// =====================================
// GET EVENTS
// =====================================

function getEvents(){

  return Object.freeze([

    ...securityMonitorState
    .events

  ]);

}



// =====================================
// CLEAR EVENTS
// =====================================

function clearEvents(){

  securityMonitorState
  .events.length = 0;

}



// =====================================
// METRICS
// =====================================

function getMetrics(){

  const metrics = {

    totalEvents:0,

    totalViolations:0

  };

  securityMonitorState
  .events
  .forEach((event) => {

    metrics.totalEvents++;

    if(

      event.severity ===
      SECURITY_SEVERITY.ERROR

      ||

      event.severity ===
      SECURITY_SEVERITY.CRITICAL

    ){

      metrics.totalViolations++;

    }

  });

  return Object.freeze(
    metrics
  );

}



// =====================================
// PUBLIC API
// =====================================

const SecurityMonitor =
Object.freeze({

  events:
  SECURITY_EVENTS,

  record:
  recordEvent,

  violation:
  recordViolation,

  getEvents,

  clear:
  clearEvents,

  metrics:
  getMetrics

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_MONITOR_CONFIG,

  recordEvent,

  recordViolation,

  getEvents,

  clearEvents,

  getMetrics,

  SecurityMonitor

};

export default SecurityMonitor;
