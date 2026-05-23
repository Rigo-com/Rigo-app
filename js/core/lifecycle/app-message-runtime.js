// =====================================
// RIGO AI
// APP MESSAGE RUNTIME
// =====================================



// =====================================
// STATE
// =====================================

const messageRuntimeState =
Object.seal({

  sending:false,

  startedAt:null,

  completedAt:null,

  lastDuration:null,

  lastError:null,

  sentMessages:0,

  failedMessages:0

});



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

      },

      timeoutDuration);

    }
  );

  return {

    duration:
    timeoutDuration,

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
// SAFE UI STATE
// =====================================

function updateSafeMessageUIState(
  loading
){

  try{

    if(
      typeof updateMessageUIState ===
      "function"
    ){

      updateMessageUIState(
        loading
      );

    }

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// MESSAGE SNAPSHOT
// =====================================

function createMessageRuntimeSnapshot(){

  return Object.freeze({

    sending:
    messageRuntimeState
    .sending,

    startedAt:
    messageRuntimeState
    .startedAt,

    completedAt:
    messageRuntimeState
    .completedAt,

    lastDuration:
    messageRuntimeState
    .lastDuration,

    sentMessages:
    messageRuntimeState
    .sentMessages,

    failedMessages:
    messageRuntimeState
    .failedMessages,

    lastError:

      messageRuntimeState
      .lastError

      ? String(
          messageRuntimeState
          .lastError
        )

      : null

  });

}



// =====================================
// HANDLE SEND MESSAGE
// =====================================

async function handleSendMessage(){

  if(
    messageRuntimeState
    .sending
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

  messageRuntimeState
  .sending =
  true;

  messageRuntimeState
  .startedAt =
  Date.now();

  messageRuntimeState
  .lastError =
  null;

  updateSafeMessageUIState(
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

    messageRuntimeState
    .completedAt =
    Date.now();

    messageRuntimeState
    .lastDuration =

      messageRuntimeState
      .completedAt -

      messageRuntimeState
      .startedAt;

    messageRuntimeState
    .sentMessages++;

    if(
      typeof trackPerformanceMetric ===
      "function"
    ){

      trackPerformanceMetric(

        "message.send",

        messageRuntimeState
        .lastDuration

      );

    }

    await emitAppEvent(
      "chat.message.sent"
    );

    return true;

  }

  catch(error){

    messageRuntimeState
    .failedMessages++;

    messageRuntimeState
    .lastError =
    error;

    appState.lastError =
    error;

    safeLogError(
      getSafeErrorMessage(
        error
      )
    );

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(

        "MESSAGE SEND FAILED",

        {

          error:
          getSafeErrorMessage(
            error
          )

        }

      );

    }

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

    messageRuntimeState
    .sending =
    false;

    updateSafeMessageUIState(
      false
    );

  }

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.handleSendMessage =
  handleSendMessage;

  window.createMessageRuntimeSnapshot =
  createMessageRuntimeSnapshot;

}
