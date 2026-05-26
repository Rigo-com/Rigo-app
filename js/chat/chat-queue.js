// =====================================
// RIGO AI
// CHAT QUEUE
// ENTERPRISE CHAT QUEUE SYSTEM
// FINAL STABLE EDITION
// =====================================



// =====================================
// QUEUE STATE
// =====================================

const chatQueueState =
Object.seal({

  initialized:false,

  processing:false,

  scheduled:false,

  activeQueueId:null,

  lastProcessedAt:null,

  lastError:null,

  diagnostics:Object.seal({

    processed:0,

    failed:0,

    retries:0,

    aborted:0

  })

});



// =====================================
// SERVICE ACCESS
// =====================================

function getQueueService(
  serviceName
){

  try{

    if(
      typeof ServiceRegistry ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof ServiceRegistry.get !==
      "function"
    ){

      return null;

    }

    return ServiceRegistry.get(
      serviceName
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE LOGGER
// =====================================

function safeQueueLogError(
  ...args
){

  try{

    const diagnostics =
    getQueueService(
      "diagnostics"
    );

    if(
      diagnostics &&
      typeof diagnostics.error ===
      "function"
    ){

      diagnostics.error(
        ...args
      );

      return;

    }

    console.error(...args);

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// CREATE ABORT ERROR
// =====================================

function createAbortError(){

  const error =
  new Error(
    "Aborted"
  );

  error.name =
  "AbortError";

  return error;

}



// =====================================
// VALIDATE QUEUE
// =====================================

function validateQueueRuntime(){

  if(
    typeof chatRuntimeState !==
    "object"
  ){

    return false;

  }

  if(
    chatRuntimeState.destroyed ===
    true
  ){

    return false;

  }

  if(
    !Array.isArray(
      chatRuntimeState.queue
    )
  ){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE QUEUE SIZE
// =====================================

function validateQueueSize(){

  return (

    chatRuntimeState
    .queue
    .length <=

    CHAT_RUNTIME_CONFIG
    .MAX_QUEUE_SIZE

  );

}



// =====================================
// PROCESS AI QUEUE
// =====================================

async function processAIQueue(){

  if(
    chatQueueState.processing
  ){

    return false;

  }

  if(
    !validateQueueRuntime()
  ){

    return false;

  }

  if(
    !validateQueueSize()
  ){

    safeQueueLogError(
      "QUEUE_LIMIT_EXCEEDED"
    );

    chatRuntimeState
    .queue
    .splice(

      CHAT_RUNTIME_CONFIG
      .MAX_QUEUE_SIZE

    );

  }

  if(
    typeof generateAIResponse !==
    "function"
  ){

    safeQueueLogError(
      "AI_SERVICE_NOT_AVAILABLE"
    );

    return false;

  }

  if(
    chatRuntimeState.queue
    .length <= 0
  ){

    return false;

  }

  const queueItem =
  chatRuntimeState
  .queue[0];

  if(
    !queueItem
    ||
    !queueItem.id
  ){

    chatRuntimeState
    .queue.shift();

    return false;

  }

  chatQueueState
  .processing =
  true;

  chatQueueState
  .activeQueueId =
  queueItem.id;

  chatRuntimeState
  .processing =
  true;

  chatRuntimeState
  .generating =
  true;

  chatRuntimeState
  .streaming =
  true;

  chatRuntimeState
  .activeMessageId =
  queueItem.id;

  const startedAt =
  Date.now();

  let shouldRemoveQueueItem =
  true;

  try{

    const controller =
    new AbortController();

    chatRuntimeState
    .generationController =
    controller;

    const signal =
    controller.signal;

    if(
      signal.aborted
    ){

      throw createAbortError();

    }



    // =================================
    // STREAM START
    // =================================

    if(

      typeof ChatStreamManager !==
      "undefined"

      &&

      typeof ChatStreamManager.start ===
      "function"

    ){

      ChatStreamManager.start(
        queueItem.id
      );

    }



    // =================================
    // EVENTS
    // =================================

    if(
      typeof emitChatRuntimeEvent ===
      "function"
    ){

      await emitChatRuntimeEvent(

        CHAT_RUNTIME_EVENTS
        .GENERATION_STARTED,

        {

          messageId:
          queueItem.id

        }

      );

    }



    // =================================
    // GENERATE
    // =================================

    const generated =
    await generateAIResponse();

    if(!generated){

      throw new Error(
        "GENERATION_FAILED"
      );

    }



    // =================================
    // COMPLETE STREAM
    // =================================

    if(

      typeof ChatStreamManager !==
      "undefined"

      &&

      typeof ChatStreamManager.complete ===
      "function"

    ){

      ChatStreamManager
      .complete();

    }

    if(

      typeof finalizeStreamingMessage ===
      "function"

      &&

      streamingMessageState
      ?.activeElement

    ){

      finalizeStreamingMessage();

    }

    chatRuntimeState
    .diagnostics
    .successful++;

    chatQueueState
    .diagnostics
    .processed++;

    chatQueueState
    .lastProcessedAt =
    Date.now();



    // =================================
    // EVENTS
    // =================================

    if(
      typeof emitChatRuntimeEvent ===
      "function"
    ){

      await emitChatRuntimeEvent(

        CHAT_RUNTIME_EVENTS
        .GENERATION_COMPLETED,

        {

          messageId:
          queueItem.id,

          duration:

            Date.now() -
            startedAt

        }

      );

    }

    return true;

  }

  catch(error){

    chatQueueState
    .lastError =
    error;

    const aborted =

      error?.name ===
      "AbortError";



    // =================================
    // ABORT
    // =================================

    if(aborted){

      chatQueueState
      .diagnostics
      .aborted++;

      if(

        typeof ChatStreamManager !==
        "undefined"

        &&

        typeof ChatStreamManager.abort ===
        "function"

      ){

        ChatStreamManager
        .abort();

      }

      if(
        typeof abortStreamingMessage ===
        "function"
      ){

        abortStreamingMessage();

      }

      if(
        typeof emitChatRuntimeEvent ===
        "function"
      ){

        await emitChatRuntimeEvent(

          CHAT_RUNTIME_EVENTS
          .GENERATION_ABORTED,

          {

            messageId:
            queueItem.id

          }

        );

      }

    }



    // =================================
    // FAILURE
    // =================================

    else{

      chatRuntimeState
      .diagnostics
      .failed++;

      chatQueueState
      .diagnostics
      .failed++;

      if(

        typeof ChatStreamManager !==
        "undefined"

        &&

        typeof ChatStreamManager.fail ===
        "function"

      ){

        ChatStreamManager
        .fail(
          error
        );

      }

      if(

        queueItem.retries <

        CHAT_RUNTIME_CONFIG
        .MAX_RETRIES

      ){

        queueItem.retries++;

        shouldRemoveQueueItem =
        false;

        chatRuntimeState
        .diagnostics
        .retries++;

        chatQueueState
        .diagnostics
        .retries++;

        if(
          typeof emitChatRuntimeEvent ===
          "function"
        ){

          await emitChatRuntimeEvent(

            CHAT_RUNTIME_EVENTS
            .MESSAGE_RETRY,

            {

              messageId:
              queueItem.id,

              retries:
              queueItem.retries

            }

          );

        }

        await wait(

          CHAT_RUNTIME_CONFIG
          .RETRY_DELAY

        );

      }

      else{

        safeQueueLogError(

          "QUEUE_PROCESS_ERROR",

          error

        );

        if(
          typeof emitChatRuntimeEvent ===
          "function"
        ){

          await emitChatRuntimeEvent(

            CHAT_RUNTIME_EVENTS
            .MESSAGE_FAILED,

            {

              messageId:
              queueItem.id,

              error:
              String(error)

            }

          );

        }

      }

    }

    return false;

  }

  finally{

    if(

      shouldRemoveQueueItem

      &&

      chatRuntimeState
      .queue[0]?.id ===
      queueItem.id

    ){

      chatRuntimeState
      .queue.shift();

    }

    chatRuntimeState
    .processing =
    false;

    chatRuntimeState
    .generating =
    false;

    chatRuntimeState
    .streaming =
    false;

    chatRuntimeState
    .activeMessageId =
    null;

    chatRuntimeState
    .generationController =
    null;

    chatQueueState
    .processing =
    false;

    chatQueueState
    .activeQueueId =
    null;

    if(
      typeof continueQueueProcessing ===
      "function"
    ){

      continueQueueProcessing();

    }

  }

}



// =====================================
// QUEUE DIAGNOSTICS
// =====================================

function getQueueDiagnostics(){

  return Object.freeze({

    initialized:
    chatQueueState
    .initialized,

    processing:
    chatQueueState
    .processing,

    activeQueueId:
    chatQueueState
    .activeQueueId,

    lastProcessedAt:
    chatQueueState
    .lastProcessedAt,

    lastError:

      chatQueueState
      .lastError

      ?

      String(
        chatQueueState
        .lastError
      )

      :

      null,

    diagnostics:{

      ...chatQueueState
      .diagnostics

    }

  });

}



// =====================================
// INITIALIZE QUEUE
// =====================================

function initializeChatQueue(){

  if(
    chatQueueState
    .initialized
  ){

    return true;

  }

  if(

    typeof ServiceRegistry !==
    "undefined"

    &&

    typeof ServiceRegistry.register ===
    "function"

    &&

    typeof ServiceRegistry.has ===
    "function"

    &&

    !ServiceRegistry.has(
      "chat-queue"
    )

  ){

    ServiceRegistry.register(

      "chat-queue",

      ChatQueue,

      {

        immutable:true,

        version:"1.0.0"

      }

    );

    if(
      typeof ServiceRegistry.activate ===
      "function"
    ){

      ServiceRegistry.activate(
        "chat-queue"
      );

    }

  }

  chatQueueState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatQueue =
Object.freeze({

  initialize:
  initializeChatQueue,

  process:
  processAIQueue,

  diagnostics:
  getQueueDiagnostics,

  snapshot:
  getQueueDiagnostics

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

    "ChatQueue",

    {

      value:
      ChatQueue,

      writable:false,

      configurable:false

    }

  );

}
