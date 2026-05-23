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
    !normalized
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
// STORAGE ENCODING
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

      unescape(

        encodeURIComponent(
          value
        )

      )

    );

  }

  catch(error){

    handleStorageError(
      "STORAGE_ENCODE_ERROR",
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

      escape(
        atob(value)
      )

    );

  }

  catch(error){

    handleStorageError(
      "STORAGE_DECODE_ERROR",
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
    safeJsonParse(
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

      .filter((chat) => {

        return validateChatObject(
          chat
        );

      })

      .sort((a,b) => {

        const first =
        Number(
          b?.updatedAt
        ) || 0;

        const second =
        Number(
          a?.updatedAt
        ) || 0;

        return first - second;

      })

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

    if(
      !serialized
    ){

      return false;

    }

    const encoded =
    encodeStorageValue(
      serialized
    );

    localStorage.setItem(

      STORAGE_KEYS.CHATS,

      encoded

    );

    storageState
    .quotaRecoveries++;

    storageState.cache.chats =
    deepFreeze(

      deepClone(
        reducedChats
      ) || []

    );

    return true;

  }

  catch(error){

    handleStorageError(
      "STORAGE_QUOTA_RECOVERY_ERROR",
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
        "STORAGE_GET_ERROR",
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

    if(

      normalized.length >

      STORAGE_RUNTIME_CONFIG
      .MAX_STORAGE_SIZE

    ){

      handleStorageError(
        "STORAGE_LIMIT_EXCEEDED"
      );

      return false;

    }

    try{

      const encoded =
      encodeStorageValue(
        normalized
      );

      localStorage.setItem(
        key,
        encoded
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

        if(
          recovered
        ){

          try{

            const encoded =
            encodeStorageValue(
              normalized
            );

            localStorage.setItem(
              key,
              encoded
            );

            storageState
            .lastWriteAt =
            Date.now();

            return true;

          }

          catch(retryError){

            storageState
            .failedWrites++;

            handleStorageError(
              "STORAGE_RETRY_FAILED",
              retryError
            );

          }

        }

      }

      storageState
      .failedWrites++;

      handleStorageError(
        "STORAGE_SET_ERROR",
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

      storageState.lastWriteAt =
      Date.now();

      return true;

    }

    catch(error){

      handleStorageError(
        "STORAGE_REMOVE_ERROR",
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
      "STORAGE_NOT_AVAILABLE",
      error
    );

    return false;

  }

}
