// =====================================
// RIGO AI
// SIDEBAR ACTIONS
// ENTERPRISE SIDEBAR BUSINESS LOGIC
// =====================================



// =====================================
// SIDEBAR OPERATION LOCK
// =====================================

async function executeSidebarOperation(
  operation,
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  const operationId =
  createSidebarOperationId();

  trackSidebarOperation(
    operationId
  );

  sidebarRuntimeState[
    operation
  ] = true;

  sidebarRuntimeState
  .lastActionAt =
  Date.now();

  try{

    return await callback(
      operationId
    );

  }

  catch(error){

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(
      "SIDEBAR ACTION ERROR",
      error
    );

    return false;

  }

  finally{

    completeSidebarOperation(
      operationId
    );

    sidebarRuntimeState[
      operation
    ] = false;

  }

}



// =====================================
// ABORT ACTIVE GENERATION
// =====================================

async function abortSidebarGeneration(){

  try{

    if(
      typeof abortMessageGeneration ===
      "function"
    ){

      await abortMessageGeneration();

    }

    return true;

  }

  catch(error){

    safeLogError(
      error
    );

    return false;

  }

}



// =====================================
// SAVE ACTIVE CHAT
// =====================================

async function saveSidebarActiveChat(){

  try{

    const hasMessages =

      Array.isArray(
        currentChat?.messages
      )

      &&

      currentChat.messages
      .length > 0;

    if(!hasMessages){

      return true;

    }

    return await Promise.resolve(
      saveCurrentChat()
    );

  }

  catch(error){

    safeLogError(
      error
    );

    return false;

  }

}



// =====================================
// RESET CHAT SESSION
// =====================================

async function resetSidebarChatSession(){

  clearTypingIndicator();

  await Promise.resolve(
    resetCurrentChat()
  );

  SidebarRenderer
  .renderMessages();

  SidebarRenderer
  .renderHistory();

  SidebarElements
  .focusInput();

  clearSidebarActiveChat();

  return true;

}



// =====================================
// CREATE NEW CHAT
// =====================================

async function createNewChat(){

  return executeSidebarOperation(
    "creating",
    async () => {

      await abortSidebarGeneration();

      await saveSidebarActiveChat();

      await resetSidebarChatSession();

      safeLogInfo(
        "NEW CHAT CREATED"
      );

      return true;

    }
  );

}



// =====================================
// LOAD CHAT
// =====================================

async function loadChat(
  chatId
){

  if(
    typeof chatId !==
    "string"
  ){

    return false;

  }

  if(
    currentChat?.id ===
    chatId
  ){

    return true;

  }

  return executeSidebarOperation(
    "loading",
    async () => {

      await abortSidebarGeneration();

      await saveSidebarActiveChat();

      clearTypingIndicator();

      const chats =
      getAllChats();

      if(
        !Array.isArray(
          chats
        )
      ){

        return false;

      }

      const selectedChat =
      chats.find((chat) => {

        return (
          chat?.id ===
          chatId
        );

      });

      if(!selectedChat){

        return false;

      }

      const clonedChat =
      deepClone(
        selectedChat
      );

      if(!clonedChat){

        return false;

      }

      currentChat =
      clonedChat;

      setSidebarActiveChat(
        chatId
      );

      SidebarRenderer
      .renderMessages();

      SidebarRenderer
      .renderHistory();

      SidebarElements
      .focusInput();

      safeLogInfo(
        "CHAT LOADED"
      );

      return true;

    }
  );

}



// =====================================
// DELETE CHAT
// =====================================

async function deleteChat(
  chatId
){

  if(
    typeof chatId !==
    "string"
  ){

    return false;

  }

  return executeSidebarOperation(
    "deleting",
    async () => {

      await abortSidebarGeneration();

      const chats =
      getAllChats();

      if(
        !Array.isArray(
          chats
        )
      ){

        return false;

      }

      const filteredChats =
      chats.filter((chat) => {

        return (
          chat?.id !==
          chatId
        );

      });

      const saved =
      saveAllChats(
        filteredChats
      );

      if(!saved){

        return false;

      }

      sidebarCacheState
      .historyElements
      .delete(
        chatId
      );

      sidebarCacheState
      .renderedChats
      .delete(
        chatId
      );

      const deletingCurrentChat =

        currentChat?.id ===
        chatId;

      if(
        deletingCurrentChat
      ){

        clearTypingIndicator();

        const nextChat =
        filteredChats[0];

        if(nextChat){

          const clonedChat =
          deepClone(
            nextChat
          );

          if(!clonedChat){

            return false;

          }

          currentChat =
          clonedChat;

          setSidebarActiveChat(
            clonedChat.id
          );

        }

        else{

          await Promise.resolve(
            resetCurrentChat()
          );

          clearSidebarActiveChat();

        }

      }

      SidebarRenderer
      .renderHistory();

      SidebarRenderer
      .renderMessages();

      SidebarElements
      .focusInput();

      safeLogInfo(
        "CHAT DELETED"
      );

      return true;

    }
  );

}



// =====================================
// REFRESH SIDEBAR
// =====================================

function refreshSidebar(){

  SidebarRenderer
  .renderHistory();

  SidebarRenderer
  .renderMessages();

  return true;

}



// =====================================
// SIDEBAR ACTION DIAGNOSTICS
// =====================================

function getSidebarActionDiagnostics(){

  return Object.freeze({

    activeChatId:

      sidebarRuntimeState
      .activeChatId,

    pendingOperations:

      sidebarCacheState
      .pendingOperations
      .size,

    creating:

      sidebarRuntimeState
      .creating,

    loading:

      sidebarRuntimeState
      .loading,

    deleting:

      sidebarRuntimeState
      .deleting

  });

}



// =====================================
// PUBLIC API
// =====================================

const SidebarActions =
Object.freeze({

  createChat:
  createNewChat,

  loadChat,

  deleteChat,

  refresh:
  refreshSidebar,

  abortGeneration:
  abortSidebarGeneration,

  diagnostics:
  getSidebarActionDiagnostics

});
