// =====================================
// SAVE CHATS
// =====================================

function saveChats(chats){

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
    !Array.isArray(chats)
  ){

    return false;

  }

  try{

    const uniqueChats =
    deduplicateChats(
      chats
    );

    const validatedChats =
    uniqueChats

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

      STORAGE_RUNTIME_CONFIG
      .MAX_CACHE_CHATS

    );

    const serialized =
    safeStorageSerialize(
      validatedChats
    );

    if(!serialized){

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

    if(!clonedChats){

      return false;

    }

    storageState.cache.chats =
    Object.freeze(
      clonedChats
    );

    enqueueStorageWrite(
      () => {

        if(
          storageState.destroyed
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
      "SAVE CHATS ERROR",
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

    if(

      storageState
      .cache
      .chats
      .length > 0

    ){

      return deepClone(

        storageState
        .cache
        .chats

      ) || [];

    }

    const chats =
    loadChatsFromStorage();

    const clonedChats =
    deepClone(
      chats
    );

    storageState.cache.chats =
    Object.freeze(
      clonedChats || []
    );

    return deepClone(
      chats
    ) || [];

  }

  catch(error){

    handleStorageError(
      "LOAD CHATS RUNTIME ERROR",
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
          "STORAGE MIGRATION ERROR",
          migrationError
        );

      }

    }

    const data =
    storageEngine.get(

      STORAGE_KEYS.CHATS

    );

    if(!data){

      return [];

    }

    const parsedData =
    safeJSONParse(
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

    .filter(
      validateChatObject
    )

    .sort(
      (a,b) =>

      b.updatedAt -
      a.updatedAt

    );

  }

  catch(error){

    if(
      typeof clearCorruptedChats ===
      "function"
    ){

      clearCorruptedChats();

    }

    handleStorageError(
      "LOAD CHATS ERROR",
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

    if(!safeChat){

      return false;

    }

    safeChat.updatedAt =
    Date.now();

    const chats =
    loadChats();

    const existingIndex =
    chats.findIndex(
      (chat) => {

        return (
          chat.id ===
          safeChat.id
        );

      }
    );

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
      "SAVE CURRENT CHAT ERROR",
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
    normalizedId.length <= 0
  ){

    return null;

  }

  try{

    const chats =
    loadChats();

    const chat =
    chats.find((item) => {

      return (
        item.id ===
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

    return deepClone(
      chat
    );

  }

  catch(error){

    handleStorageError(
      "GET CHAT ERROR",
      error
    );

    return null;

  }

}
