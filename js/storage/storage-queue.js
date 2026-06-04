// =====================================
// RIGO AI
// STORAGE QUEUE
// OPERATION QUEUE LAYER
// =====================================

import {
  STORAGE_LIMITS
}
from "./storage-config.js";



// =====================================
// QUEUE
// =====================================

const operationQueue =
[];



// =====================================
// ENQUEUE
// =====================================

function enqueueOperation(
  operation
){

  if(
    !operation
  ){
    return false;
  }

  if(

    operationQueue
    .length >=

    STORAGE_LIMITS
    .MAX_QUEUE_SIZE

  ){

    operationQueue
    .shift();

  }

  operationQueue.push({

    ...operation,

    queuedAt:
    Date.now()

  });

  return true;

}



// =====================================
// DEQUEUE
// =====================================

function dequeueOperation(){

  return (

    operationQueue
    .shift()

    ??

    null

  );

}



// =====================================
// PEEK
// =====================================

function peekOperation(){

  return (

    operationQueue[0]

    ??

    null

  );

}



// =====================================
// CLEAR
// =====================================

function clearQueue(){

  operationQueue
  .length = 0;

  return true;

}



// =====================================
// STATUS
// =====================================

function isQueueEmpty(){

  return (

    operationQueue
    .length === 0

  );

}



function getQueueSize(){

  return operationQueue
  .length;

}



// =====================================
// SNAPSHOT
// =====================================

function getQueueSnapshot(){

  return Object.freeze(

    operationQueue.map(

      operation => ({

        ...operation

      })

    )

  );

}



// =====================================
// STATS
// =====================================

function getQueueStats(){

  return Object.freeze({

    size:
    operationQueue.length,

    empty:
    isQueueEmpty()

  });

}



// =====================================
// PUBLIC API
// =====================================

const StorageQueue =
Object.freeze({

  enqueueOperation,

  dequeueOperation,

  peekOperation,

  clearQueue,

  isQueueEmpty,

  getQueueSize,

  getQueueSnapshot,

  getQueueStats

});



// =====================================
// EXPORTS
// =====================================

export {

  enqueueOperation,

  dequeueOperation,

  peekOperation,

  clearQueue,

  isQueueEmpty,

  getQueueSize,

  getQueueSnapshot,

  getQueueStats,

  StorageQueue

};

export default
StorageQueue;
