// =====================================
// RIGO AI
// APP MESSAGE RUNTIME
// =====================================



// =====================================
// MESSAGE TIMEOUT
// =====================================

function createMessageTimeout(){

  const timeoutDuration =

    APP_CONFIG?.CHAT
    ?.MESSAGE_TIMEOUT

    ?? 30000;

  let timeoutId =
  null;

  const promise =
  new Promise(
    (_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "MESSAGE TIMEOUT"
          )

        );

      },timeoutDuration);

    }
  );

  return {

    promise,

    clear(){

      if(timeoutId){

        clearTimeout(
          timeoutId
        );

      }

    }

  };

}



// =====================================
// HANDLE SEND MESSAGE
// =====================================

async function handleSendMessage(){

  if(
    sendingMessage
  ){

    return false;

  }

  if(
    typeof sendMessage !==
    "function"
  ){

    safeLogError(
      "sendMessage unavailable"
    );

    return false;

  }

  sendingMessage =
  true;

  updateMessageUIState(
    true
  );

  const timeoutController =
  createMessageTimeout();

  try{

    await Promise.race([

      sendMessage(),

      timeoutController
      .promise

    ]);

    await emitAppEvent(
      "chat.message.sent"
    );

    return true;

  }

  catch(error){

    appState.lastError =
    error;

    safeLogError(
      getSafeErrorMessage(
        error
      )
    );

    await emitAppEvent(

      "chat.message.failed",

      {

        error:
        getSafeErrorMessage(
          error
        )

      }

    );

    return false;

  }

  finally{

    timeoutController
    .clear();

    sendingMessage =
    false;

    updateMessageUIState(
      false
    );

  }

}
