// =====================================
// RIGO AI
// SECURITY REPORT
// ENTERPRISE SECURITY REPORTING LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SECURITY REPORT STATE
// =====================================

const securityReportState =
Object.seal({

  generatedReports:0,

  exportedReports:0,

  printedReports:0,

  lastGeneratedAt:null

});



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

  securityReportState
  .generatedReports++;

  securityReportState
  .lastGeneratedAt =
  now;

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

        typeof globalThis
        .SecurityRuntime ===
        "undefined"

        ||

        typeof globalThis
        .SecurityRuntime
        .diagnostics !==
        "function"

      ){

        return null;

      }

      return globalThis
      .SecurityRuntime
      .diagnostics();

    }),



    // =================================
    // MONITOR
    // =================================

    monitor:
    getSafeSecurityReportValue(() => {

      if(

        typeof globalThis
        .SecurityMonitor ===
        "undefined"

        ||

        typeof globalThis
        .SecurityMonitor
        .metrics !==
        "function"

      ){

        return null;

      }

      return globalThis
      .SecurityMonitor
      .metrics();

    }),



    // =================================
    // SANDBOX
    // =================================

    sandbox:
    getSafeSecurityReportValue(() => {

      if(

        typeof globalThis
        .SecuritySandbox ===
        "undefined"

        ||

        typeof globalThis
        .SecuritySandbox
        .diagnostics !==
        "function"

      ){

        return null;

      }

      return globalThis
      .SecuritySandbox
      .diagnostics();

    }),



    // =================================
    // POLICY
    // =================================

    policy:
    getSafeSecurityReportValue(() => {

      if(

        typeof globalThis
        .SecurityPolicy ===
        "undefined"

        ||

        typeof globalThis
        .SecurityPolicy
        .diagnostics !==
        "function"

      ){

        return null;

      }

      return globalThis
      .SecurityPolicy
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

  if(

    typeof SecurityFreeze ===
    "object"

    &&

    typeof SecurityFreeze
    .deepFreeze ===
    "function"

  ){

    return SecurityFreeze
    .deepFreeze(
      report
    );

  }

  return Object.freeze(
    report
  );

}



// =====================================
// EXPORT SECURITY REPORT
// =====================================

function exportSecurityReport(){

  try{

    securityReportState
    .exportedReports++;

    const report =
    generateSecurityReport();

    if(

      typeof SecuritySanitize ===
      "object"

      &&

      typeof SecuritySanitize
      .stringify ===
      "function"

    ){

      return SecuritySanitize
      .stringify(
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

    securityReportState
    .printedReports++;

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
// DIAGNOSTICS
// =====================================

function getSecurityReportDiagnostics(){

  return Object.freeze({

    reportReady:true,

    generatedReports:
    securityReportState
    .generatedReports,

    exportedReports:
    securityReportState
    .exportedReports,

    printedReports:
    securityReportState
    .printedReports,

    lastGeneratedAt:
    securityReportState
    .lastGeneratedAt

  });

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
  printSecurityReport,

  diagnostics:
  getSecurityReportDiagnostics

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



// =====================================
// EXPORTS
// =====================================

export {

  SecurityReport,

  generateSecurityReport,

  exportSecurityReport,

  printSecurityReport,

  getSecurityReportDiagnostics

};
