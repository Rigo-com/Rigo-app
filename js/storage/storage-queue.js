// =====================================
// STORAGE WRITE QUEUE
// =====================================

function enqueueStorageWrite(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

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
    storageState.writing
  ){

    return;
  }

  clearTimeout(
    storageState.writeTimer
  );

  storageState.writeTimer =
  setTimeout(async () => {

    storageState.writing =
    true;

    try{

      while(

        storageState
        .writeQueue
        .length > 0

      ){

        const callback =

          storageState
          .writeQueue
          .shift();

        try{

          await Promise.resolve(
            callback()
          );

        }

        catch(error){

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

    }

  },

  STORAGE_RUNTIME_CONFIG
  .WRITE_DEBOUNCE_MS);

}
