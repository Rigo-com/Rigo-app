function cleanupRateLimitTracker(){

  const now =
  Date.now();

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

    securityState
    .requestTracker
    .delete(
      firstKey
    );

  }

}
