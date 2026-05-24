// =====================================
// RIGO AI
// SIDEBAR RENDERER
// ENTERPRISE SIDEBAR RENDER SYSTEM
// =====================================



// =====================================
// SIDEBAR RENDER STATE
// =====================================

const sidebarRenderState =
Object.seal({

  scheduled:false,

  rendering:false,

  pendingFrame:null,

  renderQueue:[],

  completedRenders:0,

  failedRenders:0,

  lastRenderDuration:0

});



// =====================================
// VALIDATE CHAT
// =====================================

function validateSidebarChat(
  chat
){

  return (

    chat

    &&

    typeof chat ===
    "object"

    &&

    typeof chat.id ===
    "string"

  );

}



// =====================================
// SAFE RENDER EXECUTION
// =====================================

function safelyExecuteSidebarRender(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  const startedAt =
  performance.now();

  try{

    callback();

    sidebarRenderState
    .completedRenders++;

    sidebarRuntimeState
    .lastRenderAt =
    Date.now();

    sidebarRenderState
    .lastRenderDuration =

      performance.now() -
      startedAt;

    return true;

  }

  catch(error){

    sidebarRenderState
    .failedRenders++;

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(
      "SIDEBAR RENDER ERROR",
      error
    );

    return false;

  }

}



// =====================================
// PROCESS RENDER QUEUE
// =====================================

function processSidebarRenderQueue(){

  if(
    sidebarRenderState
    .rendering
  ){

    return false;

  }

  if(

    sidebarRenderState
    .renderQueue
    .length <= 0

  ){

    sidebarRenderState
    .scheduled =
    false;

    return true;

  }

  sidebarRenderState
  .rendering =
  true;

  sidebarRuntimeState
  .rendering =
  true;

  const executeQueue = () => {

    try{

      while(

        sidebarRenderState
        .renderQueue
        .length > 0

      ){

        const callback =

          sidebarRenderState
          .renderQueue
          .shift();

        safelyExecuteSidebarRender(
          callback
        );

      }

    }

    finally{

      sidebarRenderState
      .rendering =
      false;

      sidebarRuntimeState
      .rendering =
      false;

      sidebarRenderState
      .scheduled =
      false;

      sidebarRenderState
      .pendingFrame =
      null;

    }

  };

  if(

    typeof requestAnimationFrame !==
    "function"

  ){

    executeQueue();

    return true;

  }

  sidebarRenderState
  .pendingFrame =

  requestAnimationFrame(
    executeQueue
  );

  return true;

}



// =====================================
// QUEUE RENDER
// =====================================

function queueSidebarRender(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  sidebarRenderState
  .renderQueue
  .push(
    callback
  );

  if(
    !sidebarRenderState
    .scheduled
  ){

    sidebarRenderState
    .scheduled =
    true;

    processSidebarRenderQueue();

  }

  return true;

}



// =====================================
// GET SORTED CHATS
// =====================================

function getSortedChats(){

  const chats =
  getAllChats();

  if(
    !Array.isArray(chats)
  ){

    return [];

  }

  return [...chats]

  .filter(
    validateSidebarChat
  )

  .sort((a,b) => {

    return (

      (b.updatedAt || 0)

      -

      (a.updatedAt || 0)

    );

  })

  .slice(

    0,

    SIDEBAR_CONFIG
    .MAX_HISTORY_ITEMS

  );

}



// =====================================
// CHAT TITLE
// =====================================

function getSidebarChatTitle(
  chat
){

  if(

    chat

    &&

    typeof chat.title ===
    "string"

    &&

    chat.title.trim()

  ){

    return chat.title;

  }

  return (

    document.body.dir ===
    "rtl"

    ?

    "محادثة جديدة"

    :

    "New Chat"

  );

}



// =====================================
// EMPTY HISTORY
// =====================================

function renderEmptySidebarHistory(){

  const historyList =
  SidebarElements
  .getHistoryList();

  if(!historyList){

    return false;

  }

  const empty =
  document.createElement(
    "div"
  );

  empty.classList.add(
    "empty-history"
  );

  empty.textContent =

    document.body.dir ===
    "rtl"

    ?

    "لا توجد محادثات"

    :

    "No chats yet";

  historyList
  .appendChild(
    empty
  );

  return true;

}



// =====================================
// HISTORY ACTIONS
// =====================================

function createSidebarHistoryActions(
  chatId
){

  const wrapper =
  document.createElement(
    "div"
  );

  wrapper.classList.add(
    "history-actions"
  );

  const deleteButton =
  document.createElement(
    "button"
  );

  deleteButton.type =
  "button";

  deleteButton.classList.add(
    "delete-chat-button"
  );

  deleteButton.dataset
  .chatId =
  chatId;

  deleteButton.textContent =
  "×";

  deleteButton.setAttribute(
    "aria-label",
    "Delete chat"
  );

  wrapper.appendChild(
    deleteButton
  );

  return wrapper;

}



// =====================================
// HISTORY ITEM
// =====================================

function createSidebarHistoryItem(
  chat
){

  if(
    !validateSidebarChat(
      chat
    )
  ){

    return null;

  }

  const item =
  document.createElement(
    "div"
  );

  const isActive =

    currentChat?.id ===
    chat.id;

  item.classList.add(
    "history-item"
  );

  if(isActive){

    item.classList.add(
      "active-history-item"
    );

  }

  item.dataset.chatId =
  chat.id;

  item.setAttribute(
    "role",
    "button"
  );

  item.setAttribute(
    "tabindex",
    "0"
  );

  item.setAttribute(
    "aria-selected",
    String(isActive)
  );

  const title =
  document.createElement(
    "div"
  );

  title.classList.add(
    "history-title"
  );

  title.textContent =
  getSidebarChatTitle(
    chat
  );

  item.appendChild(
    title
  );

  item.appendChild(

    createSidebarHistoryActions(
      chat.id
    )

  );

  if(isActive){

    SidebarElements
    .setActiveItem(
      item
    );

  }

  sidebarCacheState
  .historyElements
  .set(
    chat.id,
    item
  );

  sidebarCacheState
  .renderedChats
  .set(
    chat.id,
    chat
  );

  return item;

}



// =====================================
// RENDER HISTORY
// =====================================

function renderSidebarHistory(){

  return queueSidebarRender(
    () => {

      const historyList =
      SidebarElements
      .getHistoryList();

      if(!historyList){

        return false;

      }

      SidebarElements
      .clearHistory();

      const chats =
      getSortedChats();

      if(
        chats.length <= 0
      ){

        return renderEmptySidebarHistory();

      }

      const fragment =
      document.createDocumentFragment();

      chats.forEach((chat) => {

        const item =
        createSidebarHistoryItem(
          chat
        );

        if(item){

          fragment.appendChild(
            item
          );

        }

      });

      historyList
      .appendChild(
        fragment
      );

      return true;

    }
  );

}



// =====================================
// RENDER MESSAGES
// =====================================

function renderSidebarMessages(){

  return queueSidebarRender(
    () => {

      if(
        !chatContainer
      ){

        return false;

      }

      clearTypingIndicator();

      chatContainer
      .replaceChildren();

      if(

        !Array.isArray(
          currentChat
          ?.messages
        )

      ){

        return false;

      }

      const fragment =
      document.createDocumentFragment();

      currentChat.messages
      .forEach((message) => {

        if(
          typeof validateMessage ===
          "function"

          &&

          !validateMessage(
            message
          )
        ){

          return;
        }

        const element =
        createMessageElement(
          message
        );

        if(element){

          fragment.appendChild(
            element
          );

        }

      });

      chatContainer
      .appendChild(
        fragment
      );

      if(
        typeof scrollToBottom ===
        "function"
      ){

        scrollToBottom();

      }

      return true;

    }
  );

}



// =====================================
// CANCEL RENDER
// =====================================

function cancelSidebarRender(){

  if(

    typeof cancelAnimationFrame ===
    "function"

    &&

    sidebarRenderState
    .pendingFrame

  ){

    cancelAnimationFrame(

      sidebarRenderState
      .pendingFrame

    );

  }

  sidebarRenderState
  .pendingFrame =
  null;

  sidebarRenderState
  .scheduled =
  false;

  return true;

}



// =====================================
// CLEAR RENDER QUEUE
// =====================================

function clearSidebarRenderQueue(){

  sidebarRenderState
  .renderQueue
  .length = 0;

  return true;

}



// =====================================
// RENDER DIAGNOSTICS
// =====================================

function getSidebarRenderDiagnostics(){

  return Object.freeze({

    scheduled:

      sidebarRenderState
      .scheduled,

    rendering:

      sidebarRenderState
      .rendering,

    queueSize:

      sidebarRenderState
      .renderQueue
      .length,

    completedRenders:

      sidebarRenderState
      .completedRenders,

    failedRenders:

      sidebarRenderState
      .failedRenders,

    lastRenderDuration:

      sidebarRenderState
      .lastRenderDuration

  });

}



// =====================================
// PUBLIC API
// =====================================

const SidebarRenderer =
Object.freeze({

  renderHistory:
  renderSidebarHistory,

  renderMessages:
  renderSidebarMessages,

  queue:
  queueSidebarRender,

  cancel:
  cancelSidebarRender,

  clearQueue:
  clearSidebarRenderQueue,

  diagnostics:
  getSidebarRenderDiagnostics

});
