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
// TRACK EVENT
// =====================================

async function trackAnalyticsEvent(
  eventName,
 metadata = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    analyticsRuntimeState
    .failedEvents++;

    return false;

  }

  try{

    await emitSystemEvent(

      "analytics.event",

      {

        source:
        "analytics-runtime",

        event:
        String(eventName),

        metadata,

        timestamp:
        Date.now()

      }

    );

    analyticsRuntimeState
    .trackedEvents++;

    analyticsRuntimeState
    .lastEventAt =
    Date.now();

    return true;

  }

  catch(error){

    analyticsRuntimeState
    .failedEvents++;

    return false;

  }

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
    .lastEventAt

  });

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

  window.initializeAnalyticsRuntime =
  initializeAnalyticsRuntime;

}
