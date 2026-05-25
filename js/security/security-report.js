// =====================================
// RIGO AI
// SECURITY REPORT
// ENTERPRISE SECURITY REPORTING LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SAFE SECURITY REPORT VALUE
// =====================================

function getSafeSecurityReportValue(
  callback,
  fallback = null
){

  try{

    if(
      typeof callback !==
      "function"
    ){

      return fallback;

    }

    return callback();

  }

  catch(error){

    try{

      logSecurityEvent(

        "SECURITY REPORT SECTION FAILED",

        {

          error:
          String(error)

        }

      );

    }

    catch(logError){}

    return fallback;

  }

}



// =====================================
// SAFE SECURITY NUMBER
// =====================================

function getSafeSecurityNumber(
  value
){

  const normalized =
  Number(value);

  return Number.isFinite(
    normalized
  )

  ?

  normalized

  :

  0;

}



// =====================================
// SAFE SECURITY SIZE
// =====================================

function getSafeSecuritySize(
  value
){

  try{

    if(
      value instanceof Map
    ){

      return value.size;

    }

    if(
      value instanceof Set
    ){

      return value.size;

    }

  }

  catch(error){}

  return 0;

}



// =====================================
// SECURITY HEALTH
// =====================================

function getSecurityHealthStatus(
  report
){

  try{

    const suspicious =
    getSafeSecurityNumber(

      report
      ?.suspiciousActivities

    );

    const blocked =
    getSafeSecurityNumber(

      report
      ?.blockedRequests

    );

    const failedSandbox =

      getSafeSecurityNumber(

        report
        ?.sandbox
        ?.failedExecutions

      );

    if(

      suspicious > 100

      ||

      blocked > 100

      ||

      failedSandbox > 25

    ){

      return "critical";

    }

    if(

      suspicious > 25

      ||

      blocked > 25

      ||

      failedSandbox > 10

    ){

      return "warning";

    }

    return "healthy";

  }

  catch(error){

    return "unknown";

  }

}



// =====================================
// GENERATE SECURITY REPORT
// =====================================

function generateSecurityReport(){

  const now =
  Date.now();

  const createdAt =

    Number.isFinite(
      securityState
      ?.createdAt
    )

    ?

    securityState
    .createdAt

    :

    now;

  const report = {

    generatedAt:
    now,

    initialized:
    Boolean(
      securityState
      ?.initialized
    ),

    uptime:
    Math.max(
      0,
      now - createdAt
    ),



    // =================================
    // CORE METRICS
    // =================================

    blockedRequests:
    getSafeSecurityNumber(

      securityState
      ?.blockedRequests

    ),

    suspiciousActivities:
    getSafeSecurityNumber(

      securityState
      ?.suspiciousActivities

    ),

    sanitizedPayloads:
    getSafeSecurityNumber(

      securityState
      ?.sanitizedPayloads

    ),

    blockedURLs:
    getSafeSecurityNumber(

      securityState
      ?.blockedURLs

    ),

    blockedPrompts:
    getSafeSecurityNumber(

      securityState
      ?.blockedPrompts

    ),

    rateLimitHits:
    getSafeSecurityNumber(

      securityState
      ?.rateLimitHits

    ),



    // =================================
    // TRACKING
    // =================================

    activeRateLimitKeys:
    getSafeSecuritySize(

      securityState
      ?.requestTracker

    ),

    trustedOrigins:
    getSafeSecuritySize(

      securityState
      ?.trustedOrigins

    ),

    blockedPatterns:
    getSafeSecuritySize(

      securityState
      ?.blockedPatterns

    ),



    // =================================
    // RUNTIME
    // =================================

    runtime:
    getSafeSecurityReportValue(() => {

      if(

        typeof SecurityRuntime ===
        "undefined"

        ||

        typeof SecurityRuntime
        .diagnostics !==
        "function"

      ){

        return null;

      }

      return SecurityRuntime
      .diagnostics();

    }),



    // =================================
    // MONITOR
    // =================================

    monitor:
    getSafeSecurityReportValue(() => {

      if(

        typeof SecurityMonitor ===
        "undefined"

        ||

        typeof SecurityMonitor
        .metrics !==
        "function"

      ){

        return null;

      }

      return SecurityMonitor
      .metrics();

    }),



    // =================================
    // SANDBOX
    // =================================

    sandbox:
    getSafeSecurityReportValue(() => {

      if(

        typeof SecuritySandbox ===
        "undefined"

        ||

        typeof SecuritySandbox
        .diagnostics !==
        "function"

      ){

        return null;

      }

      return SecuritySandbox
      .diagnostics();

    }),



    // =================================
    // POLICY
    // =================================

    policy:
    getSafeSecurityReportValue(() => {

      if(

        typeof SecurityPolicy ===
        "undefined"

        ||

        typeof SecurityPolicy
        .diagnostics !==
        "function"

      ){

        return null;

      }

      return SecurityPolicy
      .diagnostics();

    })

  };



  // ===================================
  // HEALTH STATUS
  // ===================================

  report.health =
  getSecurityHealthStatus(
    report
  );

  return deepFreezeSecurity(
    report
  );

}



// =====================================
// EXPORT SECURITY REPORT
// =====================================

function exportSecurityReport(){

  try{

    const report =
    generateSecurityReport();

    if(
      typeof safeJSONStringify ===
      "function"
    ){

      return safeJSONStringify(
        report
      );

    }

    return JSON.stringify(

      report,

      null,

      2

    );

  }

  catch(error){

    logSecurityEvent(

      "SECURITY REPORT EXPORT FAILED",

      {

        error:
        String(error)

      }

    );

    return null;

  }

}



// =====================================
// PRINT SECURITY REPORT
// =====================================

function printSecurityReport(){

  try{

    const report =
    generateSecurityReport();

    if(

      typeof console !==
      "undefined"

      &&

      typeof console.table ===
      "function"

    ){

      console.table(
        report
      );

    }

    else if(
      typeof console !==
      "undefined"
    ){

      console.log(
        report
      );

    }

    return true;

  }

  catch(error){

    logSecurityEvent(

      "SECURITY REPORT PRINT FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const SecurityReport =
Object.freeze({

  generate:
  generateSecurityReport,

  export:
  exportSecurityReport,

  print:
  printSecurityReport

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "SecurityReport",

    {

      value:
      SecurityReport,

      writable:
      false,

      configurable:
      false

    }

  );

}
