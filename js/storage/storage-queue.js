// =====================================
// STORAGE QUEUE CONFIG
// =====================================

const MAX_STORAGE_QUEUE_SIZE =
1000;



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
      "STORAGE QUEUE LIMIT EXCEEDED"
    );

    return false;

  }

  storageState.writeQueue
  .push(callback);

  processStorageQueue();

  return true;

}



// =====================================
// PROCESS STORAGE QUEUE
// =====================================

function processStorageQueue(){

  if(
    storageState.destroyed
  ){

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

    clearTimeout(
      storageState.writeTimer
    );

    storageState.writeTimer =
    null;

  }

  storageState.writeTimer =
  setTimeout(async () => {

    if(
      storageState.destroyed
    ){

      return;
    }

    storageState.writing =
    true;

    try{

      while(

        storageState
        .writeQueue
        .length > 0

      ){

        if(
          storageState.destroyed
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

          await Promise.resolve(
            callback()
          );

        }

        catch(error){

          storageState
          .failedWrites++;

          handleStorageError(
            "STORAGE QUEUE ERROR",
            error
          );

        }

      }

      storageState.lastSyncAt =
      Date.now();

    }

    finally{

      storageState.writing =
      false;

      storageState.writeTimer =
      null;

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
