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
