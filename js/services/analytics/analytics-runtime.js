// =====================================
// RIGO AI
// ANALYTICS RUNTIME
// =====================================



// =====================================
// STATE
// =====================================

const analyticsRuntimeState =
Object.seal({

  initialized:false,

  trackedEvents:0,

  failedEvents:0,

  lastEventAt:null

});



// =====================================
// HELPERS
// =====================================

function sanitizeAnalyticsMetadata(
  metadata
){

  if(

    !metadata ||

    typeof metadata !==
    "object"

  ){

    return {};

  }

  try{

    return JSON.parse(
      JSON.stringify(metadata)
    );

  }

  catch(error){

    return {};

  }

}



async function emitAnalyticsEvent(
  payload
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      "analytics.event",

      payload

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// TRACK EVENT
// =====================================

async function trackAnalyticsEvent(

  eventName,
  metadata = {}

){

  const normalizedEvent =
  String(
    eventName || ""
  )
  .trim();

  if(!normalizedEvent){

    analyticsRuntimeState
    .failedEvents++;

    return false;

  }

  const payload = {

    source:
    "analytics-runtime",

    event:
    normalizedEvent,

    metadata:
    sanitizeAnalyticsMetadata(
      metadata
    ),

    timestamp:
    Date.now()

  };

  const success =
  await emitAnalyticsEvent(
    payload
  );

  if(!success){

    analyticsRuntimeState
    .failedEvents++;

    return false;

  }

  analyticsRuntimeState
  .trackedEvents++;

  analyticsRuntimeState
  .lastEventAt =
  Date.now();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAnalyticsDiagnostics(){

  return Object.freeze({

    initialized:
    analyticsRuntimeState
    .initialized,

    trackedEvents:
    analyticsRuntimeState
    .trackedEvents,

    failedEvents:
    analyticsRuntimeState
    .failedEvents,

    lastEventAt:
    analyticsRuntimeState
    .lastEventAt,

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

function resetAnalyticsRuntime(){

  analyticsRuntimeState
  .initialized =
  false;

  analyticsRuntimeState
  .trackedEvents =
  0;

  analyticsRuntimeState
  .failedEvents =
  0;

  analyticsRuntimeState
  .lastEventAt =
  null;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAnalyticsRuntime(){

  if(
    analyticsRuntimeState
    .initialized
  ){

    return true;

  }

  analyticsRuntimeState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const AnalyticsRuntime =
Object.freeze({

  initialize:
  initializeAnalyticsRuntime,

  reset:
  resetAnalyticsRuntime,

  track:
  trackAnalyticsEvent,

  diagnostics:
  getAnalyticsDiagnostics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AnalyticsRuntime =
  AnalyticsRuntime;

}
