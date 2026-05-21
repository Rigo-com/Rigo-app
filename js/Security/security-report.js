// =====================================
// SECURITY REPORT
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

    activeRateLimitKeys:

      securityState
      .requestTracker
      .size,

    trustedOrigins:

      securityState
      .trustedOrigins
      .size

  });

}
