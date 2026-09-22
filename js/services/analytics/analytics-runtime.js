const analyticsState = Object.seal({
  initialized:false,
  trackedEvents:0,
  failedEvents:0,
  lastEventAt:null
});

function cloneMetadata(metadata){
  if(metadata === null || typeof metadata !== "object") return metadata;

  if(typeof structuredClone === "function"){
    try{return structuredClone(metadata);}catch{}
  }

  try{
    return JSON.parse(JSON.stringify(metadata));
  }catch{
    return metadata;
  }
}

function initializeAnalytics(){
  if(analyticsState.initialized) return true;
  analyticsState.initialized = true;
  return true;
}

function trackEvent(eventName, metadata = {}){
  if(!analyticsState.initialized){
    analyticsState.failedEvents++;
    return false;
  }

  const event = String(eventName ?? "").trim();
  if(!event){
    analyticsState.failedEvents++;
    return false;
  }

  analyticsState.trackedEvents++;
  analyticsState.lastEventAt = Date.now();

  return Object.freeze({
    event,
    metadata:cloneMetadata(metadata),
    timestamp:Date.now()
  });
}

function resetAnalytics(){
  analyticsState.initialized = false;
  analyticsState.trackedEvents = 0;
  analyticsState.failedEvents = 0;
  analyticsState.lastEventAt = null;
  return true;
}

function getAnalyticsDiagnostics(){
  return Object.freeze({
    initialized:analyticsState.initialized,
    trackedEvents:analyticsState.trackedEvents,
    failedEvents:analyticsState.failedEvents,
    lastEventAt:analyticsState.lastEventAt
  });
}

const AnalyticsRuntime = Object.freeze({
  initialize:initializeAnalytics,
  track:trackEvent,
  reset:resetAnalytics,
  diagnostics:getAnalyticsDiagnostics,
  snapshot:getAnalyticsDiagnostics
});

export {
  initializeAnalytics,
  trackEvent,
  resetAnalytics,
  getAnalyticsDiagnostics,
  AnalyticsRuntime
};

export default AnalyticsRuntime;
