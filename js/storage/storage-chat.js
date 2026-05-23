// =====================================
// SAVE CHATS
// =====================================

function saveChats(chats){

  if(
    storageState.destroyed ||
    !storageState.initialized
  ){

    return false;

  }

  if(
    !Array.isArray(chats)
  ){

    return false;

  }

  try{

    const validatedChats =

      deduplicateChats(chats)

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

        STORAGE_RUNTIME_CONFIG
        .MAX_CACHE_CHATS

      );

    const serialized =
    safeStorageSerialize(
      validatedChats
    );

    if(
      !serialized
    ){

      return false;

    }

    const serializedSize =
    serialized.length;

    if(

      serializedSize >

      STORAGE_RUNTIME_CONFIG
      .MAX_STORAGE_SIZE

    ){

      handleStorageError(
        "STORAGE_LIMIT_EXCEEDED"
      );

      return false;

    }

    const currentSerialized =
    safeStorageSerialize(

      storageState
      .cache
      .chats

    );

    if(
      serialized ===
      currentSerialized
    ){

      return true;

    }

    const clonedChats =
    deepClone(
      validatedChats
    );

    if(
      !Array.isArray(
        clonedChats
      )
    ){

      return false;

    }

    storageState.cache.chats =
    deepFreeze(
      clonedChats
    );

    const writeVersion =
    Date.now();

    storageState
    .lastWriteVersion =
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
          .lastWriteVersion !==
          writeVersion

        ){

          return false;

        }

        const saved =
        storageEngine.set(

          STORAGE_KEYS.CHATS,

          serialized

        );

        if(!saved){

          return false;

        }

        storageEngine.set(

          STORAGE_KEYS.VERSION,

          STORAGE_RUNTIME_CONFIG
          .VERSION

        );

        return true;

      }
    );

    return true;

  }

  catch(error){

    handleStorageError(
      "SAVE_CHATS_ERROR",
      error
    );

    return false;

  }

}



// =====================================
// LOAD CHATS
// =====================================

function loadChats(){

  if(
    storageState.destroyed
  ){

    return [];

  }

  try{

    const cachedChats =

      storageState
      ?.cache
      ?.chats;

    if(
      Array.isArray(
        cachedChats
      )

      &&

      cachedChats.length > 0
    ){

      return (
        deepClone(
          cachedChats
        ) || []
      );

    }

    const chats =
    loadChatsFromStorage();

    const clonedChats =
    deepClone(
      chats
    );

    storageState.cache.chats =
    deepFreeze(
      clonedChats || []
    );

    return (
      deepClone(
        clonedChats
      ) || []
    );

  }

  catch(error){

    handleStorageError(
      "LOAD_CHATS_RUNTIME_ERROR",
      error
    );

    return [];

  }

}



// =====================================
// LOAD CHATS STORAGE
// =====================================

function loadChatsFromStorage(){

  if(
    storageState.destroyed
  ){

    return [];

  }

  if(
    !isStorageAvailable()
  ){

    return [];

  }

  try{

    if(
      typeof migrateStorage ===
      "function"
    ){

      try{

        migrateStorage();

      }

      catch(migrationError){

        handleStorageError(
          "STORAGE_MIGRATION_ERROR",
          migrationError
        );

      }

    }

    const data =
    storageEngine.get(

      STORAGE_KEYS.CHATS

    );

    if(
      !data
    ){

      return [];

    }

    const parsedData =
    safeJsonParse(
      data,
      []
    );

    if(
      !Array.isArray(
        parsedData
      )
    ){

      if(
        typeof clearCorruptedChats ===
        "function"
      ){

        clearCorruptedChats();

      }

      return [];

    }

    return parsedData

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

    });

  }

  catch(error){

    if(
      typeof clearCorruptedChats ===
      "function"
    ){

      clearCorruptedChats();

    }

    handleStorageError(
      "LOAD_CHATS_ERROR",
      error
    );

    return [];

  }

}



// =====================================
// SAVE CURRENT CHAT
// =====================================

function saveCurrentChat(){

  if(
    storageState.destroyed
  ){

    return false;

  }

  try{

    if(

      typeof currentChat ===
      "undefined"

      ||

      !validateChatObject(
        currentChat
      )

    ){

      return false;

    }

    const safeChat =
    deepClone(
      currentChat
    );

    if(
      !safeChat
    ){

      return false;

    }

    safeChat.updatedAt =
    Date.now();

    const chats =
    loadChats();

    const existingIndex =
    chats.findIndex((chat) => {

      return (
        chat.id ===
        safeChat.id
      );

    });

    if(
      existingIndex >= 0
    ){

      chats[
        existingIndex
      ] = safeChat;

    }

    else{

      chats.unshift(
        safeChat
      );

    }

    return saveChats(
      chats
    );

  }

  catch(error){

    handleStorageError(
      "SAVE_CURRENT_CHAT_ERROR",
      error
    );

    return false;

  }

}



// =====================================
// GET CHAT
// =====================================

function getChatById(
  chatId
){

  if(
    storageState.destroyed
  ){

    return null;

  }

  if(
    typeof chatId !==
    "string"
  ){

    return null;

  }

  const normalizedId =
  chatId.trim();

  if(
    !normalizedId
  ){

    return null;

  }

  try{

    const chats =
    loadChats();

    const chat =
    chats.find((item) => {

      return (
        item?.id ===
        normalizedId
      );

    });

    if(
      !validateChatObject(
        chat
      )
    ){

      return null;

    }

    return (
      deepClone(chat)
      || null
    );

  }

  catch(error){

    handleStorageError(
      "GET_CHAT_ERROR",
      error
    );

    return null;

  }

}
