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
    chatRuntimeState.generating
  ){

    return false;

  }

  if(
    chatRuntimeState.queue
    .length <= 0
  ){

    return false;

  }

  chatRuntimeState
  .processing =
  true;

  const queueItem =

    chatRuntimeState
    .queue[0];

  if(!queueItem){

    chatRuntimeState
    .processing =
    false;

    return false;

  }

  const startedAt =
  Date.now();

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

  ChatStreamManager.start(
    queueItem.id
  );

  await emitChatRuntimeEvent(

    CHAT_RUNTIME_EVENTS
    .GENERATION_STARTED,

    {

      messageId:
      queueItem.id

    }

  );

  let generated =
  false;

  try{

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

    generated =
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
          .push(
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
    .complete();

    finalizeStreamingMessage?.();

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

  }

  catch(error){

    const aborted =

      error?.name ===
      "AbortError";

    if(aborted){

      ChatStreamManager
      .abort();

      abortStreamingMessage?.();

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
      .fail(
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

        chatRuntimeState
        .processing =
        false;

        chatRuntimeState
        .generating =
        false;

        chatRuntimeState
        .streaming =
        false;

        return processAIQueue();

      }

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

  finally{

    if(

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

  return generated;

}
