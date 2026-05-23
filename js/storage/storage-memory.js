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

  visited.add(value);

  Object.keys(value)
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
    storageState.destroyed
  ){

    return false;

  }

  if(
    !storageState.initialized
  ){

    return false;

  }

  if(
    !validateMemoryObject(
      memory
    )
  ){

    return false;

  }

  try{

    const safeMemory =
    deepClone(memory);

    if(!safeMemory){

      return false;

    }

    const serialized =
    safeStorageSerialize(
      safeMemory
    );

    if(!serialized){

      handleStorageError(
        "MEMORY SERIALIZATION FAILED"
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

    enqueueStorageWrite(
      () => {

        if(
          storageState.destroyed
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
      "SAVE MEMORY ERROR",
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
      .cache
      .memory;

    if(

      cachedMemory

      &&

      Object.keys(
        cachedMemory
      ).length > 0

    ){

      return deepClone(
        cachedMemory
      ) || {};

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

    return deepClone(
      clonedMemory
    ) || {};

  }

  catch(error){

    handleStorageError(
      "LOAD MEMORY RUNTIME ERROR",
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

    if(!data){

      return {};
    }

    const parsedData =
    safeJSONParse(
      data,
      {}
    );

    if(
      !validateMemoryObject(
        parsedData
      )
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
      "LOAD MEMORY ERROR",
      error
    );

    return {};

  }

}
