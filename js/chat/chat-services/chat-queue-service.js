// =====================================
// RIGO AI
// CHAT QUEUE SERVICE
// =====================================

import {

  enqueueItem,

  dequeueItem,

  removeQueueItem,

  getQueueItem,

  getQueueItems,

  hasQueueItem,

  getQueueSize,

  isQueueEmpty,

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

  resetChatQueueState

}
from "../chat-state/chat-queue-state.js";

import {
  emit
}
from "../chat-events/chat-events.js";

import {
  CHAT_EVENTS
}
from "../chat-config.js";



// =====================================
// SERVICE STATE
// =====================================

const serviceState =
Object.seal({

  initialized:false

});



let queueCounter = 0;



// =====================================
// HELPERS
// =====================================

function createQueueItemId(){

  queueCounter++;

  return (
    "queue_" +
    Date.now() +
    "_" +
    queueCounter
  );

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    serviceState.initialized
  ){
    return true;
  }

  serviceState.initialized =
  true;

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  reset();

  serviceState.initialized =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  queueCounter = 0;

  resetChatQueueState();

  return true;

}



// =====================================
// ENQUEUE
// =====================================

function enqueue(
  payload = {}
){

  const item = {

    id:
    createQueueItemId(),

    type:
    String(
      payload.type ||
      "default"
    ),

    data:
    payload.data ??
    null,

    createdAt:
    Date.now()

  };

  enqueueItem(
    item
  );

  incrementEnqueued();

  emit(
    CHAT_EVENTS
    .QUEUE_ENQUEUED,
    structuredClone(
      item
    )
  );

  return structuredClone(
    item
  );

}



// =====================================
// DEQUEUE
// =====================================

function dequeue(){

  const item =
  dequeueItem();

  if(
    !item
  ){
    return null;
  }

  incrementDequeued();

  emit(
    CHAT_EVENTS
    .QUEUE_DEQUEUED,
    structuredClone(
      item
    )
  );

  return structuredClone(
    item
  );

}



// =====================================
// REMOVE
// =====================================

function remove(
  itemId
){

  if(
    !hasQueueItem(
      itemId
    )
  ){
    return false;
  }

  return removeQueueItem(
    itemId
  );

}



// =====================================
// COMPLETE
// =====================================

function complete(
  itemId
){

  const item =
  getQueueItem(
    itemId
  );

  if(
    !item
  ){
    return false;
  }

  incrementCompleted();
  emit(
  CHAT_EVENTS
  .QUEUE_COMPLETED,
  structuredClone(
    item
  )
);

  return true;

}



// =====================================
// FAIL
// =====================================

function fail(
  itemId
){

  const item =
  getQueueItem(
    itemId
  );

  if(
    !item
  ){
    return false;
  }

  incrementFailed();
  emit(
  CHAT_EVENTS
  .QUEUE_FAILED,
  structuredClone(
    item
  )
);

  return true;

}



// =====================================
// PAUSE
// =====================================

function pause(){

  setQueuePaused(
    true
  );

  return true;

}



// =====================================
// RESUME
// =====================================

function resume(){

  setQueuePaused(
    false
  );

  return true;

}



// =====================================
// CLEAR
// =====================================

function clear(){

  clearQueue();

  incrementCleared();

  emit(
    CHAT_EVENTS
    .QUEUE_CLEARED
  );

  return true;

}



// =====================================
// PROCESSING
// =====================================

function startProcessing(){

  setQueueProcessing(
    true
  );

  emit(
    CHAT_EVENTS
    .QUEUE_STARTED
  );

  return true;

}



function stopProcessing(){

  setQueueProcessing(
    false
  );

  setActiveQueueItem(
    null
  );

  return true;

}



// =====================================
// GETTERS
// =====================================

function get(
  itemId
){

  const item =
  getQueueItem(
    itemId
  );

  if(
    !item
  ){
    return null;
  }

  return structuredClone(
    item
  );

}



function getAll(){

  return getQueueItems()
  .map(

    item =>

    structuredClone(
      item
    )

  );

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    size:
    getQueueSize(),

    empty:
    isQueueEmpty()

  });

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return getChatQueueSnapshot();

}



// =====================================
// PUBLIC API
// =====================================

const ChatQueueService =
Object.freeze({

  initialize,

  destroy,

  reset,

  status:
  getStatus,

  snapshot:
  getSnapshot,

  enqueue,

  dequeue,

  remove,

  complete,

  fail,

  pause,

  resume,

  clear,

  startProcessing,

  stopProcessing,

  get,

  getAll

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  reset,

  enqueue,

  dequeue,

  remove,

  complete,

  fail,

  pause,

  resume,

  clear,

  startProcessing,

  stopProcessing,

  get,

  getAll,

  getStatus,

  getSnapshot,

  ChatQueueService

};

export default
ChatQueueService;
