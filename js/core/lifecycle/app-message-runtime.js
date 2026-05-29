// =====================================
// RIGO AI
// APP MESSAGE RUNTIME
// =====================================



// =====================================
// IMMUTABLE
// =====================================

function freezeMessageRuntime(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeMessageRuntime(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// DEPENDENCIES
// =====================================

function getMessageRuntimeDependency(
  dependencyName
){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return window[
      dependencyName
    ] || null;

  }

  catch(error){

    return null;

  }

}



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

  const formatter =
  getMessageRuntimeDependency(
    "getSafeErrorMessage"
  );

  if(
    typeof formatter ===
    "function"
  ){

    return formatter(
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

  const configRuntime =
  getMessageRuntimeDependency(
    "ConfigRuntime"
  );

  const timeoutDuration =

    configRuntime
    ?.getValue?.(
      "CHAT.MESSAGE_TIMEOUT"
    )

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

    const updater =
    getMessageRuntimeDependency(
      "updateMessageUIState"
    );

    if(
      typeof updater ===
      "function"
    ){

      updater(
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

  return freezeMessageRuntime({

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

  const performanceTracker =
  getMessageRuntimeDependency(
    "trackPerformanceMetric"
  );

  if(
    typeof performanceTracker ===
    "function"
  ){

    await performanceTracker(

      "message.send",

      messageRuntimeState
      .lastDuration

    );

  }

  const appEventEmitter =
  getMessageRuntimeDependency(
    "emitAppEvent"
  );

  if(
    typeof appEventEmitter ===
    "function"
  ){

    await appEventEmitter(
      "chat.message.sent"
    );

  }

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

  if(
    typeof appState ===
    "object" &&
    appState
  ){

    appState.lastError =
    error;

  }

  const logger =
  getMessageRuntimeDependency(
    "safeLogError"
  );

  if(
    typeof logger ===
    "function"
  ){

    logger(

      normalizeMessageRuntimeError(
        error
      )

    );

  }

  const diagnosticsLogger =
  getMessageRuntimeDependency(
    "logDiagnosticError"
  );

  if(
    typeof diagnosticsLogger ===
    "function"
  ){

    await diagnosticsLogger(

      "MESSAGE SEND FAILED",

      {

        error:
        normalizeMessageRuntimeError(
          error
        )

      }

    );

  }

  const appEventEmitter =
  getMessageRuntimeDependency(
    "emitAppEvent"
  );

  if(
    typeof appEventEmitter ===
    "function"
  ){

    await appEventEmitter(

      "chat.message.failed",

      {

        error:
        normalizeMessageRuntimeError(
          error
        )

      }

    );

  }

  return false;

}



// =====================================
// HANDLE SEND MESSAGE
// =====================================

async function handleSendMessage(
  ...args
){

  if(
    messageRuntimeState
    .sending
  ){

    return false;

  }

  const sender =
  getMessageRuntimeDependency(
    "sendMessage"
  );

  if(
    typeof sender !==
    "function"
  ){

    const logger =
    getMessageRuntimeDependency(
      "safeLogError"
    );

    if(
      typeof logger ===
      "function"
    ){

      logger(
        "sendMessage unavailable"
      );

    }

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

      sender(
        ...args
      ),

      timeoutController
      .promise

    ]);

    await handleSuccessfulMessage();

    return true;

  }

  catch(error){

    return await handleFailedMessage(
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
  createMessageRuntimeSnapshot,

  diagnostics:
  createMessageRuntimeSnapshot

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "MessageRuntime",

    {

      value:
      MessageRuntime,

      writable:
      false,

      configurable:
      false

    }

  );

}
