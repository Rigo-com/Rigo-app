// =====================================
// RIGO AI
// APPLICATION ORCHESTRATOR
// =====================================



// =====================================
// APPLICATION STATE
// =====================================

const applicationState =
Object.seal({

  bootstrapping:false,

  bootstrapped:false,

  startedAt:null,

  completedAt:null,

  lastError:null

});



// =====================================
// APPLICATION SNAPSHOT
// =====================================

function createApplicationSnapshot(){

  return Object.freeze({

    bootstrapping:
    applicationState.bootstrapping,

    bootstrapped:
    applicationState.bootstrapped,

    startedAt:
    applicationState.startedAt,

    completedAt:
    applicationState.completedAt,

    lastError:

      applicationState.lastError

      ?

      String(
        applicationState.lastError
      )

      :

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// STARTUP VALIDATION
// =====================================

async function validateStartupSystems(){

  try{

    const checks = [

      typeof initializeChatSystem ===
      "function",

      typeof initializeVoiceRuntime ===
      "function"

    ];

    return checks.every(Boolean);

  }

  catch(error){

    return false;

  }

}



// =====================================
// STARTUP PHASES
// =====================================

async function startInterfaceSystems(){

  await initializeChatSystem?.();

  await initializeVoiceRuntime?.();

}



async function finalizeApplicationStartup(){

  applicationState.bootstrapped =
  true;

  applicationState.completedAt =
  Date.now();

  return true;

}



// =====================================
// APPLICATION BOOTSTRAP
// =====================================

async function bootstrapApplication(){

  if(

    applicationState.bootstrapping ||

    applicationState.bootstrapped

  ){

    return false;

  }

  applicationState.bootstrapping =
  true;

  applicationState.startedAt =
  Date.now();

  applicationState.lastError =
  null;

  try{

    const validStartup =
    await validateStartupSystems();

    if(!validStartup){

      throw new Error(
        "INVALID STARTUP SYSTEMS"
      );

    }



    // ================================
    // START RUNTIMES
    // ================================

    await startInterfaceSystems();



    // ================================
    // COMPLETE STARTUP
    // ================================

    await finalizeApplicationStartup();

    console.log(
      "RIGO APPLICATION READY"
    );

    return true;

  }

  catch(error){

    applicationState.lastError =
    error;

    safeLogError?.(
      "APPLICATION BOOTSTRAP ERROR",
      error
    );

    return false;

  }

  finally{

    applicationState.bootstrapping =
    false;

  }

}



// =====================================
// APPLICATION START REGISTRATION
// =====================================

let applicationRegistered =
false;

function registerApplicationStartup(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  if(applicationRegistered){

    return true;

  }

  applicationRegistered =
  true;

  const startApplication =
  () => {

    Promise.resolve(
      bootstrapApplication()
    )
    .catch((error) => {

      safeLogError?.(
        "APPLICATION START ERROR",
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

      startApplication,

      {
        once:true
      }

    );

  }

  else{

    startApplication();

  }

  return true;

}



// =====================================
// AUTO START
// =====================================

registerApplicationStartup();



// =====================================
// APPLICATION EXPORTS
// =====================================

const RIGOApplication =
Object.freeze({

  bootstrap:
  bootstrapApplication,

  snapshot:
  createApplicationSnapshot,

  register:
  registerApplicationStartup

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RIGOApplication =
  RIGOApplication;

}
