// =====================================
// RIGO AI
// SIDEBAR + HISTORY SYSTEM
// PRODUCTION FINAL
// =====================================



// =====================================
// SIDEBAR STATE
// =====================================

let sidebarInitialized = false;

let chatHistoryList = null;

let newChatButton = null;



// =====================================
// INITIALIZE SIDEBAR
// =====================================

function initializeSidebarElements(){

  chatHistoryList =
  document.getElementById(
    "chatHistoryList"
  );

  newChatButton =
  document.getElementById(
    "newChatButton"
  );

}



// =====================================
// VALIDATE SIDEBAR
// =====================================

function validateSidebarElements(){

  if(!chatHistoryList){

    logError(
      "chatHistoryList missing"
    );

    return false;

  }

  if(!newChatButton){

    logError(
      "newChatButton missing"
    );

    return false;

  }

  return true;

}



// =====================================
// SETUP SIDEBAR
// =====================================

function setupSidebar(){

  if(sidebarInitialized){

    return true;

  }

  initializeSidebarElements();

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

  const rendered =
  renderChatHistory();

  if(!rendered){

    return false;

  }

  sidebarInitialized = true;

  logInfo(
    "SIDEBAR READY"
  );

  return true;

}



// =====================================
// NEW CHAT BUTTON
// =====================================

function setupNewChatButton(){

  if(!newChatButton){

    return false;

  }

  newChatButton
  .addEventListener(
    "click",
    () => {

      createNewChat();

    }
  );

  return true;

}



// =====================================
// CREATE NEW CHAT
// =====================================

function createNewChat(){

  const hasMessages =

  Array.isArray(
    currentChat.messages
  ) &&

  currentChat.messages
  .length > 0;

  if(hasMessages){

    saveCurrentChat();

  }

  clearTypingIndicator();

  resetCurrentChat();

  renderChatMessages();

  renderChatHistory();

  if(messageInput){

    messageInput.focus();

  }

  logInfo(
    "NEW CHAT CREATED"
  );

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

  .filter((chat) => {

    return (

      chat &&

      typeof chat.id ===
      "string"

    );

  })

  .sort((a,b) => {

    return (
      (b.updatedAt || 0) -
      (a.updatedAt || 0)
    );

  });

}



// =====================================
// GET CHAT TITLE
// =====================================

function getChatTitle(chat){

  if(
    chat &&
    typeof chat.title ===
    "string" &&
    chat.title.trim()
  ){

    return chat.title;

  }

  return (

    document.body.dir ===
    "rtl"

    ? "محادثة جديدة"

    : "New Chat"

  );

}



// =====================================
// CLEAR HISTORY
// =====================================

function clearHistoryContainer(){

  if(!chatHistoryList){

    return false;

  }

  chatHistoryList.innerHTML =
  "";

  return true;

}



// =====================================
// RENDER CHAT HISTORY
// =====================================

function renderChatHistory(){

  if(!chatHistoryList){

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

  chatHistoryList.appendChild(
    fragment
  );

  return true;

}



// =====================================
// EMPTY HISTORY
// =====================================

function renderEmptyHistory(){

  if(!chatHistoryList){

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

  ? "لا توجد محادثات"

  : "No chats yet";

  chatHistoryList
  .appendChild(
    empty
  );

  return true;

}



// =====================================
// CREATE HISTORY ITEM
// =====================================

function createHistoryItem(chat){

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

  item.addEventListener(
    "click",
    () => {

      loadChat(
        chat.id
      );

    }
  );

  item.addEventListener(
    "keydown",
    (event) => {

      const isKeyboardSelect =

      event.key ===
      "Enter" ||

      event.key ===
      " " ||

      event.key ===
      "Spacebar";

      if(!isKeyboardSelect){

        return;

      }

      event.preventDefault();

      loadChat(
        chat.id
      );

    }
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

  deleteButton.setAttribute(
    "aria-label",
    "Delete chat"
  );

  deleteButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      const confirmed =
      confirm(

        document.body.dir ===
        "rtl"

        ? "حذف المحادثة؟"

        : "Delete chat?"

      );

      if(!confirmed){

        return;

      }

      deleteChat(
        chatId
      );

    }
  );

  wrapper.appendChild(
    deleteButton
  );

  return wrapper;

}



// =====================================
// LOAD CHAT
// =====================================

function loadChat(chatId){

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

  clearTypingIndicator();

  const hasMessages =

  Array.isArray(
    currentChat.messages
  ) &&

  currentChat.messages
  .length > 0;

  if(hasMessages){

    saveCurrentChat();

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

    messageInput.focus();

  }

  logInfo(
    "CHAT LOADED"
  );

  return true;

}



// =====================================
// DELETE CHAT
// =====================================

function deleteChat(chatId){

  if(
    typeof chatId !==
    "string"
  ){

    return false;

  }

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

      resetCurrentChat();

    }

  }

  renderChatHistory();

  renderChatMessages();

  if(messageInput){

    messageInput.focus();

  }

  logInfo(
    "CHAT DELETED"
  );

  return true;

}



// =====================================
// RENDER CHAT MESSAGES
// =====================================

function renderChatMessages(){

  if(!chatContainer){

    return false;

  }

  clearTypingIndicator();

  chatContainer.innerHTML =
  "";

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

  chatContainer.appendChild(
    fragment
  );

  scrollToBottom();

  return true;

}
