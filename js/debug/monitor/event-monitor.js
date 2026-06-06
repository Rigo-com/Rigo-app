// =====================================
// RIGO AI
// EVENT MONITOR
// =====================================

const eventMonitorState =
Object.seal({

  active:
  false,

  events:
  [],

  maxEvents:
  1000,

  totalEvents:
  0,

  failedEvents:
  0,

  slowEvents:
  0,

  lastEvent:
  null

});



// =====================================
// RECORD EVENT
// =====================================

function recordEvent(

  eventName,

  duration = 0,

  success = true

){

  const event = {

    name:
    eventName,

    duration,

    success,

    timestamp:
    Date.now()

  };

  eventMonitorState
  .events
  .push(event);

  if(

    eventMonitorState
    .events
    .length >

    eventMonitorState
    .maxEvents

  ){

    eventMonitorState
    .events
    .shift();

  }

  eventMonitorState
  .totalEvents++;

  if(
    !success
  ){

    eventMonitorState
    .failedEvents++;

  }

  if(
    duration > 100
  ){

    eventMonitorState
    .slowEvents++;

  }

  eventMonitorState
  .lastEvent =
  event;

  return event;

}



// =====================================
// START
// =====================================

function startEventMonitor(){

  eventMonitorState
  .active =
  true;

  return true;

}



// =====================================
// STOP
// =====================================

function stopEventMonitor(){

  eventMonitorState
  .active =
  false;

  return true;

}



// =====================================
// HEALTH
// =====================================

function calculateHealth(){

  const failures =

    eventMonitorState
    .failedEvents;

  const total =

    eventMonitorState
    .totalEvents;

  if(
    total === 0
  ){

    return 100;

  }

  const health =

    100 -

    (
      failures /
      total
    ) * 100;

  return Math.max(
    0,
    Math.round(
      health
    )
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return Object.freeze({

    active:
    eventMonitorState
    .active,

    totalEvents:
    eventMonitorState
    .totalEvents,

    failedEvents:
    eventMonitorState
    .failedEvents,

    slowEvents:
    eventMonitorState
    .slowEvents,

    health:
    calculateHealth(),

    lastEvent:
    eventMonitorState
    .lastEvent

  });

}



// =====================================
// API
// =====================================

export const EventMonitor =
Object.freeze({

  start:
  startEventMonitor,

  stop:
  stopEventMonitor,

  record:
  recordEvent,

  health:
  calculateHealth,

  snapshot

});



export default
EventMonitor;
