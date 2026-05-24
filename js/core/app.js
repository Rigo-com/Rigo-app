// =====================================
// RIGO AI
// APP ENTRYPOINT
// =====================================



// =====================================
// ENTRYPOINT STATE
// =====================================

const applicationEntrypointState =
Object.seal({

  bootstrapping:false,

  bootstrapped:false,

  startedAt:null,

  completedAt:null,

  lastError:null,

  recoveryAttempted:false

});



// =====================================
// SNAPSHOT
// =====================================

function createEntrypointSnapshot(){

  const error =

    applicationEntrypointState
    .lastError;

  return Object.freeze({

    bootstrapping:

      applicationEntrypointState
      .bootstrapping,

    bootstrapped:

      applicationEntrypointState
      .bootstrapped,

    startedAt:

      applicationEntrypointState
      .startedAt,

    completedAt:

      applicationEntrypointState
      .completedAt,

    lastError:

      error

      ?

      String(error)

      :

      null,

    recoveryAttempted:

      applicationEntrypointState
      .recoveryAttempted,

    timestamp:
    Date.now()

  });

}



// =====================================
// BOOTSTRAP
// =====================================

async function bootstrapApplication(){

  if(

    applicationEntrypointState
    .bootstrapping ||

    applicationEntrypointState
    .bootstrapped

  ){

    return false;

  }

  applicationEntrypointState
  .bootstrapping =
  true;

  applicationEntrypointState
  .startedAt =
  Date.now();

  applicationEntrypointState
  .lastError =
  null;

  try{



    // ================================
    // START APPLICATION
    // ================================

    const started =
    await safelyStartApplication();

    if(!started){

      throw new Error(
        "APPLICATION START FAILED"
      );

    }



    // ================================
    // HEALTH VALIDATION
    // ================================

    const healthy =
    await validateApplicationHealth();

    if(!healthy){

      throw new Error(
        "APPLICATION HEALTH INVALID"
      );

    }



    // ================================
    // COMPLETE
    // ================================

    applicationEntrypointState
    .bootstrapped =
    true;

    applicationEntrypointState
    .completedAt =
    Date.now();

    if(
      typeof logDiagnosticInfo ===
      "function"
    ){

      await logDiagnosticInfo(

        "APPLICATION ENTRYPOINT READY",

        {

          duration:

            applicationEntrypointState
            .completedAt -

            applicationEntrypointState
            .startedAt

        }

      );

    }

    if(
      typeof trackPerformanceMetric ===
      "function"
    ){

      trackPerformanceMetric(

        "application.bootstrap",

        applicationEntrypointState
        .completedAt -

        applicationEntrypointState
        .startedAt

      );

    }

    return true;

  }

  catch(error){

    applicationEntrypointState
    .lastError =
    error;

    if(
      typeof logCriticalError ===
      "function"
    ){

      await logCriticalError(

        "APPLICATION BOOTSTRAP FAILED",

        {

          error:
          String(error)

        }

      );

    }

    try{

      if(

        typeof recoverApplication ===
        "function"

        &&

        !applicationEntrypointState
        .recoveryAttempted

      ){

        applicationEntrypointState
        .recoveryAttempted =
        true;

        await recoverApplication();

      }

    }

    catch(recoveryError){

      safeLogError?.(
        "APPLICATION RECOVERY FAILED:",
        recoveryError
      );

    }

    return false;

  }

  finally{

    applicationEntrypointState
    .bootstrapping =
    false;

  }

}



// =====================================
// DOM READY
// =====================================

let applicationEntrypointRegistered =
false;

function registerApplicationEntrypoint(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  if(
    applicationEntrypointRegistered
  ){

    return true;

  }

  applicationEntrypointRegistered =
  true;

  const start =
  () => {

    Promise.resolve(
      bootstrapApplication()
    )
    .catch((error) => {

      safeLogError?.(
        "ENTRYPOINT START ERROR:",
        error
      );

    });

  };

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(

      "DOMContentLoaded",

      start,

      {
        once:true
      }

    );

  }

  else{

    start();

  }

  return true;

}



// =====================================
// AUTO START
// =====================================

registerApplicationEntrypoint();



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RIGOApplication =
  Object.freeze({

    bootstrap:
    bootstrapApplication,

    snapshot:
    createEntrypointSnapshot,

    register:
    registerApplicationEntrypoint

  });

}
