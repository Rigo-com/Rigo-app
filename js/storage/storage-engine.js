// =====================================
// STORAGE ENGINE
// =====================================

const storageEngine =
Object.freeze({

  get(key){

    try{

      return localStorage.getItem(
        key
      );

    }

    catch(error){

      handleStorageError(
        "STORAGE GET ERROR",
        error
      );

      return null;

    }

  },

  set(key,value){

    try{

      localStorage.setItem(
        key,
        value
      );

      return true;

    }

    catch(error){

      handleStorageError(
        "STORAGE SET ERROR",
        error
      );

      return false;

    }

  },

  remove(key){

    try{

      localStorage.removeItem(
        key
      );

      return true;

    }

    catch(error){

      handleStorageError(
        "STORAGE REMOVE ERROR",
        error
      );

      return false;

    }

  }

});



// =====================================
// STORAGE AVAILABILITY
// =====================================

function isStorageAvailable(){

  if(
    storageState.available !==
    null
  ){

    return storageState
    .available;

  }

  try{

    if(
      typeof localStorage ===
      "undefined"
    ){

      storageState.available =
      false;

      return false;

    }

    const testKey =
    "__rigo_storage_test__";

    localStorage.setItem(
      testKey,
      "1"
    );

    localStorage.removeItem(
      testKey
    );

    storageState.available =
    true;

    return true;

  }

  catch(error){

    storageState.available =
    false;

    safeLogError(
      "STORAGE NOT AVAILABLE",
      error
    );

    return false;

  }

}
