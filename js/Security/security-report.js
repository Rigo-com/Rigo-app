function generateSecurityReport(){

  return deepFreezeSecurity({

    initialized:
    securityState
    .initialized,

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
    .rateLimitHits

  });

}
