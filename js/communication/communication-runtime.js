// =====================================
// RIGO AI
// COMMUNICATION RUNTIME
// ENTERPRISE COMMUNICATION LAYER FINAL
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
  30000

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

  diagnostics:{

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

  }

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



function wait(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function safeCommunicationClone(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return null;

  }

}



function createMessageHash(
  message
){

  try{

    return btoa(

      JSON.stringify({

        content:
        message?.content,

        metadata:
        message?.metadata

      })

    );

  }

  catch(error){

    return createCommunicationId(
      "hash"
    );

  }

}



function cleanupProcessedHashes(){

  if(

    communicationRuntimeState
    .processedHashes
    .size <=

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_HASH_CACHE

  ){

    return;
  }

  const keys = [

    ...communicationRuntimeState
    .processedHashes
    .keys()

  ];

  const overflow =

    keys.length -

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_HASH_CACHE;

  for(
    let index = 0;
    index < overflow;
    index++
  ){

    communicationRuntimeState
    .processedHashes
    .delete(
      keys[index]
    );

  }

}



function trimConversationHistory(){

  if(

    communicationRuntimeState
    .conversations
    .size <=

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_CONVERSATIONS

  ){

    return;
  }

  const keys = [

    ...communicationRuntimeState
    .conversations
    .keys()

  ];

  const overflow =

    keys.length -

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_CONVERSATIONS;

  for(
    let index = 0;
    index < overflow;
    index++
  ){

    communicationRuntimeState
    .conversations
    .delete(
      keys[index]
    );

  }

}



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

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function freezeCommunicationObject(
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

    value instanceof AbortController ||

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet

  ){

    return value;

  }

  if(
    visited.has(value)
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

      freezeCommunicationObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// VALIDATION
// =====================================

function validateCommunicationMessage(
  message
){

  if(

    !message ||

    typeof message !==
    "object"

  ){

    return false;

  }

  if(

    typeof message.content !==
    "string"

  ){

    return false;

  }

  if(

    message.content
    .trim()
    .length === 0

  ){

    return false;

  }

  if(

    message.metadata !==
    undefined

    &&

    (

      typeof message.metadata !==
      "object"

      ||

      Array.isArray(
        message.metadata
      )

    )

  ){

    return false;

  }

  return true;

}



// =====================================
// STORAGE
// =====================================

function persistCommunicationState(){

  if(

    !COMMUNICATION_RUNTIME_CONFIG
    .ENABLE_PERSISTENCE

  ){

    return false;

  }

  try{

    const safeQueue =
    communicationRuntimeState
    .messageQueue
    .map((item) => {

      return {

        id:item.id,

        content:item.content,

        metadata:item.metadata,

        createdAt:item.createdAt

      };

    });

    localStorage.setItem(

      "rigo_communication_state",

      JSON.stringify({

        queue:safeQueue

      })

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function restoreCommunicationState(){

  try{

    const raw =
    localStorage.getItem(
      "rigo_communication_state"
    );

    if(!raw){

      return false;

    }

    const parsed =
    JSON.parse(raw);

    if(
      !parsed ||
      typeof parsed !==
      "object"
    ){

      return false;

    }

    if(
      Array.isArray(
        parsed.queue
      )
    ){

      communicationRuntimeState
      .messageQueue =

      parsed.queue
      .filter((item) => {

        return validateCommunicationMessage(
          item
        );

      });

    }

    communicationRuntimeState
    .diagnostics
    .recoveredQueues++;

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// QUEUE
// =====================================

async function enqueueCommunicationMessage(
  payload
){

  if(

    communicationRuntimeState
    .messageQueue
    .length >=

    COMMUNICATION_RUNTIME_CONFIG
    .MAX_QUEUE_SIZE

  ){

    return false;

  }

  const duplicate =

    communicationRuntimeState
    .messageQueue
    .some((message) => {

      return (
        message.content ===
        payload.content
      );

    });

  if(
    duplicate
  ){

    communicationRuntimeState
    .diagnostics
    .duplicatesPrevented++;

    return false;

  }

  communicationRuntimeState
  .messageQueue
  .push(payload);

  communicationRuntimeState
  .diagnostics
  .queued++;

  persistCommunicationState();

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .MESSAGE_QUEUED,

    {

      messageId:
      payload.id

    }

  );

  return true;

}



async function processCommunicationQueue(){

  if(
    communicationRuntimeState
    .processing
  ){

    return false;

  }

  communicationRuntimeState
  .processing =
  true;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .PROCESSING

  );

  try{

    while(

      communicationRuntimeState
      .messageQueue
      .length > 0

    ){

      const payload =

        communicationRuntimeState
        .messageQueue
        .shift();

      if(!payload){

        continue;

      }

      try{

        await executeCommunicationMessage(
          payload
        );

      }

      catch(error){

        communicationRuntimeState
        .diagnostics
        .failed++;

      }

      await wait(0);

    }

    persistCommunicationState();

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

    return true;

  }

  finally{

    communicationRuntimeState
    .processing =
    false;

  }

}



// =====================================
// STREAMS
// =====================================

async function startCommunicationStream(
  streamId
){

  if(

    communicationRuntimeState
    .activeStreams
    .has(streamId)

  ){

    return false;

  }

  communicationRuntimeState
  .streaming =
  true;

  communicationRuntimeState
  .activeStreams
  .set(

    streamId,

    freezeCommunicationObject({

      startedAt:
      Date.now()

    })

  );

  communicationRuntimeState
  .diagnostics
  .streams++;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .STREAMING

  );

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .STREAM_STARTED,

    {

      streamId

    }

  );

  return true;

}



async function stopCommunicationStream(
  streamId
){

  if(

    !communicationRuntimeState
    .activeStreams
    .has(streamId)

  ){

    return false;

  }

  communicationRuntimeState
  .activeStreams
  .delete(
    streamId
  );

  if(

    communicationRuntimeState
    .activeStreams
    .size === 0

  ){

    communicationRuntimeState
    .streaming =
    false;

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

  }

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .STREAM_COMPLETED,

    {

      streamId

    }

  );

  return true;

}



// =====================================
// TYPING
// =====================================

async function startTypingIndicator(){

  if(

    !COMMUNICATION_RUNTIME_CONFIG
    .ENABLE_TYPING_INDICATOR

  ){

    return false;

  }

  if(
    communicationRuntimeState
    .typing
  ){

    return true;

  }

  communicationRuntimeState
  .typing =
  true;

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .TYPING_STARTED

  );

  return true;

}



async function stopTypingIndicator(){

  if(
    !communicationRuntimeState
    .typing
  ){

    return true;

  }

  communicationRuntimeState
  .typing =
  false;

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .TYPING_STOPPED

  );

  return true;

}



// =====================================
// ABORT
// =====================================

function abortCommunicationMessage(
  requestId
){

  const controller =

    communicationRuntimeState
    .abortControllers
    .get(
      requestId
    );

  if(!controller){

    return false;

  }

  try{

    controller.abort();

  }

  catch(error){

    return false;

  }

  communicationRuntimeState
  .abortControllers
  .delete(
    requestId
  );

  communicationRuntimeState
  .activeRequests
  .delete(
    requestId
  );

  communicationRuntimeState
  .diagnostics
  .aborted++;

  emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .MESSAGE_ABORTED,

    {

      requestId

    }

  );

  return true;

}



function abortAllCommunicationMessages(){

  communicationRuntimeState
  .abortControllers
  .forEach((controller) => {

    try{

      controller.abort();

    }

    catch(error){

    }

  });

  communicationRuntimeState
  .abortControllers
  .clear();

  communicationRuntimeState
  .activeRequests
  .clear();

  return true;

}



// =====================================
// MESSAGE EXECUTION
// =====================================

async function executeCommunicationMessage(
  payload
){

  const requestId =
  createCommunicationId(
    "request"
  );

  const messageHash =
  createMessageHash(
    payload
  );

  if(

    communicationRuntimeState
    .processedHashes
    .has(
      messageHash
    )

  ){

    communicationRuntimeState
    .diagnostics
    .duplicatesPrevented++;

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .DUPLICATE_PREVENTED,

      {

        requestId

      }

    );

    return null;

  }

  communicationRuntimeState
  .processedHashes
  .set(

    messageHash,

    Date.now()

  );

  cleanupProcessedHashes();

  const controller =

    COMMUNICATION_RUNTIME_CONFIG
    .ENABLE_ABORT_CONTROLLERS

    ?

    new AbortController()

    :

    null;

  if(controller){

    communicationRuntimeState
    .abortControllers
    .set(
      requestId,
      controller
    );

  }

  communicationRuntimeState
  .activeRequests
  .set(

    requestId,

    freezeCommunicationObject(
      safeCommunicationClone(
        payload
      )
    )

  );

  let streamId =
  null;

  let timeoutId =
  null;

  try{

    await startTypingIndicator();

    streamId =
    createCommunicationId(
      "stream"
    );

    await startCommunicationStream(
      streamId
    );

    if(

      COMMUNICATION_RUNTIME_CONFIG
      .ENABLE_TIMEOUTS

    ){

      timeoutId =
      setTimeout(() => {

        controller?.abort();

      },

      COMMUNICATION_RUNTIME_CONFIG
      .MESSAGE_TIMEOUT);

    }

    let response =
    null;

    for(

      let attempt = 1;

      attempt <=

      COMMUNICATION_RUNTIME_CONFIG
      .MAX_RETRIES;

      attempt++

    ){

      try{

        if(
          typeof APIRuntime !==
          "undefined"
        ){

          response =
          await APIRuntime
          ?.request?.({

            endpoint:
            "/chat/message",

            method:"POST",

            body:payload,

            signal:
            controller?.signal

          });

        }

        else{

          throw new Error(
            "NO_RUNTIME_AVAILABLE"
          );

        }

        break;

      }

      catch(error){

        const aborted =

          controller?.signal
          ?.aborted;

        if(aborted){

          communicationRuntimeState
          .diagnostics
          .aborted++;

          await emitCommunicationEvent(

            COMMUNICATION_RUNTIME_EVENTS
            .MESSAGE_ABORTED,

            {

              requestId

            }

          );

          throw error;

        }

        communicationRuntimeState
        .diagnostics
        .retries++;

        if(
          attempt >=
          COMMUNICATION_RUNTIME_CONFIG
          .MAX_RETRIES
        ){

          throw error;

        }

        await wait(

          COMMUNICATION_RUNTIME_CONFIG
          .RETRY_DELAY

        );

      }

    }

    clearTimeout(
      timeoutId
    );

    const frozenResponse =
    freezeCommunicationObject(
      safeCommunicationClone(
        response
      )
    );

    communicationRuntimeState
    .diagnostics
    .sent++;

    communicationRuntimeState
    .diagnostics
    .received++;

    communicationRuntimeState
    .lastMessageAt =
    Date.now();

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .MESSAGE_SENT,

      {

        requestId

      }

    );

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .MESSAGE_RECEIVED,

      {

        requestId

      }

    );

    if(

      COMMUNICATION_RUNTIME_CONFIG
      .ENABLE_MEMORY_SYNC

      &&

      typeof MemorySystem !==
      "undefined"

    ){

      await MemorySystem
      ?.store?.({

        type:"conversation",

        payload,

        response:
        frozenResponse,

        createdAt:
        Date.now()

      });

    }

    communicationRuntimeState
    .conversations
    .set(

      requestId,

      freezeCommunicationObject({

        payload,

        response:
        frozenResponse,

        createdAt:
        Date.now()

      })

    );

    trimConversationHistory();

    persistCommunicationState();

    return frozenResponse;

  }

  catch(error){

    communicationRuntimeState
    .diagnostics
    .failed++;

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .MESSAGE_FAILED,

      {

        requestId,

        error:
        String(error)

      }

    );

    return freezeCommunicationObject({

      ok:false,

      error:
      String(error)

    });

  }

  finally{

    clearTimeout(
      timeoutId
    );

    if(streamId){

      await stopCommunicationStream(
        streamId
      );

    }

    await stopTypingIndicator();

    communicationRuntimeState
    .activeRequests
    .delete(
      requestId
    );

    communicationRuntimeState
    .abortControllers
    .delete(
      requestId
    );

  }

}



// =====================================
// SEND MESSAGE
// =====================================

async function sendCommunicationMessage(
  message = {}
){

  if(
    communicationRuntimeState
    .destroyed
  ){

    return null;

  }

  const valid =
  validateCommunicationMessage(
    message
  );

  if(!valid){

    return null;

  }

  const payload =
  freezeCommunicationObject({

    id:createCommunicationId(
      "message"
    ),

    content:
    String(
      message.content
    )
    .trim(),

    metadata:

      freezeCommunicationObject(

        safeCommunicationClone(
          message.metadata ||
          {}
        )

      ),

    createdAt:
    Date.now()

  });

  const queued =
  await enqueueCommunicationMessage(
    payload
  );

  if(!queued){

    return null;

  }

  await processCommunicationQueue();

  return payload.id;

}



// =====================================
// HEALTH
// =====================================

async function monitorCommunicationHealth(){

  try{

    const healthy = (

      communicationRuntimeState
      .destroyed === false

    );

    if(!healthy){

      throw new Error(
        "COMMUNICATION_HEALTH_FAILED"
      );

    }

    return true;

  }

  catch(error){

    if(

      COMMUNICATION_RUNTIME_CONFIG
      .ENABLE_RECOVERY

    ){

      await recoverCommunicationRuntime();

    }

    return false;

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverCommunicationRuntime(){

  if(
    communicationRuntimeState
    .recovering
  ){

    return false;

  }

  communicationRuntimeState
  .recovering =
  true;

  communicationRuntimeState
  .diagnostics
  .recoveries++;

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .RECOVERING

  );

  await emitCommunicationEvent(

    COMMUNICATION_RUNTIME_EVENTS
    .RECOVERY_STARTED

  );

  try{

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
    .activeStreams
    .clear();

    communicationRuntimeState
    .activeRequests
    .clear();

    communicationRuntimeState
    .abortControllers
    .clear();

    await processCommunicationQueue();

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .READY

    );

    await emitCommunicationEvent(

      COMMUNICATION_RUNTIME_EVENTS
      .RECOVERY_COMPLETED

    );

    return true;

  }

  catch(error){

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .FAILED

    );

    return false;

  }

  finally{

    communicationRuntimeState
    .recovering =
    false;

  }

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
  .diagnostics = {

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

  };

  setCommunicationState(

    COMMUNICATION_RUNTIME_STATES
    .IDLE

  );

  return true;

}



// =====================================
// DESTROY
// =====================================

async function destroyCommunicationRuntime(){

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

    if(

      COMMUNICATION_RUNTIME_CONFIG
      .ENABLE_RUNTIME_BRIDGE

      &&

      typeof SystemEvents?.on ===
      "function"

    ){

      const unsubscribe =
      SystemEvents.on(

        "runtime.recovered",

        () => {

          recoverCommunicationRuntime();

        }

      );

      if(
        typeof unsubscribe ===
        "function"
      ){

        communicationRuntimeState
        .runtimeRecoveryUnsubscribe =
        unsubscribe;

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

    setCommunicationState(

      COMMUNICATION_RUNTIME_STATES
      .FAILED

    );

    return false;

  }

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
