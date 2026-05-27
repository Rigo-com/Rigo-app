// =====================================
// RIGO AI
// COMMUNICATION CORE
// =====================================



// =====================================
// COMMUNICATION CONFIG
// =====================================

const COMMUNICATION_RUNTIME_CONFIG =
Object.freeze({

  ENABLE_EVENTS:true,

  ENABLE_MESSAGE_QUEUE:true,

  ENABLE_STREAMING:true,

  ENABLE_TYPING_INDICATOR:true,

  ENABLE_RETRY_SYSTEM:true,

  ENABLE_RECOVERY:true,

  ENABLE_HEALTH_MONITORING:true,

  ENABLE_CONVERSATION_SYNC:true,

  ENABLE_MESSAGE_VALIDATION:true,

  ENABLE_RUNTIME_BRIDGE:true,

  ENABLE_MEMORY_SYNC:true,

  ENABLE_PERSISTENCE:true,

  ENABLE_ABORT_CONTROLLERS:true,

  ENABLE_TIMEOUTS:true,

  MAX_QUEUE_SIZE:
  1000,

  MAX_CONVERSATIONS:
  500,

  MAX_HASH_CACHE:
  5000,

  MAX_RETRIES:
  3,

  RETRY_DELAY:
  1000,

  MESSAGE_TIMEOUT:
  30000,

  HEALTH_INTERVAL:
  30000,

  HASH_TTL:
  600000,

  CONVERSATION_TTL:
  86400000,

  DEBUG:
  false

});



// =====================================
// COMMUNICATION STATES
// =====================================

const COMMUNICATION_RUNTIME_STATES =
Object.freeze({

  IDLE:"idle",

  INITIALIZING:"initializing",

  READY:"ready",

  STREAMING:"streaming",

  PROCESSING:"processing",

  RECOVERING:"recovering",

  FAILED:"failed",

  DESTROYED:"destroyed"

});



// =====================================
// COMMUNICATION EVENTS
// =====================================

const COMMUNICATION_RUNTIME_EVENTS =
Object.freeze({

  INITIALIZED:
  "communication.initialized",

  MESSAGE_SENT:
  "communication.message.sent",

  MESSAGE_RECEIVED:
  "communication.message.received",

  MESSAGE_FAILED:
  "communication.message.failed",

  MESSAGE_QUEUED:
  "communication.message.queued",

  MESSAGE_ABORTED:
  "communication.message.aborted",

  MESSAGE_TIMEOUT:
  "communication.message.timeout",

  DUPLICATE_PREVENTED:
  "communication.duplicate.prevented",

  STREAM_STARTED:
  "communication.stream.started",

  STREAM_COMPLETED:
  "communication.stream.completed",

  STREAM_ABORTED:
  "communication.stream.aborted",

  TYPING_STARTED:
  "communication.typing.started",

  TYPING_STOPPED:
  "communication.typing.stopped",

  RECOVERY_STARTED:
  "communication.recovery.started",

  RECOVERY_COMPLETED:
  "communication.recovery.completed"

});



// =====================================
// COMMUNICATION STATE
// =====================================

const communicationRuntimeState =
Object.seal({

  initialized:false,

  destroyed:false,

  processing:false,

  streaming:false,

  recovering:false,

  typing:false,

  state:
  COMMUNICATION_RUNTIME_STATES
  .IDLE,

  messageQueue:[],

  activeStreams:
  new Map(),

  conversations:
  new Map(),

  activeRequests:
  new Map(),

  abortControllers:
  new Map(),

  processedHashes:
  new Map(),

  runtimeRecoveryUnsubscribe:
  null,

  healthTimer:null,

  lastMessageAt:null,

  diagnostics:
  Object.seal({

    initialized:0,

    sent:0,

    received:0,

    failed:0,

    queued:0,

    streams:0,

    retries:0,

    recoveries:0,

    timeouts:0,

    aborted:0,

    duplicatesPrevented:0,

    recoveredQueues:0

  })

});



// =====================================
// HELPERS
// =====================================

function setCommunicationState(
  state
){

  communicationRuntimeState
  .state =
  state;

  return true;

}



function createCommunicationId(
  prefix = "comm"
){

  return (

    String(prefix) +

    "_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function waitCommunication(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function createMessageHash(
  value = ""
){

  return String(value)
  .trim()
  .toLowerCase();

}



function isDuplicateMessage(
  hash
){

  if(
    !hash
  ){

    return false;

  }

  const existing =

    communicationRuntimeState
    .processedHashes
    .get(hash);

  if(
    !existing
  ){

    return false;

  }

  const expired =

    Date.now() - existing >

    COMMUNICATION_RUNTIME_CONFIG
    .HASH_TTL;

  if(expired){

    communicationRuntimeState
    .processedHashes
    .delete(hash);

    return false;

  }

  return true;

}



function registerProcessedMessage(
  hash
){

  if(
    !hash
  ){

    return false;

  }

  communicationRuntimeState
  .processedHashes
  .set(

    hash,
    Date.now()

  );

  if(

    communicationRuntimeState
    .processedHashes
    .size >

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_HASH_CACHE

  ){

    const firstKey =

      communicationRuntimeState
      .processedHashes
      .keys()
      .next()
      .value;

    communicationRuntimeState
    .processedHashes
    .delete(
      firstKey
    );

  }

  return true;

}



// =====================================
// EVENT EMITTER
// =====================================

async function emitCommunicationEvent(
  eventName,
  payload = {}
){

  if(
    !COMMUNICATION_RUNTIME_CONFIG
    .ENABLE_EVENTS
  ){

    return false;

  }

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
        "communication-runtime",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// HEALTH
// =====================================

function getCommunicationHealth(){

  return Object.freeze({

    initialized:
    communicationRuntimeState
    .initialized,

    state:
    communicationRuntimeState
    .state,

    processing:
    communicationRuntimeState
    .processing,

    streaming:
    communicationRuntimeState
    .streaming,

    queueSize:

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

    lastMessageAt:
    communicationRuntimeState
    .lastMessageAt,

    diagnostics:{

      ...communicationRuntimeState
      .diagnostics

    }

  });

}



// =====================================
// RESET
// =====================================

async function resetCommunicationRuntime(){

  communicationRuntimeState
  .messageQueue = [];

  communicationRuntimeState
  .activeStreams
  .clear();

  communicationRuntimeState
  .conversations
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
  .recovering =
  false;

  communicationRuntimeState
  .typing =
  false;

  communicationRuntimeState
  .lastMessageAt =
  null;

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

  setCommunicationState(
    COMMUNICATION_RUNTIME_STATES
    .INITIALIZING
  );

  communicationRuntimeState
  .initialized =
  true;

  communicationRuntimeState
  .destroyed =
  false;

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



// =====================================
// PUBLIC API
// =====================================

const CommunicationRuntime =
Object.freeze({

  initialize:
  initializeCommunicationRuntime,

  reset:
  resetCommunicationRuntime,

  health:
  getCommunicationHealth

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.CommunicationRuntime =
  CommunicationRuntime;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis
  .CommunicationRuntime =
  CommunicationRuntime;

}
