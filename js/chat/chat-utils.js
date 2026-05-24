// =====================================
// SAFE CLONE
// =====================================

function safeClone(
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
      duration
    );

  });

}



// =====================================
// CREATE QUEUE ITEM
// =====================================

function createQueueItem(
  messageId
){

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

function continueQueueProcessing(){

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

    chatRuntimeState.queue
    .length <= 0

  ){

    return;
  }

  Promise.resolve()
  .then(() => {

    return processAIQueue();

  })
  .catch((error) => {

    safeLogError?.(

      "QUEUE CONTINUE ERROR:",

      error

    );

  });

}
