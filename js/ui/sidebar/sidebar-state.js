// =====================================
// RIGO AI
// SIDEBAR STATE
// ENTERPRISE SIDEBAR STATE SYSTEM
// =====================================



// =====================================
// SIDEBAR CONFIG
// =====================================

const SIDEBAR_CONFIG =
Object.freeze({

  MAX_HISTORY_ITEMS:
  500,

  MAX_RENDER_BATCH:
  50,

  ENABLE_DIAGNOSTICS:
  true,

  AUTO_FOCUS_INPUT:
  true

});



// =====================================
// SIDEBAR RUNTIME STATE
// =====================================

const sidebarRuntimeState =
Object.seal({

  initialized:false,

  destroyed:false,

  rendering:false,

  loading:false,

  deleting:false,

  creating:false,

  hydrated:false,

  listenersAttached:false,

  activeChatId:null,

  activeOperationId:0,

  initializedAt:null,

  destroyedAt:null,

  lastRenderAt:null,

  lastActionAt:null,

  lastError:null

});



// =====================================
// SIDEBAR ELEMENT STATE
// =====================================

const sidebarElementState =
Object.seal({

  chatHistoryList:null,

  newChatButton:null,

  sidebarContainer:null,

  activeHistoryItem:null

});



// =====================================
// SIDEBAR CACHE STATE
// =====================================

const sidebarCacheState =
Object.seal({

  historyElements:
  new Map(),

  renderedChats:
  new Map(),

  pendingOperations:
  new Set()

});



// =====================================
// SIDEBAR UI STATE
// =====================================

const sidebarUIState =
Object.seal({

  focused:false,

  collapsed:false,

  mobile:false,

  scrolling:false,

  keyboardNavigation:false

});



// =====================================
// RESET SIDEBAR CACHE
// =====================================

function resetSidebarCache(){

  sidebarCacheState
  .historyElements
  .clear();

  sidebarCacheState
  .renderedChats
  .clear();

  sidebarCacheState
  .pendingOperations
  .clear();

  return true;

}



// =====================================
// RESET SIDEBAR ELEMENTS
// =====================================

function resetSidebarElements(){

  sidebarElementState
  .chatHistoryList =
  null;

  sidebarElementState
  .newChatButton =
  null;

  sidebarElementState
  .sidebarContainer =
  null;

  sidebarElementState
  .activeHistoryItem =
  null;

  return true;

}



// =====================================
// RESET SIDEBAR RUNTIME
// =====================================

function resetSidebarRuntimeState(){

  sidebarRuntimeState
  .initialized =
  false;

  sidebarRuntimeState
  .destroyed =
  false;

  sidebarRuntimeState
  .rendering =
  false;

  sidebarRuntimeState
  .loading =
  false;

  sidebarRuntimeState
  .deleting =
  false;

  sidebarRuntimeState
  .creating =
  false;

  sidebarRuntimeState
  .hydrated =
  false;

  sidebarRuntimeState
  .listenersAttached =
  false;

  sidebarRuntimeState
  .activeChatId =
  null;

  sidebarRuntimeState
  .activeOperationId =
  0;

  sidebarRuntimeState
  .initializedAt =
  null;

  sidebarRuntimeState
  .destroyedAt =
  null;

  sidebarRuntimeState
  .lastRenderAt =
  null;

  sidebarRuntimeState
  .lastActionAt =
  null;

  sidebarRuntimeState
  .lastError =
  null;

  return true;

}



// =====================================
// SIDEBAR READY
// =====================================

function isSidebarReady(){

  return (

    sidebarRuntimeState
    .initialized ===
    true

    &&

    sidebarRuntimeState
    .destroyed ===
    false

  );

}



// =====================================
// SIDEBAR BUSY
// =====================================

function isSidebarBusy(){

  return (

    sidebarRuntimeState
    .rendering

    ||

    sidebarRuntimeState
    .loading

    ||

    sidebarRuntimeState
    .deleting

    ||

    sidebarRuntimeState
    .creating

  );

}



// =====================================
// CREATE OPERATION ID
// =====================================

function createSidebarOperationId(){

  sidebarRuntimeState
  .activeOperationId++;

  return (
    sidebarRuntimeState
    .activeOperationId
  );

}



// =====================================
// TRACK OPERATION
// =====================================

function trackSidebarOperation(
  operationId
){

  sidebarCacheState
  .pendingOperations
  .add(
    operationId
  );

  return true;

}



// =====================================
// COMPLETE OPERATION
// =====================================

function completeSidebarOperation(
  operationId
){

  sidebarCacheState
  .pendingOperations
  .delete(
    operationId
  );

  return true;

}



// =====================================
// SET ACTIVE CHAT
// =====================================

function setSidebarActiveChat(
  chatId
){

  if(
    typeof chatId !==
    "string"
  ){

    return false;

  }

  sidebarRuntimeState
  .activeChatId =
  chatId;

  sidebarRuntimeState
  .lastActionAt =
  Date.now();

  return true;

}



// =====================================
// CLEAR ACTIVE CHAT
// =====================================

function clearSidebarActiveChat(){

  sidebarRuntimeState
  .activeChatId =
  null;

  return true;

}



// =====================================
// SIDEBAR DIAGNOSTICS
// =====================================

function getSidebarDiagnostics(){

  return Object.freeze({

    initialized:
    sidebarRuntimeState
    .initialized,

    destroyed:
    sidebarRuntimeState
    .destroyed,

    rendering:
    sidebarRuntimeState
    .rendering,

    loading:
    sidebarRuntimeState
    .loading,

    deleting:
    sidebarRuntimeState
    .deleting,

    creating:
    sidebarRuntimeState
    .creating,

    hydrated:
    sidebarRuntimeState
    .hydrated,

    listenersAttached:
    sidebarRuntimeState
    .listenersAttached,

    activeChatId:
    sidebarRuntimeState
    .activeChatId,

    pendingOperations:

      sidebarCacheState
      .pendingOperations
      .size,

    trackedHistoryElements:

      sidebarCacheState
      .historyElements
      .size,

    renderedChats:

      sidebarCacheState
      .renderedChats
      .size,

    initializedAt:
    sidebarRuntimeState
    .initializedAt,

    destroyedAt:
    sidebarRuntimeState
    .destroyedAt,

    lastRenderAt:
    sidebarRuntimeState
    .lastRenderAt,

    lastActionAt:
    sidebarRuntimeState
    .lastActionAt,

    lastError:

      sidebarRuntimeState
      .lastError

      ?

      String(
        sidebarRuntimeState
        .lastError
      )

      :

      null

  });

}
