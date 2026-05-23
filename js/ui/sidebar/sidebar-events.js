// =====================================
// RIGO AI
// SIDEBAR EVENTS
// ENTERPRISE SIDEBAR EVENT SYSTEM
// =====================================



// =====================================
// SIDEBAR EVENT STATE
// =====================================

const sidebarEventState =
Object.seal({

  eventsBound:false,

  listeners:
  new Set(),

  processing:false

});



// =====================================
// VALID EVENT TARGET
// =====================================

function isValidSidebarEventTarget(
  target
){

  return (

    target instanceof
    EventTarget

  );

}



// =====================================
// TRACK LISTENER
// =====================================

function trackSidebarListener(
  target,
  type,
  handler,
  options = false
){

  if(
    !isValidSidebarEventTarget(
      target
    )
  ){

    return false;

  }

  if(
    typeof type !==
    "string"
  ){

    return false;

  }

  if(
    typeof handler !==
    "function"
  ){

    return false;

  }

  try{

    target.addEventListener(

      type,

      handler,

      options

    );

    const listenerObject =

      Object.freeze({

        target,
        type,
        handler,
        options

      });

    sidebarEventState
    .listeners
    .add(
      listenerObject
    );

    return true;

  }

  catch(error){

    safeLogError(

      "SIDEBAR LISTENER ERROR",

      error

    );

    return false;

  }

}



// =====================================
// REMOVE LISTENER
// =====================================

function removeSidebarListener(
  listenerObject
){

  if(
    !listenerObject
  ){

    return false;

  }

  try{

    listenerObject
    .target
    ?.removeEventListener(

      listenerObject.type,

      listenerObject.handler,

      listenerObject.options

    );

    sidebarEventState
    .listeners
    .delete(
      listenerObject
    );

    return true;

  }

  catch(error){

    safeLogError(

      "REMOVE SIDEBAR LISTENER ERROR",

      error

    );

    return false;

  }

}



// =====================================
// REMOVE ALL LISTENERS
// =====================================

function removeAllSidebarListeners(){

  [

    ...sidebarEventState
    .listeners

  ]
  .forEach((listener) => {

    removeSidebarListener(
      listener
    );

  });

  return true;

}



// =====================================
// GET HISTORY ITEM
// =====================================

function getSidebarHistoryItem(
  target
){

  if(
    !target
  ){

    return null;

  }

  return target.closest(
    ".history-item"
  );

}



// =====================================
// GET DELETE BUTTON
// =====================================

function getSidebarDeleteButton(
  target
){

  if(
    !target
  ){

    return null;

  }

  return target.closest(
    ".delete-chat-button"
  );

}



// =====================================
// SAFE EVENT PROCESS
// =====================================

async function safelyProcessSidebarEvent(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(
    sidebarEventState
    .processing
  ){

    return false;

  }

  sidebarEventState
  .processing =
  true;

  try{

    await callback();

    return true;

  }

  catch(error){

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(
      error
    );

    return false;

  }

  finally{

    sidebarEventState
    .processing =
    false;

  }

}



// =====================================
// CLICK HANDLER
// =====================================

async function handleSidebarClick(
  event
){

  if(!event){

    return false;

  }

  return safelyProcessSidebarEvent(
    async () => {

      const deleteButton =
      getSidebarDeleteButton(
        event.target
      );

      if(deleteButton){

        event.stopPropagation();

        const historyItem =
        getSidebarHistoryItem(
          deleteButton
        );

        if(!historyItem){

          return false;

        }

        const chatId =
        historyItem.dataset
        ?.chatId;

        if(
          typeof deleteChat !==
          "function"
        ){

          return false;

        }

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

          return false;

        }

        await deleteChat(
          chatId
        );

        return true;

      }

      const historyItem =
      getSidebarHistoryItem(
        event.target
      );

      if(!historyItem){

        return false;

      }

      const chatId =
      historyItem.dataset
      ?.chatId;

      if(
        typeof loadChat !==
        "function"
      ){

        return false;

      }

      await loadChat(
        chatId
      );

      return true;

    }
  );

}



// =====================================
// KEYBOARD HANDLER
// =====================================

async function handleSidebarKeyboard(
  event
){

  if(!event){

    return false;

  }

  return safelyProcessSidebarEvent(
    async () => {

      const historyItem =
      getSidebarHistoryItem(
        event.target
      );

      if(!historyItem){

        return false;

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

        return false;

      }

      event.preventDefault();

      const chatId =
      historyItem.dataset
      ?.chatId;

      if(
        typeof loadChat !==
        "function"
      ){

        return false;

      }

      await loadChat(
        chatId
      );

      return true;

    }
  );

}



// =====================================
// NEW CHAT HANDLER
// =====================================

async function handleNewChatClick(){

  return safelyProcessSidebarEvent(
    async () => {

      if(
        typeof createNewChat !==
        "function"
      ){

        return false;

      }

      await createNewChat();

      return true;

    }
  );

}



// =====================================
// BIND EVENTS
// =====================================

function bindSidebarEvents(){

  if(
    sidebarEventState
    .eventsBound
  ){

    return true;

  }

  const historyList =
  SidebarElements
  .getHistoryList();

  const newChatButton =
  SidebarElements
  .getNewChatButton();

  if(
    !historyList ||
    !newChatButton
  ){

    return false;

  }

  trackSidebarListener(

    historyList,

    "click",

    handleSidebarClick

  );

  trackSidebarListener(

    historyList,

    "keydown",

    handleSidebarKeyboard

  );

  trackSidebarListener(

    newChatButton,

    "click",

    handleNewChatClick

  );

  sidebarRuntimeState
  .listenersAttached =
  true;

  sidebarEventState
  .eventsBound =
  true;

  return true;

}



// =====================================
// UNBIND EVENTS
// =====================================

function unbindSidebarEvents(){

  removeAllSidebarListeners();

  sidebarRuntimeState
  .listenersAttached =
  false;

  sidebarEventState
  .eventsBound =
  false;

  return true;

}



// =====================================
// EVENT DIAGNOSTICS
// =====================================

function getSidebarEventDiagnostics(){

  return Object.freeze({

    eventsBound:

      sidebarEventState
      .eventsBound,

    processing:

      sidebarEventState
      .processing,

    activeListeners:

      sidebarEventState
      .listeners
      .size

  });

}



// =====================================
// PUBLIC API
// =====================================

const SidebarEvents =
Object.freeze({

  bind:
  bindSidebarEvents,

  unbind:
  unbindSidebarEvents,

  diagnostics:
  getSidebarEventDiagnostics

});
