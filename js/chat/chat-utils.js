// =====================================
// SAFE CHAT CLONE
// =====================================

function safeChatClone(
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

    try{

      console.error(
        "SAFE CHAT CLONE ERROR:",
        error
      );

    }

    catch(logError){}

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

  return Object.freeze({

    id:
    String(messageId),

    createdAt:
    Date.now(),

    retries:0

  });

}



// =====================================
// CONTINUE QUEUE
// =====================================

let queueProcessingScheduled =
false;

async function continueQueueProcessing(){

  if(
    queueProcessingScheduled
  ){

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

    !Array.isArray(
      chatRuntimeState.queue
    )

    ||

    chatRuntimeState.queue
    .length <= 0

  ){

    return false;

  }

  queueProcessingScheduled =
  true;

  try{

    await Promise.resolve();

    if(
      typeof processAIQueue !==
      "function"
    ){

      return false;

    }

    await processAIQueue();

    return true;

  }

  catch(error){

    try{

      console.error(

        "QUEUE CONTINUE ERROR:",

        error

      );

    }

    catch(logError){}

    return false;

  }

  finally{

    queueProcessingScheduled =
    false;

  }

}
