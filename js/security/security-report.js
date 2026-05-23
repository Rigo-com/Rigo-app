// =====================================
// RIGO AI
// SECURITY REPORT
// ENTERPRISE SECURITY REPORTING LAYER
// =====================================



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

  return deepFreezeSecurity({

    generatedAt:
    now,

    initialized:
    Boolean(
      securityState
      .initialized
    ),

    uptime:
    now - createdAt,



    // ================================
    // CORE METRICS
    // ================================

    blockedRequests:
    securityState
    .blockedRequests,

    suspiciousActivities:
    securityState
    .suspiciousActivities,

    sanitizedPayloads:
    securityState
    .sanitizedPayloads,

    blockedURLs:
    securityState
    .blockedURLs,

    blockedPrompts:
    securityState
    .blockedPrompts,

    rateLimitHits:
    securityState
    .rateLimitHits,



    // ================================
    // TRACKING
    // ================================

    activeRateLimitKeys:

      securityState
      .requestTracker
      .size,

    trustedOrigins:

      securityState
      .trustedOrigins
      .size,

    blockedPatterns:

      securityState
      .blockedPatterns
      .size,



    // ================================
    // RUNTIME
    // ================================

    runtime:

      typeof SecurityRuntime !==
      "undefined"

      &&

      typeof SecurityRuntime
      .diagnostics ===
      "function"

      ?

      SecurityRuntime
      .diagnostics()

      :

      null,



    // ================================
    // MONITOR
    // ================================

    monitor:

      typeof SecurityMonitor !==
      "undefined"

      &&

      typeof SecurityMonitor
      .metrics ===
      "function"

      ?

      SecurityMonitor
      .metrics()

      :

      null,



    // ================================
    // SANDBOX
    // ================================

    sandbox:

      typeof SecuritySandbox !==
      "undefined"

      &&

      typeof SecuritySandbox
      .diagnostics ===
      "function"

      ?

      SecuritySandbox
      .diagnostics()

      :

      null,



    // ================================
    // POLICY
    // ================================

    policy:

      typeof SecurityPolicy !==
      "undefined"

      &&

      typeof SecurityPolicy
      .diagnostics ===
      "function"

      ?

      SecurityPolicy
      .diagnostics()

      :

      null

  });

}



// =====================================
// EXPORT SECURITY REPORT
// =====================================

function exportSecurityReport(){

  try{

    return safeJSONStringify(

      generateSecurityReport()

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

  else{

    console.log(
      report
    );

  }

  return true;

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
