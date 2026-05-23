// =====================================
// RIGO AI
// SIDEBAR HISTORY RUNTIME
// ENTERPRISE UI SYSTEM FINAL
// =====================================



// =====================================
// SIDEBAR STATE
// =====================================

const sidebarState =
Object.seal({

  initialized:false,

  listenersAttached:false,

  chatHistoryList:null,

  newChatButton:null,

  newChatHandler:null,

  historyElements:
  new Map()

});



// =====================================
// INITIALIZE ELEMENTS
// =====================================

function initializeSidebarElements(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  sidebarState
  .chatHistoryList =

    document.getElementById(
      "chatHistoryList"
    );

  sidebarState
  .newChatButton =

    document.getElementById(
      "newChatButton"
    );

  return true;

}



// =====================================
// VALIDATE ELEMENTS
// =====================================

function validateSidebarElements(){

  if(

    !sidebarState
    .chatHistoryList

  ){

    logError(
      "chatHistoryList missing"
    );

    return false;

  }

  if(

    !sidebarState
    .newChatButton

  ){

    logError(
      "newChatButton missing"
    );

    return false;

  }

  return true;

}



// =====================================
// SIDEBAR LISTENERS
// =====================================

function attachSidebarListeners(){

  if(

    sidebarState
    .listenersAttached

  ){

    return true;

  }

  const historyList =

    sidebarState
    .chatHistoryList;

  if(!historyList){

    return false;

  }

  historyList
  .addEventListener(
    "click",
    handleSidebarClick
  );

  historyList
  .addEventListener(
    "keydown",
    handleSidebarKeyboard
  );

  sidebarState
  .listenersAttached =
  true;

  return true;

}



// =====================================
// ABORT ACTIVE GENERATION
// =====================================

async function abortSidebarGeneration(){

  if(

    typeof abortMessageGeneration !==
    "function"

  ){

    return true;

  }

  try{

    await abortMessageGeneration();

    return true;

  }

  catch(error){

    logError(error);

    return false;

  }

}



// =====================================
// SIDEBAR CLICK
// =====================================

async function handleSidebarClick(
  event
){

  if(!event){

    return;
  }

  const deleteButton =
  event.target.closest(
    ".delete-chat-button"
  );

  if(deleteButton){

    event.stopPropagation();

    const historyItem =
    deleteButton.closest(
      ".history-item"
    );

    if(!historyItem){

      return;
    }

    const chatId =
    historyItem.dataset
    .chatId;

    const confirmed =
    confirm(

      document.body.dir ===
      "rtl"

      ?

      "حذف المحادثة؟"

      :

      "Delete chat?"

    );

    if(!confirmed){

      return;
    }

    await deleteChat(
      chatId
    );

    return;
  }

  const historyItem =
  event.target.closest(
    ".history-item"
  );

  if(!historyItem){

    return;
  }

  await loadChat(

    historyItem.dataset
    .chatId

  );

}



// =====================================
// SIDEBAR KEYBOARD
// =====================================

async function handleSidebarKeyboard(
  event
){

  if(!event){

    return;
  }

  const historyItem =
  event.target.closest(
    ".history-item"
  );

  if(!historyItem){

    return;
  }

  const validKey =

    event.key ===
    "Enter"

    ||

    event.key ===
    " "

    ||

    event.key ===
    "Spacebar";

  if(!validKey){

    return;
  }

  event.preventDefault();

  await loadChat(

    historyItem.dataset
    .chatId

  );

}



// =====================================
// SETUP SIDEBAR
// =====================================

function setupSidebar(){

  if(
    sidebarState
    .initialized
  ){

    return true;

  }

  const initialized =
  initializeSidebarElements();

  if(!initialized){

    return false;

  }

  const valid =
  validateSidebarElements();

  if(!valid){

    return false;

  }

  const buttonReady =
  setupNewChatButton();

  if(!buttonReady){

    return false;

  }

  attachSidebarListeners();

  const rendered =
  renderChatHistory();

  if(!rendered){

    return false;

  }

  sidebarState
  .initialized =
  true;

  logInfo(
    "SIDEBAR READY"
  );

  return true;

}



// =====================================
// NEW CHAT BUTTON
// =====================================

function setupNewChatButton(){

  const originalButton =
  sidebarState
  .newChatButton;

  if(!originalButton){

    return false;

  }

  const cleanButton =
  originalButton
  .cloneNode(true);

  originalButton.replaceWith(
    cleanButton
  );

  sidebarState
  .newChatButton =
  cleanButton;

  sidebarState
  .newChatHandler =
  async () => {

    await createNewChat();

  };

  cleanButton.addEventListener(
    "click",
    sidebarState
    .newChatHandler
  );

  return true;

}



// =====================================
// CREATE NEW CHAT
// =====================================

async function createNewChat(){

  await abortSidebarGeneration();

  const hasMessages =

    Array.isArray(
      currentChat.messages
    )

    &&

    currentChat.messages
    .length > 0;

  if(hasMessages){

    try{

      await Promise.resolve(
        saveCurrentChat()
      );

    }

    catch(error){

      logError(error);

    }

  }

  clearTypingIndicator();

  await Promise.resolve(
    resetCurrentChat()
  );

  renderChatMessages();

  renderChatHistory();

  if(messageInput){

    try{

      messageInput.focus();

    }

    catch(error){

      logError(error);

    }

  }

  logInfo(
    "NEW CHAT CREATED"
  );

  return true;

}



// =====================================
// SORTED CHATS
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

  .filter((chat) => {

    return (

      chat &&

      typeof chat.id ===
      "string"

    );

  })

  .sort((a,b) => {

    return (

      (b.updatedAt || 0)

      -

      (a.updatedAt || 0)

    );

  });

}



// =====================================
// CHAT TITLE
// =====================================

function getChatTitle(
  chat
){

  if(

    chat &&

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
// CLEAR HISTORY
// =====================================

function clearHistoryContainer(){

  const historyList =
  sidebarState
  .chatHistoryList;

  if(!historyList){

    return false;

  }

  historyList
  .replaceChildren();

  sidebarState
  .historyElements
  .clear();

  return true;

}



// =====================================
// RENDER HISTORY
// =====================================

function renderChatHistory(){

  const historyList =
  sidebarState
  .chatHistoryList;

  if(!historyList){

    return false;

  }

  clearHistoryContainer();

  const chats =
  getSortedChats();

  if(chats.length <= 0){

    renderEmptyHistory();

    return true;

  }

  const fragment =
  document.createDocumentFragment();

  chats.forEach((chat) => {

    const item =
    createHistoryItem(
      chat
    );

    if(item){

      fragment.appendChild(
        item
      );

    }

  });

  historyList.appendChild(
    fragment
  );

  return true;

}



// =====================================
// EMPTY HISTORY
// =====================================

function renderEmptyHistory(){

  const historyList =
  sidebarState
  .chatHistoryList;

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
// HISTORY ITEM
// =====================================

function createHistoryItem(
  chat
){

  if(
    !chat ||
    !chat.id
  ){

    return null;

  }

  const isActive =

    currentChat.id ===
    chat.id;

  const item =
  document.createElement(
    "div"
  );

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

  if(isActive){

    item.setAttribute(
      "aria-current",
      "true"
    );

  }

  item.setAttribute(
    "aria-label",
    getChatTitle(chat)
  );

  item.setAttribute(
    "title",
    getChatTitle(chat)
  );

  const title =
  document.createElement(
    "div"
  );

  title.classList.add(
    "history-title"
  );

  title.textContent =
  getChatTitle(chat);

  const actions =
  createHistoryActions(
    chat.id
  );

  item.appendChild(
    title
  );

  item.appendChild(
    actions
  );

  sidebarState
  .historyElements
  .set(
    chat.id,
    item
  );

  return item;

}



// =====================================
// HISTORY ACTIONS
// =====================================

function createHistoryActions(
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

  deleteButton.textContent =
  "×";

  deleteButton.dataset
  .chatId =
  chatId;

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
    currentChat.id ===
    chatId
  ){

    return true;

  }

  await abortSidebarGeneration();

  clearTypingIndicator();

  const hasMessages =

    Array.isArray(
      currentChat.messages
    )

    &&

    currentChat.messages
    .length > 0;

  if(hasMessages){

    try{

      await Promise.resolve(
        saveCurrentChat()
      );

    }

    catch(error){

      logError(error);

    }

  }

  const chats =
  getSortedChats();

  const selectedChat =
  chats.find((chat) => {

    return (
      chat.id ===
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

  renderChatMessages();

  renderChatHistory();

  if(messageInput){

    try{

      messageInput.focus();

    }

    catch(error){

      logError(error);

    }

  }

  logInfo(
    "CHAT LOADED"
  );

  return true;

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

  await abortSidebarGeneration();

  const chats =
  getSortedChats();

  const filteredChats =
  chats.filter((chat) => {

    return (
      chat.id !==
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

  sidebarState
  .historyElements
  .delete(chatId);

  const deletingCurrentChat =

    currentChat.id ===
    chatId;

  if(deletingCurrentChat){

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

    }

    else{

      await Promise.resolve(
        resetCurrentChat()
      );

    }

  }

  renderChatHistory();

  renderChatMessages();

  if(messageInput){

    try{

      messageInput.focus();

    }

    catch(error){

      logError(error);

    }

  }

  logInfo(
    "CHAT DELETED"
  );

  return true;

}



// =====================================
// RENDER MESSAGES
// =====================================

function renderChatMessages(){

  if(!chatContainer){

    return false;

  }

  clearTypingIndicator();

  chatContainer
  .replaceChildren();

  if(
    !Array.isArray(
      currentChat.messages
    )
  ){

    return false;

  }

  const fragment =
  document.createDocumentFragment();

  currentChat.messages
  .forEach((message) => {

    if(
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

  scrollToBottom();

  return true;

}



// =====================================
// DESTROY SIDEBAR
// =====================================

function destroySidebar(){

  const historyList =
  sidebarState
  .chatHistoryList;

  if(historyList){

    historyList
    .removeEventListener(
      "click",
      handleSidebarClick
    );

    historyList
    .removeEventListener(
      "keydown",
      handleSidebarKeyboard
    );

  }

  if(
    sidebarState
    .newChatButton

    &&

    sidebarState
    .newChatHandler
  ){

    sidebarState
    .newChatButton
    .removeEventListener(

      "click",

      sidebarState
      .newChatHandler

    );

  }

  sidebarState
  .historyElements
  .clear();

  sidebarState
  .listenersAttached =
  false;

  sidebarState
  .initialized =
  false;

  sidebarState
  .chatHistoryList =
  null;

  sidebarState
  .newChatButton =
  null;

  sidebarState
  .newChatHandler =
  null;

  return true;

}
