// =====================================
// RIGO AI
// SECURITY MONITOR
// ENTERPRISE SECURITY MONITORING LAYER
// =====================================



// =====================================
// SAFE SECURITY KEY
// =====================================

function normalizeSecurityKey(
  value
){

  try{

    return String(
      value || ""
    )
    .trim()
    .slice(
      0,
      300
    );

  }

  catch(error){

    return "";

  }

}



// =====================================
// SAFE SECURITY METADATA
// =====================================

function normalizeSecurityMetadata(
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
      JSON.stringify(
        metadata
      )
    );

  }

  catch(error){

    return {

      invalidMetadata:true

    };

  }

}



// =====================================
// RATE LIMIT CLEANUP
// =====================================

function cleanupRateLimitTracker(){

  const now =
  Date.now();

  const expirationWindow =

    SECURITY_CONFIG
    .RATE_LIMIT_WINDOW;



  // ============================
  // CLEAN INVALID / EXPIRED
  // ============================

  securityState
  .requestTracker
  .forEach((timestamps,key) => {

    if(
      !Array.isArray(
        timestamps
      )
    ){

      securityState
      .requestTracker
      .delete(
        key
      );

      return;

    }

    const validEntries =
    timestamps.filter((timestamp) => {

      return (

        Number.isFinite(
          timestamp
        )

        &&

        timestamp > 0

        &&

        now - timestamp <
        expirationWindow

      );

    });

    if(
      validEntries.length <= 0
    ){

      securityState
      .requestTracker
      .delete(
        key
      );

      return;

    }

    securityState
    .requestTracker
    .set(
      key,
      validEntries
    );

  });



  // ============================
  // ENFORCE MAX TRACKED KEYS
  // ============================

  while(

    securityState
    .requestTracker
    .size >

    SECURITY_CONFIG
    .MAX_TRACKED_KEYS

  ){

    const firstKey =

      securityState
      .requestTracker
      .keys()
      .next()
      .value;

    if(
      firstKey ===
      undefined
    ){

      break;

    }

    securityState
    .requestTracker
    .delete(
      firstKey
    );

  }

}



// =====================================
// TRACK SECURITY REQUEST
// =====================================

function trackSecurityRequest(
  key
){

  const normalizedKey =
  normalizeSecurityKey(
    key
  );

  if(
    !normalizedKey
  ){

    return false;

  }

  cleanupRateLimitTracker();

  const now =
  Date.now();

  const existing =

    securityState
    .requestTracker
    .get(
      normalizedKey
    )

    ||

    [];

  existing.push(now);



  // ============================
  // HARD LIMIT
  // ============================

  if(
    existing.length > 1000
  ){

    existing.splice(
      0,
      existing.length - 1000
    );

  }

  securityState
  .requestTracker
  .set(
    normalizedKey,
    existing
  );

  return true;

}



// =====================================
// CHECK RATE LIMIT
// =====================================

function checkRateLimit(
  key
){

  if(

    !SECURITY_CONFIG
    .ENABLE_RATE_LIMITING

  ){

    return true;

  }

  const normalizedKey =
  normalizeSecurityKey(
    key
  );

  if(
    !normalizedKey
  ){

    return false;

  }

  trackSecurityRequest(
    normalizedKey
  );

  const requests =

    securityState
    .requestTracker
    .get(
      normalizedKey
    )

    ||

    [];

  const allowed =

    requests.length <=

    SECURITY_CONFIG
    .MAX_RATE_LIMIT;

  if(!allowed){

    securityState
    .rateLimitHits++;

    logSecurityEvent(

      "RATE LIMIT EXCEEDED",

      {

        key:
        normalizedKey

      }

    );

  }

  return allowed;

}



// =====================================
// TRACK SUSPICIOUS ACTIVITY
// =====================================

function trackSuspiciousActivity(
  type,
  metadata = {}
){

  securityState
  .suspiciousActivities++;

  logSecurityEvent(

    "SUSPICIOUS ACTIVITY",

    {

      type:
      normalizeSecurityKey(
        type
      ),

      ...normalizeSecurityMetadata(
        metadata
      )

    }

  );

  return true;

}



// =====================================
// SECURITY METRICS
// =====================================

function getSecurityMetrics(){

  return Object.freeze({

    blockedRequests:
    securityState
    .blockedRequests,

    blockedURLs:
    securityState
    .blockedURLs,

    blockedPrompts:
    securityState
    .blockedPrompts,

    suspiciousActivities:
    securityState
    .suspiciousActivities,

    sanitizedPayloads:
    securityState
    .sanitizedPayloads,

    rateLimitHits:
    securityState
    .rateLimitHits,

    trackedRequests:

      securityState
      .requestTracker
      .size

  });

}



// =====================================
// RESET SECURITY METRICS
// =====================================

function resetSecurityMetrics(){

  securityState
  .blockedRequests = 0;

  securityState
  .blockedURLs = 0;

  securityState
  .blockedPrompts = 0;

  securityState
  .suspiciousActivities = 0;

  securityState
  .sanitizedPayloads = 0;

  securityState
  .rateLimitHits = 0;

  securityState
  .requestTracker
  .clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SecurityMonitor =
Object.freeze({

  cleanupTracker:
  cleanupRateLimitTracker,

  trackRequest:
  trackSecurityRequest,

  checkRateLimit,

  trackSuspicious:
  trackSuspiciousActivity,

  metrics:
  getSecurityMetrics,

  reset:
  resetSecurityMetrics

});
