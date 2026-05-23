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

    const appSnapshot =

      typeof AppState !==
      "undefined"

      ?

      AppState.get()

      :

      null;

    await emitSystemEvent(

      eventName,

      {

        source:
        "app",

        phase:

          appSnapshot
          ?.phase ||

          null,

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



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppEvents =
  AppEvents;

  window.emitAppEvent =
  emitAppEvent;

}
