// =====================================
// SAFE CHAT CLONE
// =====================================

function safeChatClone(
  value
){

  try{

    if(
      typeof deepClone ===
      "function"
    ){

      return deepClone(
        value
      );

    }

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

    safeLogError?.(
      "SAFE CHAT CLONE ERROR:",
      error
    );

    return null;

  }

}



// =====================================
// WAIT
// =====================================

function wait(
  duration = 0
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      Math.max(
        0,
        Number(duration) || 0
      )
    );

  });

}



// =====================================
// CREATE QUEUE ITEM
// =====================================

function createQueueItem(
  messageId
){

  if(
    !messageId
  ){

    return null;

  }

  return {

    id:
    String(messageId),

    createdAt:
    Date.now(),

    retries:0

  };

}



// =====================================
// CONTINUE QUEUE
// =====================================

let queueProcessingScheduled =
false;

function continueQueueProcessing(){

  if(
    queueProcessingScheduled
  ){

    return;
  }

  if(
    chatRuntimeState.processing
  ){

    return;
  }

  if(
    chatRuntimeState.generating
  ){

    return;
  }

  if(

    !Array.isArray(
      chatRuntimeState.queue
    )

    ||

    chatRuntimeState.queue
    .length <= 0

  ){

    return;
  }

  queueProcessingScheduled =
  true;

  Promise.resolve()
  .then(() => {

    queueProcessingScheduled =
    false;

    return processAIQueue();

  })
  .catch((error) => {

    queueProcessingScheduled =
    false;

    safeLogError?.(

      "QUEUE CONTINUE ERROR:",

      error

    );

  });

}
