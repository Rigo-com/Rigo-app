// =====================================
// RIGO AI
// ANALYTICS RUNTIME
// =====================================



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

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const AnalyticsRuntime =
Object.freeze({

  track:
  trackAnalyticsEvent

});
