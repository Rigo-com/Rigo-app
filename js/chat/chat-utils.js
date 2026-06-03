// =====================================
// RIGO AI
// CHAT UTILS
// =====================================



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
// CREATE STREAM ID
// =====================================

function createStreamId(){

  try{

    if(
      typeof crypto !==
      "undefined"
      &&
      typeof crypto.randomUUID ===
      "function"
    ){

      return (
        "stream_" +
        crypto.randomUUID()
      );

    }

  }

  catch(error){}

  return [

    "stream",

    Date.now(),

    Math.random()
    .toString(36)
    .slice(2,10)

  ].join("_");

}



// =====================================
// CREATE QUEUE ITEM
// =====================================

function createQueueItem(
  messageId
){

  if(
    typeof messageId !==
    "string"
    &&
    typeof messageId !==
    "number"
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
// QUEUE SCHEDULER
// =====================================

let queueProcessingScheduled =
false;

async function continueQueueProcessing(
  processor,
  runtimeState
){

  if(
    !runtimeState ||
    typeof runtimeState !==
    "object"
  ){
    return false;
  }

  if(
    queueProcessingScheduled
  ){
    return false;
  }

  if(
    runtimeState.processing
  ){
    return false;
  }

  if(
    runtimeState.generating
  ){
    return false;
  }

  if(
    !Array.isArray(
      runtimeState.queue
    )
    ||
    runtimeState.queue.length <= 0
  ){
    return false;
  }

  if(
    typeof processor !==
    "function"
  ){
    return false;
  }

  queueProcessingScheduled =
  true;

  try{

    await Promise.resolve();

    await processor();

    return true;

  }

  catch(error){

    return false;

  }

  finally{

    queueProcessingScheduled =
    false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const ChatUtils =
Object.freeze({

  safeChatClone,

  wait,

  createQueueItem,

  createStreamId,

  continueQueueProcessing

});



// =====================================
// EXPORTS
// =====================================

export {

  safeChatClone,

  wait,

  createQueueItem,

  createStreamId,

  continueQueueProcessing,

  ChatUtils

};

export default
ChatUtils;
