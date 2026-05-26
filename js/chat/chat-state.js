// =====================================
// RIGO AI
// CHAT STATE
// ENTERPRISE CHAT STATE SYSTEM
// FINAL STABLE PATCHED EDITION
// =====================================



// =====================================
// CHAT CONFIG
// =====================================

const CHAT_RUNTIME_CONFIG =
Object.freeze({

  MAX_QUEUE_SIZE:
  100,

  MAX_RETRIES:
  3,

  RETRY_DELAY:
  1000,

  SAVE_DEBOUNCE:
  300,

  ENABLE_EVENTS:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_GENERATION_TRACKING:true,

  ENABLE_RUNTIME_SYNC:true

});



// =====================================
// CHAT EVENTS
// =====================================

const CHAT_RUNTIME_EVENTS =
Object.freeze({

  MESSAGE_CREATED:
  "chat.message.created",

  MESSAGE_SENT:
  "chat.message.sent",

  MESSAGE_FAILED:
  "chat.message.failed",

  MESSAGE_RETRY:
  "chat.message.retry",

  GENERATION_STARTED:
  "chat.generation.started",

  GENERATION_COMPLETED:
  "chat.generation.completed",

  GENERATION_ABORTED:
  "chat.generation.aborted",

  CHAT_RESET:
  "chat.reset"

});



// =====================================
// CHAT RUNTIME STATE
// =====================================

const chatRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  generating:false,

  streaming:false,

  syncing:false,

  processing:false,

  rendering:false,

  activeMessageId:null,

  generationController:null,

  queue:[],

  pendingOperations:
  new Map(),

  renderQueue:[],

  cache:Object.seal({

    messages:
    new Map(),

    rendered:
    new Map()

  }),

  diagnostics:Object.seal({

    messages:0,

    successful:0,

    failed:0,

    retries:0,

    resets:0,

    renders:0

  })

});



// =====================================
// SAFE CLONE
// =====================================

function safeClone(
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

  }

  catch(error){}

  try{

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



// =====================================
// RESET DIAGNOSTICS
// =====================================

function resetChatDiagnostics(){

  chatRuntimeState
  .diagnostics
  .messages = 0;

  chatRuntimeState
  .diagnostics
  .successful = 0;

  chatRuntimeState
  .diagnostics
  .failed = 0;

  chatRuntimeState
  .diagnostics
  .retries = 0;

  chatRuntimeState
  .diagnostics
  .resets = 0;

  chatRuntimeState
  .diagnostics
  .renders = 0;

  return true;

}



// =====================================
// RESET CHAT STATE
// =====================================

function resetChatState(){

  chatRuntimeState
  .initialized =
  false;

  chatRuntimeState
  .initializing =
  false;

  chatRuntimeState
  .generating =
  false;

  chatRuntimeState
  .streaming =
  false;

  chatRuntimeState
  .syncing =
  false;

  chatRuntimeState
  .processing =
  false;

  chatRuntimeState
  .rendering =
  false;

  chatRuntimeState
  .activeMessageId =
  null;

  chatRuntimeState
  .generationController =
  null;

  chatRuntimeState
  .queue.length = 0;

  chatRuntimeState
  .renderQueue.length = 0;

  chatRuntimeState
  .pendingOperations
  .clear();

  chatRuntimeState
  .cache
  .messages
  .clear();

  chatRuntimeState
  .cache
  .rendered
  .clear();

  resetChatDiagnostics();

  return true;

}



// =====================================
// QUEUE HELPERS
// =====================================

function validateQueueLimit(
  queue = []
){

  return (

    Array.isArray(queue)

    &&

    queue.length <

    CHAT_RUNTIME_CONFIG
    .MAX_QUEUE_SIZE

  );

}



function pushChatQueue(
  item
){

  if(

    !validateQueueLimit(
      chatRuntimeState
      .queue
    )

  ){

    return false;

  }

  chatRuntimeState
  .queue
  .push(item);

  return true;

}



function shiftChatQueue(){

  if(

    !Array.isArray(
      chatRuntimeState
      .queue
    )

  ){

    return null;

  }

  return chatRuntimeState
  .queue
  .shift() || null;

}



// =====================================
// CHAT STATUS
// =====================================

function getChatRuntimeStatus(){

  return Object.freeze({

    initialized:

      chatRuntimeState
      .initialized,

    initializing:

      chatRuntimeState
      .initializing,

    generating:

      chatRuntimeState
      .generating,

    streaming:

      chatRuntimeState
      .streaming,

    syncing:

      chatRuntimeState
      .syncing,

    processing:

      chatRuntimeState
      .processing,

    rendering:

      chatRuntimeState
      .rendering,

    queueSize:

      Array.isArray(
        chatRuntimeState
        .queue
      )

      ?

      chatRuntimeState
      .queue
      .length

      :

      0,

    renderQueueSize:

      Array.isArray(
        chatRuntimeState
        .renderQueue
      )

      ?

      chatRuntimeState
      .renderQueue
      .length

      :

      0,

    activeMessageId:

      chatRuntimeState
      .activeMessageId,

    pendingOperations:

      chatRuntimeState
      .pendingOperations
      .size,

    diagnostics:

      safeClone(

        chatRuntimeState
        .diagnostics

      )

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatState =
Object.freeze({

  state:
  chatRuntimeState,

  reset:
  resetChatState,

  diagnostics:
  getChatRuntimeStatus,

  snapshot:
  getChatRuntimeStatus,

  pushQueue:
  pushChatQueue,

  shiftQueue:
  shiftChatQueue

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ChatState",

    {

      value:
      ChatState,

      writable:false,

      configurable:false

    }

  );

}
