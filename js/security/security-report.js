// =====================================
// RIGO AI
// SECURITY REPORT
// ENTERPRISE SECURITY REPORTING LAYER
// =====================================



// =====================================
// SAFE SECURITY REPORT VALUE
// =====================================

function getSafeSecurityReportValue(
  callback,
  fallback = null
){

  try{

    return callback();

  }

  catch(error){

    logSecurityEvent(

      "SECURITY REPORT SECTION FAILED",

      {
        error:
        String(error)
      }

    );

    return fallback;

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
      securityState.createdAt
    )

    ?

    securityState.createdAt

    :

    now;

  const report = {

    generatedAt:
    now,

    initialized:
    Boolean(
      securityState
      .initialized
    ),

    uptime:
    Math.max(
      0,
      now - createdAt
    ),



    // ================================
    // CORE METRICS
    // ================================

    blockedRequests:
    Number(
      securityState
      .blockedRequests || 0
    ),

    suspiciousActivities:
    Number(
      securityState
      .suspiciousActivities || 0
    ),

    sanitizedPayloads:
    Number(
      securityState
      .sanitizedPayloads || 0
    ),

    blockedURLs:
    Number(
      securityState
      .blockedURLs || 0
    ),

    blockedPrompts:
    Number(
      securityState
      .blockedPrompts || 0
    ),

    rateLimitHits:
    Number(
      securityState
      .rateLimitHits || 0
    ),



    // ================================
    // TRACKING
    // ================================

    activeRateLimitKeys:

      securityState
      .requestTracker instanceof Map

      ?

      securityState
      .requestTracker
      .size

      :

      0,

    trustedOrigins:

      securityState
      .trustedOrigins instanceof Set

      ?

      securityState
      .trustedOrigins
      .size

      :

      0,

    blockedPatterns:

      securityState
      .blockedPatterns instanceof Set

      ?

      securityState
      .blockedPatterns
      .size

      :

      0,



    // ================================
    // RUNTIME
    // ================================

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



    // ================================
    // MONITOR
    // ================================

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



    // ================================
    // SANDBOX
    // ================================

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



    // ================================
    // POLICY
    // ================================

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
