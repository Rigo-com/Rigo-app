// =====================================
// RIGO AI
// SECURITY MONITOR
// ENTERPRISE SECURITY MONITORING LAYER
// FINAL HARDENED EDITION
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
    .toLowerCase()
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

    if(
      typeof SecuritySanitize ===
      "object"

      &&

      typeof SecuritySanitize
      .object ===
      "function"
    ){

      return SecuritySanitize
      .object(
        metadata
      );

    }

  }

  catch(error){}

  try{

    return JSON.parse(
      JSON.stringify(
        metadata
      )
    );

  }

  catch(error){

    return {

      invalidMetadata:
      true

    };

  }

}



// =====================================
// VALIDATE REQUEST TRACKER
// =====================================

function validateRequestTracker(){

  return (

    securityState
    ?.requestTracker

    instanceof Map

  );

}



// =====================================
// RATE LIMIT CLEANUP
// =====================================

function cleanupRateLimitTracker(){

  if(
    !validateRequestTracker()
  ){

    return false;

  }

  const now =
  Date.now();

  const expirationWindow =

    SECURITY_CONFIG
    .RATE_LIMIT_WINDOW;



  // ===================================
  // CLEAN INVALID / EXPIRED
  // ===================================

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

        (
          now - timestamp
        ) < expirationWindow

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



  // ===================================
  // ENFORCE MAX TRACKED KEYS
  // ===================================

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
      typeof firstKey ===
      "undefined"
    ){

      break;

    }

    securityState
    .requestTracker
    .delete(
      firstKey
    );

  }

  return true;

}



// =====================================
// TRACK SECURITY REQUEST
// =====================================

function trackSecurityRequest(
  key
){

  if(
    !validateRequestTracker()
  ){

    return false;

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



  // ===================================
  // HARD LIMIT
  // ===================================

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

  if(
    !validateRequestTracker()
  ){

    return false;

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

  const normalizedType =
  normalizeSecurityKey(
    type
  );

  if(!normalizedType){

    return false;

  }

  securityState
  .suspiciousActivities++;

  logSecurityEvent(

    "SUSPICIOUS ACTIVITY",

    {

      type:
      normalizedType,

      ...normalizeSecurityMetadata(
        metadata
      )

    }

  );

  return true;

}



// =====================================
// GET RATE LIMIT STATUS
// =====================================

function getRateLimitStatus(
  key
){

  if(
    !validateRequestTracker()
  ){

    return null;

  }

  const normalizedKey =
  normalizeSecurityKey(
    key
  );

  if(!normalizedKey){

    return null;

  }

  const requests =

    securityState
    .requestTracker
    .get(
      normalizedKey
    )

    ||

    [];

  const remaining =

    Math.max(

      0,

      SECURITY_CONFIG
      .MAX_RATE_LIMIT -

      requests.length

    );

  return Object.freeze({

    key:
    normalizedKey,

    requests:
    requests.length,

    remaining,

    limit:

      SECURITY_CONFIG
      .MAX_RATE_LIMIT,

    blocked:
    remaining <= 0

  });

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

      validateRequestTracker()

      ?

      securityState
      .requestTracker
      .size

      :

      0

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSecurityMonitorDiagnostics(){

  return Object.freeze({

    initialized:
    true,

    rateLimiting:

      SECURITY_CONFIG
      .ENABLE_RATE_LIMITING,

    trackedKeys:

      validateRequestTracker()

      ?

      securityState
      .requestTracker
      .size

      :

      0,

    metrics:
    getSecurityMetrics()

  });

}



// =====================================
// RESET SECURITY METRICS
// =====================================

function resetSecurityMetrics(){

  securityState
  .blockedRequests =
  0;

  securityState
  .blockedURLs =
  0;

  securityState
  .blockedPrompts =
  0;

  securityState
  .suspiciousActivities =
  0;

  securityState
  .sanitizedPayloads =
  0;

  securityState
  .rateLimitHits =
  0;

  if(
    validateRequestTracker()
  ){

    securityState
    .requestTracker
    .clear();

  }

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initializeSecurityMonitor(){

  cleanupRateLimitTracker();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SecurityMonitor =
Object.freeze({

  initialize:
  initializeSecurityMonitor,

  cleanupTracker:
  cleanupRateLimitTracker,

  trackRequest:
  trackSecurityRequest,

  checkRateLimit,

  getRateLimitStatus,

  trackSuspicious:
  trackSuspiciousActivity,

  metrics:
  getSecurityMetrics,

  diagnostics:
  getSecurityMonitorDiagnostics,

  reset:
  resetSecurityMetrics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "SecurityMonitor",

    {

      value:
      SecurityMonitor,

      writable:
      false,

      configurable:
      false

    }

  );

}



// =====================================
// EXPORTS
// =====================================

export {

  SecurityMonitor,

  initializeSecurityMonitor,

  cleanupRateLimitTracker,

  trackSecurityRequest,

  checkRateLimit,

  getRateLimitStatus,

  trackSuspiciousActivity,

  getSecurityMetrics,

  getSecurityMonitorDiagnostics,

  resetSecurityMetrics

};
