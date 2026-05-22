// =====================================
// SYSTEM EVENTS
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

        source:"app",

        phase:
        appState.phase,

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}
