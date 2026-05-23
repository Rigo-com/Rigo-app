// =====================================
// DEEP FREEZE MEMORY
// =====================================

function deepFreezeMemory(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(
    Object.isFrozen(
      value
    )
  ){

    return value;

  }

  visited.add(
    value
  );

  Reflect
  .ownKeys(value)
  .forEach((key) => {

    deepFreezeMemory(

      value[key],

      visited

    );

  });

  return Object.freeze(
    value
  );

}



// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(memory){

  if(

    storageState.destroyed ||

    !storageState.initialized

  ){

    return false;

  }

  const validationResult =
  validateMemoryObject(
    memory
  );

  if(
    !validationResult?.valid
  ){

    return false;

  }

  try{

    const safeMemory =
    deepClone(memory);

    if(
      !safeMemory
    ){

      return false;

    }

    const serialized =
    safeStorageSerialize(
      safeMemory
    );

    if(
      !serialized
    ){

      handleStorageError(
        "MEMORY_SERIALIZATION_FAILED"
      );

      return false;

    }

    if(

      serialized.length >

      STORAGE_RUNTIME_CONFIG
      .MAX_STORAGE_SIZE

    ){

      handleStorageError(
        "MEMORY_STORAGE_LIMIT_EXCEEDED"
      );

      return false;

    }

    const currentSerialized =
    safeStorageSerialize(

      storageState
      .cache
      .memory

    );

    if(
      serialized ===
      currentSerialized
    ){

      return true;

    }

    storageState.cache.memory =
    deepFreezeMemory(
      safeMemory
    );

    const writeVersion =
    Date.now();

    storageState
    .lastMemoryWriteVersion =
    writeVersion;

    enqueueStorageWrite(
      () => {

        if(
          storageState.destroyed
        ){

          return false;

        }

        if(

          storageState
          .lastMemoryWriteVersion !==
          writeVersion

        ){

          return false;

        }

        return storageEngine.set(

          STORAGE_KEYS.MEMORY,

          serialized

        );

      }
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "SAVE_MEMORY_ERROR",
      error
    );

    return false;

  }

}



// =====================================
// LOAD MEMORY
// =====================================

function loadMemory(){

  if(
    storageState.destroyed
  ){

    return {};

  }

  try{

    const cachedMemory =

      storageState
      ?.cache
      ?.memory;

    if(

      cachedMemory

      &&

      typeof cachedMemory ===
      "object"

      &&

      Reflect
      .ownKeys(
        cachedMemory
      )
      .length > 0

    ){

      return (

        deepClone(
          cachedMemory
        ) || {}

      );

    }

    const memory =
    loadMemoryFromStorage();

    const clonedMemory =
    deepClone(
      memory
    );

    if(
      !clonedMemory
    ){

      return {};

    }

    storageState.cache.memory =
    deepFreezeMemory(
      clonedMemory
    );

    return (

      deepClone(
        clonedMemory
      ) || {}

    );

  }

  catch(error){

    handleStorageError(
      "LOAD_MEMORY_RUNTIME_ERROR",
      error
    );

    return {};

  }

}



// =====================================
// LOAD MEMORY STORAGE
// =====================================

function loadMemoryFromStorage(){

  if(
    storageState.destroyed
  ){

    return {};

  }

  if(
    !isStorageAvailable()
  ){

    return {};

  }

  try{

    const data =
    storageEngine.get(

      STORAGE_KEYS.MEMORY

    );

    if(
      !data
    ){

      return {};

    }

    const parsedData =
    safeJsonParse(
      data,
      {}
    );

    const validationResult =
    validateMemoryObject(
      parsedData
    );

    if(
      !validationResult?.valid
    ){

      if(
        typeof clearCorruptedMemory ===
        "function"
      ){

        clearCorruptedMemory();

      }

      return {};

    }

    return parsedData;

  }

  catch(error){

    if(
      typeof clearCorruptedMemory ===
      "function"
    ){

      clearCorruptedMemory();

    }

    handleStorageError(
      "LOAD_MEMORY_ERROR",
      error
    );

    return {};

  }

}
