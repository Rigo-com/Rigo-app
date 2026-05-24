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
// HELPERS
// =====================================

function updateMessageRuntimeState(
  updates = {}
){

  Object.assign(

    messageRuntimeState,

    updates

  );

  return true;

}



function normalizeMessageRuntimeError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
  );

}



// =====================================
// MESSAGE TIMEOUT
// =====================================

function createMessageTimeout(){

  const timeoutDuration =

    ConfigRuntime
    ?.getValue?.(
      "CHAT.MESSAGE_TIMEOUT"
    )

    ??

    APP_CONFIG?.CHAT
    ?.MESSAGE_TIMEOUT

    ??

    30000;

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

  return freezeEnvironmentObject({

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

      ? normalizeMessageRuntimeError(
          messageRuntimeState
          .lastError
        )

      : null

  });

}



// =====================================
// TRACK SUCCESS
// =====================================

async function handleSuccessfulMessage(){

  updateMessageRuntimeState({

    completedAt:
    Date.now()

  });

  updateMessageRuntimeState({

    lastDuration:

      messageRuntimeState
      .completedAt -

      messageRuntimeState
      .startedAt,

    sentMessages:

      messageRuntimeState
      .sentMessages + 1

  });

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



// =====================================
// TRACK FAILURE
// =====================================

async function handleFailedMessage(
  error
){

  updateMessageRuntimeState({

    failedMessages:

      messageRuntimeState
      .failedMessages + 1,

    lastError:error

  });

  appState.lastError =
  error;

  safeLogError(
    normalizeMessageRuntimeError(
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
        normalizeMessageRuntimeError(
          error
        )

      }

    );

  }

  await emitAppEvent(

    "chat.message.failed",

    {

      error:
      normalizeMessageRuntimeError(
        error
      )

    }

  );

  return false;

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

  updateMessageRuntimeState({

    sending:true,

    startedAt:
    Date.now(),

    lastError:null

  });

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

    await handleSuccessfulMessage();

    return true;

  }

  catch(error){

    return handleFailedMessage(
      error
    );

  }

  finally{

    timeoutController
    .clear();

    updateMessageRuntimeState({

      sending:false

    });

    updateSafeMessageUIState(
      false
    );

  }

}



// =====================================
// PUBLIC API
// =====================================

const MessageRuntime =
Object.freeze({

  send:
  handleSendMessage,

  snapshot:
  createMessageRuntimeSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MessageRuntime =
  MessageRuntime;

}
