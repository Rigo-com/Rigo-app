// =====================================
// RIGO AI
// SETTINGS EVENTS
// ENTERPRISE ULTRA FINAL
// =====================================



async function emitSettingsEvent(
  eventName,
  payload = {}
){

  if(

    typeof emitMemoryEvent !==
    "function"

  ){

    return false;
  }

  try{

    await emitMemoryEvent(

      `settings.${eventName}`,

      payload

    );

    return true;

  }

  catch(error){

    return false;

  }

}
