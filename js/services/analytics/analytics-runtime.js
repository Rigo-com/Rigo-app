// =====================================
// RIGO AI
// ANALYTICS RUNTIME
// =====================================



// =====================================
// STATE
// =====================================

const analyticsState =
Object.seal({

  initialized:false,

  trackedEvents:0,

  failedEvents:0,

  lastEventAt:null

});



// =====================================
// INITIALIZE
// =====================================

function initializeAnalytics(){

  if(
    analyticsState.initialized
  ){

    return true;

  }

  analyticsState.initialized =
  true;

  return true;

}



// =====================================
// TRACK
// =====================================

function trackEvent(
  eventName,
  metadata = {}
){

  const event =

  String(
    eventName ?? ""
  )
  .trim();

  if(
    !event
  ){

    analyticsState
    .failedEvents++;

    return false;

  }

  analyticsState
  .trackedEvents++;

  analyticsState
  .lastEventAt =
  Date.now();

  return Object.freeze({

    event,

    metadata,

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

function resetAnalytics(){

  analyticsState
  .initialized =
  false;

  analyticsState
  .trackedEvents =
  0;

  analyticsState
  .failedEvents =
  0;

  analyticsState
  .lastEventAt =
  null;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAnalyticsDiagnostics(){

  return Object.freeze({

    initialized:
    analyticsState
    .initialized,

    trackedEvents:
    analyticsState
    .trackedEvents,

    failedEvents:
    analyticsState
    .failedEvents,

    lastEventAt:
    analyticsState
    .lastEventAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const AnalyticsRuntime =
Object.freeze({

  initialize:
  initializeAnalytics,

  track:
  trackEvent,

  reset:
  resetAnalytics,

  diagnostics:
  getAnalyticsDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeAnalytics,

  trackEvent,

  resetAnalytics,

  getAnalyticsDiagnostics,

  AnalyticsRuntime

};

export default
AnalyticsRuntime;
