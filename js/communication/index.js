// =====================================
// RIGO AI
// COMMUNICATION INDEX
// =====================================



// =====================================
// DEPENDENCY CHECK
// =====================================

const COMMUNICATION_REQUIRED_MODULES =

Object.freeze([

  "COMMUNICATION_RUNTIME_CONFIG",
  "COMMUNICATION_RUNTIME_STATES",
  "COMMUNICATION_RUNTIME_EVENTS",
  "communicationRuntimeState",

  "safeCommunicationClone",
  "createMessageHash",
  "cleanupProcessedHashes",
  "trimConversationHistory",
  "emitCommunicationEvent",
  "freezeCommunicationObject",
  "validateCommunicationMessage",

  "persistCommunicationState",
  "restoreCommunicationState",
  "clearCommunicationStorage",

  "enqueueCommunicationMessage",
  "processCommunicationQueue",

  "startCommunicationStream",
  "stopCommunicationStream",

  "startTypingIndicator",
  "stopTypingIndicator",

  "abortCommunicationMessage",
  "abortAllCommunicationMessages",

  "monitorCommunicationHealth",
  "recoverCommunicationRuntime"

]);



// =====================================
// CHECK MODULES
// =====================================

function validateCommunicationModules(){

  const missingModules =

    COMMUNICATION_REQUIRED_MODULES
    .filter((moduleName) => {

      return (
        typeof globalThis[
          moduleName
        ] ===
        "undefined"
      );

    });

  if(
    missingModules.length > 0
  ){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(

        "COMMUNICATION_MODULES_MISSING:",

        missingModules

      );

    }

    return false;

  }

  return true;

}



// =====================================
// STATUS
// =====================================

function getCommunicationRuntimeStatus(){

  return freezeCommunicationObject({

    initialized:

      communicationRuntimeState
      .initialized,

    destroyed:

      communicationRuntimeState
      .destroyed,

    processing:

      communicationRuntimeState
      .processing,

    streaming:

      communicationRuntimeState
      .streaming,

    typing:

      communicationRuntimeState
      .typing,

    recovering:

      communicationRuntimeState
      .recovering,

    state:

      communicationRuntimeState
      .state,

    queuedMessages:

      communicationRuntimeState
      .messageQueue
      .length,

    activeStreams:

      communicationRuntimeState
      .activeStreams
      .size,

    activeRequests:

      communicationRuntimeState
      .activeRequests
      .size,

    conversations:

      communicationRuntimeState
      .conversations
      .size,

    lastMessageAt:

      communicationRuntimeState
      .lastMessageAt,

    diagnostics:

      safeCommunicationClone(

        communicationRuntimeState
        .diagnostics

      )

  });

}



// =====================================
// RESET
// =====================================

async function resetCommunicationRuntime(){

  await stopTypingIndicator();

  abortAllCommunicationMessages();

  communicationRuntimeState
  .messageQueue = [];

  communicationRuntimeState
  .activeStreams
  .clear();

  communicationRuntimeState
  .activeRequests
  .clear();

  communicationRuntimeState
  .abortControllers
  .clear();

  communicationRuntimeState
  .processedHashes
  .clear();

  communicationRuntimeState
  .conversations
  .clear();

  clearCommunicationStorage();

  if(

    communicationRuntimeState
    .runtimeRecoveryUnsubscribe

  ){

    try{

      communicationRuntimeState
      .runtimeRecoveryUnsubscribe();

    }

    catch(error){

    }

    communicationRuntimeState
    .runtimeRecoveryUnsubscribe =
    null;

  }

  if(
    communicationRuntimeState
    .healthTimer
  ){

    clearInterval(

      communicationRuntimeState
      .healthTimer

    );

    communicationRuntimeState
    .healthTimer =
    null;

  }

  communicationRuntimeState
  .initialized =
  false;

  communicationRuntimeState
  .destroyed =
  false;

  communicationRuntimeState
  .processing =
  false;

  communicationRuntimeState
  .streaming =
  false;

  communicationRuntimeState
  .typing =
  false;

  communicationRuntimeState
  .recovering =
  false;

  communicationRuntimeState
  .lastMessageAt =
  null;

  communicationRuntimeState
  .diagnostics
  .initialized = 0;

  communicationRuntimeState
  .diagnostics
  .sent = 0;

  communicationRuntimeState
  .diagnostics
  .received = 0;

  communicationRuntimeState
  .diagnostics
  .failed = 0;

  communicationRuntimeState
  .diagnostics
  .queued = 0;

  communicationRuntimeState
  .diagnostics
  .streams = 0;

  communicationRuntimeState
  .diagnostics
  .retries = 0;

  communicationRuntimeState
  .diagnostics
  .recoveries = 0;

  communicationRuntimeState
  .diagnostics
  .timeouts = 0;

  communicationRuntimeState
  .diagnostics
  .aborted = 0;

  communicationRuntimeState
  .diagnostics
  .duplicatesPrevented = 0;

  communicationRuntimeState
  .diagnostics
  .recoveredQueues = 0;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .IDLE

  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeCommunicationRuntime(){

  if(
    communicationRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    !validateCommunicationModules()
  ){

    return false;

  }

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .INITIALIZING

  );

  try{

    restoreCommunicationState();

    if(

      COMMUNICATION_RUNTIME_CONFIG
      .ENABLE_HEALTH_MONITORING

    ){

      if(
        !communicationRuntimeState
        .healthTimer
      ){

        communicationRuntimeState
        .healthTimer =

        setInterval(() => {

          monitorCommunicationHealth();

        },

        COMMUNICATION_RUNTIME_CONFIG
        .HEALTH_INTERVAL);

      }

    }

    communicationRuntimeState
    .initialized =
    true;

    communicationRuntimeState
    .diagnostics
    .initialized++;

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .INITIALIZED

    );

    return true;

  }

  catch(error){

    if(
      COMMUNICATION_RUNTIME_CONFIG
      .DEBUG
    ){

      console.error(
        "COMMUNICATION_INITIALIZE_ERROR:",
        error
      );

    }

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .FAILED

    );

    return false;

  }

}



// =====================================
// DESTROY
// =====================================

async function destroyCommunicationRuntime(){

  if(
    communicationRuntimeState
    .healthTimer
  ){

    clearInterval(

      communicationRuntimeState
      .healthTimer

    );

    communicationRuntimeState
    .healthTimer =
    null;

  }

  await resetCommunicationRuntime();

  communicationRuntimeState
  .destroyed =
  true;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .DESTROYED

  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationRuntime =
Object.freeze({

  initialize:
  initializeCommunicationRuntime,

  send:
  sendCommunicationMessage,

  abort:
  abortCommunicationMessage,

  abortAll:
  abortAllCommunicationMessages,

  recover:
  recoverCommunicationRuntime,

  status:
  getCommunicationRuntimeStatus,

  reset:
  resetCommunicationRuntime,

  destroy:
  destroyCommunicationRuntime

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.CommunicationRuntime =
  CommunicationRuntime;

}
