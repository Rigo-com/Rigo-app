// =====================================
// RIGO AI
// CHAT STATE
// ENTERPRISE CHAT STATE SYSTEM
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

  generating:false,

  streaming:false,

  syncing:false,

  processing:false,

  rendering:false,

  destroyed:false,

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
// FREEZE CHAT OBJECT
// =====================================

function freezeChatObject(
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

      freezeChatObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

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
  .destroyed =
  false;

  chatRuntimeState
  .activeMessageId =
  null;

  chatRuntimeState
  .generationController =
  null;

  chatRuntimeState
  .queue = [];

  chatRuntimeState
  .renderQueue = [];

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
// CHAT STATUS
// =====================================

function getChatRuntimeStatus(){

  return freezeChatObject({

    initialized:

      chatRuntimeState
      .initialized,

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

    destroyed:

      chatRuntimeState
      .destroyed,

    queueSize:

      chatRuntimeState
      .queue
      .length,

    renderQueueSize:

      chatRuntimeState
      .renderQueue
      .length,

    activeMessageId:

      chatRuntimeState
      .activeMessageId,

    pendingOperations:

      chatRuntimeState
      .pendingOperations
      .size,

    diagnostics:

      deepClone(

        chatRuntimeState
        .diagnostics

      )

  });

}
