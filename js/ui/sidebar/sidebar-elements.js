// =====================================
// RIGO AI
// SIDEBAR ELEMENTS
// ENTERPRISE SIDEBAR DOM LAYER
// =====================================



// =====================================
// SIDEBAR ELEMENT IDS
// =====================================

const SIDEBAR_ELEMENT_IDS =
Object.freeze({

  CONTAINER:
  "sidebar",

  HISTORY_LIST:
  "chatHistoryList",

  NEW_CHAT_BUTTON:
  "newChatButton"

});



// =====================================
// SAFE ELEMENT
// =====================================

function getSidebarElement(
  elementId
){

  if(
    typeof document ===
    "undefined"
  ){

    return null;

  }

  if(
    typeof elementId !==
    "string"
  ){

    return null;

  }

  try{

    return document
    .getElementById(
      elementId
    );

  }

  catch(error){

    safeLogError(
      "SIDEBAR ELEMENT ERROR",
      error
    );

    return null;

  }

}



// =====================================
// CACHE ELEMENTS
// =====================================

function initializeSidebarElements(){

  if(
    sidebarRuntimeState
    .destroyed
  ){

    return false;

  }

  sidebarElementState
  .sidebarContainer =

    getSidebarElement(

      SIDEBAR_ELEMENT_IDS
      .CONTAINER

    );

  sidebarElementState
  .chatHistoryList =

    getSidebarElement(

      SIDEBAR_ELEMENT_IDS
      .HISTORY_LIST

    );

  sidebarElementState
  .newChatButton =

    getSidebarElement(

      SIDEBAR_ELEMENT_IDS
      .NEW_CHAT_BUTTON

    );

  return true;

}



// =====================================
// VALIDATE ELEMENT
// =====================================

function validateSidebarElement(
  element
){

  return (

    element instanceof
    HTMLElement

  );

}



// =====================================
// VALIDATE ELEMENTS
// =====================================

function validateSidebarElements(){

  const requiredElements = [

    sidebarElementState
    .chatHistoryList,

    sidebarElementState
    .newChatButton

  ];

  const valid =
  requiredElements.every(
    validateSidebarElement
  );

  if(!valid){

    safeLogError(
      "SIDEBAR VALIDATION FAILED"
    );

    return false;

  }

  return true;

}



// =====================================
// GET HISTORY LIST
// =====================================

function getSidebarHistoryList(){

  return (

    sidebarElementState
    .chatHistoryList

    ||

    null

  );

}



// =====================================
// GET NEW CHAT BUTTON
// =====================================

function getSidebarNewChatButton(){

  return (

    sidebarElementState
    .newChatButton

    ||

    null

  );

}



// =====================================
// GET SIDEBAR CONTAINER
// =====================================

function getSidebarContainer(){

  return (

    sidebarElementState
    .sidebarContainer

    ||

    null

  );

}



// =====================================
// SET ACTIVE HISTORY ITEM
// =====================================

function setActiveHistoryItem(
  element
){

  if(
    !validateSidebarElement(
      element
    )
  ){

    return false;

  }

  const previous =

    sidebarElementState
    .activeHistoryItem;

  if(previous){

    previous.classList.remove(
      "active-history-item"
    );

    previous.removeAttribute(
      "aria-current"
    );

    previous.setAttribute(
      "aria-selected",
      "false"
    );

  }

  element.classList.add(
    "active-history-item"
  );

  element.setAttribute(
    "aria-current",
    "true"
  );

  element.setAttribute(
    "aria-selected",
    "true"
  );

  sidebarElementState
  .activeHistoryItem =
  element;

  return true;

}



// =====================================
// CLEAR ACTIVE HISTORY ITEM
// =====================================

function clearActiveHistoryItem(){

  const activeItem =

    sidebarElementState
    .activeHistoryItem;

  if(!activeItem){

    return true;

  }

  activeItem.classList.remove(
    "active-history-item"
  );

  activeItem.removeAttribute(
    "aria-current"
  );

  activeItem.setAttribute(
    "aria-selected",
    "false"
  );

  sidebarElementState
  .activeHistoryItem =
  null;

  return true;

}



// =====================================
// CLEAR HISTORY CONTAINER
// =====================================

function clearSidebarHistoryContainer(){

  const historyList =
  getSidebarHistoryList();

  if(!historyList){

    return false;

  }

  historyList.replaceChildren();

  sidebarCacheState
  .historyElements
  .clear();

  clearActiveHistoryItem();

  return true;

}



// =====================================
// SAFE FOCUS INPUT
// =====================================

function focusSidebarInput(){

  if(

    !SIDEBAR_CONFIG
    .AUTO_FOCUS_INPUT

  ){

    return false;

  }

  if(
    typeof messageInput ===
    "undefined"

    ||

    !messageInput
  ){

    return false;

  }

  try{

    messageInput.focus();

    return true;

  }

  catch(error){

    safeLogError(
      "SIDEBAR FOCUS ERROR",
      error
    );

    return false;

  }

}



// =====================================
// CLEANUP ELEMENTS
// =====================================

function cleanupSidebarElements(){

  clearSidebarHistoryContainer();

  resetSidebarElements();

  return true;

}



// =====================================
// ELEMENT DIAGNOSTICS
// =====================================

function getSidebarElementDiagnostics(){

  return Object.freeze({

    container:

      Boolean(

        sidebarElementState
        .sidebarContainer

      ),

    historyList:

      Boolean(

        sidebarElementState
        .chatHistoryList

      ),

    newChatButton:

      Boolean(

        sidebarElementState
        .newChatButton

      ),

    activeHistoryItem:

      Boolean(

        sidebarElementState
        .activeHistoryItem

      )

  });

}



// =====================================
// PUBLIC API
// =====================================

const SidebarElements =
Object.freeze({

  initialize:
  initializeSidebarElements,

  validate:
  validateSidebarElements,

  cleanup:
  cleanupSidebarElements,

  clearHistory:
  clearSidebarHistoryContainer,

  focusInput:
  focusSidebarInput,

  getContainer:
  getSidebarContainer,

  getHistoryList:
  getSidebarHistoryList,

  getNewChatButton:
  getSidebarNewChatButton,

  setActiveItem:
  setActiveHistoryItem,

  clearActiveItem:
  clearActiveHistoryItem,

  diagnostics:
  getSidebarElementDiagnostics

});
