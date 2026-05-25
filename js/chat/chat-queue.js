// =====================================
// RIGO AI
// CHAT QUEUE
// ENTERPRISE CHAT QUEUE SYSTEM
// =====================================



// =====================================
// PROCESS AI QUEUE
// =====================================

async function processAIQueue(){

  if(

    typeof generateAIResponse !==
    "function"

  ){

    safeLogError?.(
      "AI SERVICE NOT AVAILABLE"
    );

    return false;

  }

  if(
    chatRuntimeState.processing
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

  chatRuntimeState
  .processing =
  true;

  const startedAt =
  Date.now();

  let shouldRemoveQueueItem =
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

  chatRuntimeState
  .generationController =
  new AbortController();

  try{

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

    await emitChatRuntimeEvent(

      CHAT_RUNTIME_EVENTS
      .GENERATION_STARTED,

      {

        messageId:
        queueItem.id

      }

    );

    if(

      chatRuntimeState
      .generationController
      .signal
      .aborted

    ){

      throw new DOMException(
        "Aborted",
        "AbortError"
      );

    }

    const generated =
    await generateAIResponse(

      queueItem.id,

      {

        signal:

          chatRuntimeState
          .generationController
          .signal,



        onChunk(chunk){

          if(
            typeof chunk !==
            "string"
          ){

            return;
          }

          ChatStreamManager
          ?.push?.(
            chunk
          );

        }

      }

    );

    if(!generated){

      throw new Error(
        "GENERATION_FAILED"
      );

    }

    ChatStreamManager
    ?.complete?.();

    if(
      streamingMessageState
      ?.activeElement
    ){

      finalizeStreamingMessage?.();

    }

    chatRuntimeState
    .diagnostics
    .successful++;

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

    return true;

  }

  catch(error){

    const aborted =

      error?.name ===
      "AbortError";

    if(aborted){

      ChatStreamManager
      ?.abort?.();

      abortStreamingMessage?.();

      chatRuntimeState
      .generationController =
      null;

      await emitChatRuntimeEvent(

        CHAT_RUNTIME_EVENTS
        .GENERATION_ABORTED,

        {

          messageId:
          queueItem.id

        }

      );

    }

    else{

      ChatStreamManager
      ?.fail?.(
        error
      );

      chatRuntimeState
      .diagnostics
      .failed++;

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

        await wait(

          CHAT_RUNTIME_CONFIG
          .RETRY_DELAY

        );

      }

      else{

        safeLogError?.(

          "QUEUE PROCESS ERROR:",

          error

        );

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
    .generating =
    false;

    chatRuntimeState
    .streaming =
    false;

    chatRuntimeState
    .processing =
    false;

    chatRuntimeState
    .activeMessageId =
    null;

    chatRuntimeState
    .generationController =
    null;

    continueQueueProcessing();

  }

}
