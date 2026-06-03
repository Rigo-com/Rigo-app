// =====================================
// RIGO AI
// CHAT QUEUE STATE
// =====================================



// =====================================
// STATE
// =====================================

const chatQueueState =
Object.seal({

  processing:false,

  paused:false,

  activeItemId:null,

  queue:[],

  diagnostics:
  Object.seal({

    enqueued:0,

    dequeued:0,

    completed:0,

    failed:0,

    cleared:0

  })

});



// =====================================
// READ API
// =====================================

function getQueueItems(){

  return [
    ...chatQueueState
    .queue
  ];

}



function getQueueItem(
  itemId
){

  return (

    chatQueueState
    .queue
    .find(

      item =>

      item?.id ===
      itemId

    )

    ||

    null

  );

}



function hasQueueItem(
  itemId
){

  return Boolean(

    getQueueItem(
      itemId
    )

  );

}



function getQueueSize(){

  return chatQueueState
  .queue
  .length;

}



function isQueueEmpty(){

  return (
    getQueueSize() ===
    0
  );

}



// =====================================
// WRITE API
// =====================================

function enqueueItem(
  item
){

  if(
    !item ||
    !item.id
  ){
    return false;
  }

  chatQueueState
  .queue
  .push(
    item
  );

  return true;

}



function dequeueItem(){

  if(
    isQueueEmpty()
  ){
    return null;
  }

  return chatQueueState
  .queue
  .shift();

}



function removeQueueItem(
  itemId
){

  const index =

    chatQueueState
    .queue
    .findIndex(

      item =>

      item?.id ===
      itemId

    );

  if(
    index < 0
  ){
    return false;
  }

  chatQueueState
  .queue
  .splice(
    index,
    1
  );

  return true;

}



function clearQueue(){

  chatQueueState
  .queue
  .length = 0;

  chatQueueState
  .activeItemId =
  null;

  return true;

}



// =====================================
// STATUS API
// =====================================

function setQueueProcessing(
  value
){

  chatQueueState
  .processing =
  Boolean(value);

}



function setQueuePaused(
  value
){

  chatQueueState
  .paused =
  Boolean(value);

}



function setActiveQueueItem(
  itemId
){

  chatQueueState
  .activeItemId =
  itemId ?? null;

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementEnqueued(){

  chatQueueState
  .diagnostics
  .enqueued++;

}



function incrementDequeued(){

  chatQueueState
  .diagnostics
  .dequeued++;

}



function incrementCompleted(){

  chatQueueState
  .diagnostics
  .completed++;

}



function incrementFailed(){

  chatQueueState
  .diagnostics
  .failed++;

}



function incrementCleared(){

  chatQueueState
  .diagnostics
  .cleared++;

}



// =====================================
// SNAPSHOT
// =====================================

function getChatQueueSnapshot(){

  return Object.freeze({

    processing:
    chatQueueState
    .processing,

    paused:
    chatQueueState
    .paused,

    activeItemId:
    chatQueueState
    .activeItemId,

    queue:

    structuredClone(

      chatQueueState
      .queue

    ),

    diagnostics:

    structuredClone(

      chatQueueState
      .diagnostics

    )

  });

}



// =====================================
// RESET
// =====================================

function resetChatQueueState(){

  chatQueueState
  .processing =
  false;

  chatQueueState
  .paused =
  false;

  chatQueueState
  .activeItemId =
  null;

  clearQueue();

  chatQueueState
  .diagnostics
  .enqueued = 0;

  chatQueueState
  .diagnostics
  .dequeued = 0;

  chatQueueState
  .diagnostics
  .completed = 0;

  chatQueueState
  .diagnostics
  .failed = 0;

  chatQueueState
  .diagnostics
  .cleared = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatQueueState =
Object.freeze({

  getQueueItems,

  getQueueItem,

  hasQueueItem,

  getQueueSize,

  isQueueEmpty,

  enqueueItem,

  dequeueItem,

  removeQueueItem,

  clearQueue,

  setQueueProcessing,

  setQueuePaused,

  setActiveQueueItem,

  incrementEnqueued,

  incrementDequeued,

  incrementCompleted,

  incrementFailed,

  incrementCleared,

  snapshot:
  getChatQueueSnapshot,

  reset:
  resetChatQueueState

});



// =====================================
// EXPORTS
// =====================================

export {

  getQueueItems,
  getQueueItem,
  hasQueueItem,

  getQueueSize,
  isQueueEmpty,

  enqueueItem,
  dequeueItem,
  removeQueueItem,
  clearQueue,

  setQueueProcessing,
  setQueuePaused,
  setActiveQueueItem,

  incrementEnqueued,
  incrementDequeued,
  incrementCompleted,
  incrementFailed,
  incrementCleared,

  getChatQueueSnapshot,
  resetChatQueueState,

  ChatQueueState

};

export default
ChatQueueState;
