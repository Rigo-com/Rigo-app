// =====================================
// STORAGE KEY VALIDATION
// =====================================

function validateStorageKey(
  key
){

  if(
    typeof key !==
    "string"
  ){

    return false;

  }

  const normalized =
  key.trim();

  if(
    normalized.length <= 0
  ){

    return false;

  }

  if(
    normalized.length > 200
  ){

    return false;

  }

  return true;

}



// =====================================
// NORMALIZE STORAGE VALUE
// =====================================

function normalizeStorageValue(
  value
){

  if(
    typeof value ===
    "string"
  ){

    return value;

  }

  try{

    return String(value);

  }

  catch(error){

    return null;

  }

}



// =====================================
// STORAGE ENCRYPTION
// =====================================

function encodeStorageValue(
  value
){

  if(

    !STORAGE_RUNTIME_CONFIG
    .ENABLE_ENCRYPTION

  ){

    return value;

  }

  try{

    return btoa(

      encodeURIComponent(
        value
      )

    );

  }

  catch(error){

    handleStorageError(
      "STORAGE ENCODE ERROR",
      error
    );

    return value;

  }

}



function decodeStorageValue(
  value
){

  if(

    !STORAGE_RUNTIME_CONFIG
    .ENABLE_ENCRYPTION

  ){

    return value;

  }

  try{

    return decodeURIComponent(

      atob(value)

    );

  }

  catch(error){

    handleStorageError(
      "STORAGE DECODE ERROR",
      error
    );

    return null;

  }

}



// =====================================
// STORAGE QUOTA RECOVERY
// =====================================

function recoverStorageQuota(){

  try{

    const rawChats =
    storageEngine.get(
      STORAGE_KEYS.CHATS
    );

    if(
      typeof rawChats !==
      "string"
    ){

      return false;

    }

    const parsedChats =
    safeJSONParse(
      rawChats,
      []
    );

    if(
      !Array.isArray(
        parsedChats
      )
    ){

      return false;

    }

    const reducedChats =
    parsedChats

    .filter(
      validateChatObject
    )

    .sort(
      (a,b) =>

      b.updatedAt -
      a.updatedAt

    )

    .slice(

      0,

      Math.max(
        10,
        Math.floor(
          parsedChats.length / 2
        )
      )

    );

    const serialized =
    safeStorageSerialize(
      reducedChats
    );

    if(!serialized){

      return false;

    }

    localStorage.setItem(

      STORAGE_KEYS.CHATS,

      encodeStorageValue(
        serialized
      )

    );

    storageState
    .quotaRecoveries++;

    storageState.cache.chats =
    deepClone(
      reducedChats
    ) || [];

    return true;

  }

  catch(error){

    handleStorageError(
      "STORAGE QUOTA RECOVERY ERROR",
      error
    );

    return false;

  }

}



// =====================================
// STORAGE ENGINE
// =====================================

const storageEngine =
Object.freeze({

  get(key){

    if(
      !isStorageAvailable()
    ){

      return null;

    }

    if(
      !validateStorageKey(
        key
      )
    ){

      return null;

    }

    try{

      const value =
      localStorage.getItem(
        key
      );

      if(
        typeof value !==
        "string"
      ){

        return null;

      }

      return decodeStorageValue(
        value
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

    if(
      !isStorageAvailable()
    ){

      return false;

    }

    if(
      !validateStorageKey(
        key
      )
    ){

      return false;

    }

    const normalized =
    normalizeStorageValue(
      value
    );

    if(
      normalized ===
      null
    ){

      return false;

    }

    try{

      localStorage.setItem(

        key,

        encodeStorageValue(
          normalized
        )

      );

      storageState.lastWriteAt =
      Date.now();

      return true;

    }

    catch(error){

      const quotaExceeded =

        error?.name ===
        "QuotaExceededError"

        ||

        error?.code === 22;

      if(
        quotaExceeded
      ){

        const recovered =
        recoverStorageQuota();

        if(recovered){

          try{

            localStorage.setItem(

              key,

              encodeStorageValue(
                normalized
              )

            );

            storageState.lastWriteAt =
            Date.now();

            return true;

          }

          catch(retryError){

            storageState
            .failedWrites++;

            handleStorageError(
              "STORAGE RETRY FAILED",
              retryError
            );

          }

        }

      }

      storageState
      .failedWrites++;

      handleStorageError(
        "STORAGE SET ERROR",
        error
      );

      return false;

    }

  },

  remove(key){

    if(
      !isStorageAvailable()
    ){

      return false;

    }

    if(
      !validateStorageKey(
        key
      )
    ){

      return false;

    }

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
