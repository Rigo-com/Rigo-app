// =====================================
// RIGO AI
// APP EVENTS
// =====================================



// =====================================
// EMIT APP EVENT
// =====================================

async function emitAppEvent(
  eventName,
  payload = {}
){

  if(

    typeof emitSystemEvent !==
    "function"

  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:
        "app",

        phase:
        appState.phase,

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    if(
      typeof console !==
      "undefined"
    ){

      console.error(
        error
      );

    }

    return false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const AppEvents =
Object.freeze({

  emit:
  emitAppEvent

});
