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
    // BASIC UI START
    // ================================

    if(
      typeof initializeChatSystem ===
      "function"
    ){

      await initializeChatSystem();

    }

    if(
      typeof initializeVoiceRuntime ===
      "function"
    ){

      await initializeVoiceRuntime();

    }



    // ================================
    // REMOVE LOADING SCREEN
    // ================================

    const loadingScreen =

      document.getElementById(
        "loadingScreen"
      );

    if(loadingScreen){

      loadingScreen.style.opacity =
      "0";

      setTimeout(() => {

        loadingScreen.remove();

      },300);

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

    console.log(
      "RIGO APP READY"
    );

    return true;

  }

  catch(error){

    applicationEntrypointState
    .lastError =
    error;

    console.error(
      "BOOTSTRAP ERROR:",
      error
    );

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
// =====================================
// GLOBAL ERROR DEBUG
// =====================================

window.onerror = function(

  message,
  source,
  line,
  column,
  error

){

  const details = [

    "MESSAGE: " + String(message),

    "SOURCE: " + String(source),

    "LINE: " + String(line),

    "COLUMN: " + String(column),

    "ERROR: " + String(error)

  ].join("\n\n");

  alert(details);

  return false;

};



window.onunhandledrejection =
function(event){

  alert(

    "PROMISE ERROR:\n\n" +

    String(
      event?.reason
    )

  );

};
