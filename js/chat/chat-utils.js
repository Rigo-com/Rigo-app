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

  return Object.freeze({

    id:
    String(messageId),

    createdAt:
    Date.now(),

    retries:0

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatUtils =
Object.freeze({

  safeChatClone,

  wait,

  createQueueItem,

  createStreamId

});



// =====================================
// EXPORTS
// =====================================

export {

  safeChatClone,

  wait,

  createQueueItem,

  createStreamId,

  ChatUtils

};

export default
ChatUtils;
