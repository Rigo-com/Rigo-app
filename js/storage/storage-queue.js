// =====================================
// STORAGE QUEUE CONFIG
// =====================================

const MAX_STORAGE_QUEUE_SIZE =
1000;

const MAX_STORAGE_BATCH_SIZE =
50;



// =====================================
// STORAGE WRITE QUEUE
// =====================================

function enqueueStorageWrite(
  callback
){

  if(
    storageState.destroyed
  ){

    return false;

  }

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(

    storageState
    .writeQueue
    .length >=

    MAX_STORAGE_QUEUE_SIZE

  ){

    storageState
    .failedWrites++;

    handleStorageError(
      "STORAGE_QUEUE_LIMIT_EXCEEDED"
    );

    return false;

  }

  storageState
  .writeQueue
  .push(callback);

  processStorageQueue();

  return true;

}



// =====================================
// CLEAR STORAGE QUEUE
// =====================================

function clearStorageQueue(){

  storageState
  .writeQueue
  .length = 0;

  if(
    storageState.writeTimer
  ){

    clearTimeout(
      storageState.writeTimer
    );

    storageState.writeTimer =
    null;

  }

  storageState.writing =
  false;

  return true;

}



// =====================================
// PROCESS STORAGE QUEUE
// =====================================

function processStorageQueue(){

  if(
    storageState.destroyed
  ){

    clearStorageQueue();

    return;

  }

  if(
    storageState.writing
  ){

    return;

  }

  if(
    storageState.writeTimer
  ){

    return;

  }

  storageState.writeTimer =
  setTimeout(async () => {

    storageState.writeTimer =
    null;

    if(
      storageState.destroyed
    ){

      clearStorageQueue();

      return;

    }

    if(
      storageState.writing
    ){

      return;

    }

    storageState.writing =
    true;

    try{

      let processed =
      0;

      while(

        storageState
        .writeQueue
        .length > 0

      ){

        if(
          storageState.destroyed
        ){

          clearStorageQueue();

          break;

        }

        if(

          processed >=
          MAX_STORAGE_BATCH_SIZE

        ){

          break;

        }

        const callback =

          storageState
          .writeQueue
          .shift();

        if(
          typeof callback !==
          "function"
        ){

          continue;

        }

        try{

          const result =
          await Promise.resolve(
            callback()
          );

          if(
            result === false
          ){

            storageState
            .failedWrites++;

          }

        }

        catch(error){

          storageState
          .failedWrites++;

          handleStorageError(
            "STORAGE_QUEUE_ERROR",
            error
          );

        }

        processed++;

      }

      storageState.lastSyncAt =
      Date.now();

    }

    finally{

      storageState.writing =
      false;

      if(

        !storageState.destroyed

        &&

        storageState
        .writeQueue
        .length > 0

      ){

        processStorageQueue();

      }

    }

  },

  STORAGE_RUNTIME_CONFIG
  .WRITE_DEBOUNCE_MS);

}
