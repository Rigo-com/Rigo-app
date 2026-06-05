// =====================================
// RIGO AI
// UI STATE
// FOUNDATION UI STATE LAYER
// =====================================



// =====================================
// UI CONFIG
// =====================================

const UI_CONFIG =
Object.freeze({

  RESIZE_DELAY:
  120,

  MAX_TOASTS:
  5,

  MAX_RENDER_QUEUE:
  500,

  MAX_DOM_REFERENCES:
  1000,

  ENABLE_ANIMATIONS:true,

  ENABLE_BATCH_RENDERING:true

});



// =====================================
// UI STATE
// =====================================

const uiState =
Object.seal({

  initialized:false,

  destroyed:false,

  rendering:false,

  resizing:false,

  loading:false,

  typing:false,

  mobile:false,

  hydrated:false,

  visible:true,

  focused:true,



  // ================================
  // VIEW
  // ================================

  currentView:null,

  currentTheme:"dark",



  // ================================
  // RENDER
  // ================================

  renderLocked:false,

  animationFrame:null,

  renderQueue:[],



  // ================================
  // UI
  // ================================

  activeModal:null,

  activeToast:null,



  // ================================
  // DOM
  // ================================

  mountedNodes:
  new WeakSet(),

  trackedElements:
  new Map(),

  cleanupCallbacks:
  new Set(),

  listeners:
  new Set(),



  // ================================
  // TIMESTAMPS
  // ================================

  initializedAt:null,

  destroyedAt:null,

  lastRenderAt:null,

  lastResizeAt:null

});



// =====================================
// UI ELEMENTS
// =====================================

const uiElements =
Object.seal({

  app:null,

  sidebar:null,

  header:null,

  content:null,

  chatContainer:null,

  messagesContainer:null,

  input:null,

  sendButton:null,

  toastContainer:null,

  modalContainer:null

});



// =====================================
// STATE FLAGS
// =====================================

function setInitialized(
  value
){

  uiState.initialized =
  Boolean(value);

  if(value){

    uiState.initializedAt =
    Date.now();

  }

}



function setDestroyed(
  value
){

  uiState.destroyed =
  Boolean(value);

  if(value){

    uiState.destroyedAt =
    Date.now();

  }

}



function setRendering(
  value
){

  uiState.rendering =
  Boolean(value);

}



function setResizing(
  value
){

  uiState.resizing =
  Boolean(value);

}



function setLoading(
  value
){

  uiState.loading =
  Boolean(value);

}



function setTyping(
  value
){

  uiState.typing =
  Boolean(value);

}



function setMobile(
  value
){

  uiState.mobile =
  Boolean(value);

}



function setHydrated(
  value
){

  uiState.hydrated =
  Boolean(value);

}



function setVisible(
  value
){

  uiState.visible =
  Boolean(value);

}



function setFocused(
  value
){

  uiState.focused =
  Boolean(value);

}



// =====================================
// UI STATUS
// =====================================

function setCurrentView(
  view
){

  uiState.currentView =
  view;

}



function setTheme(
  theme
){

  uiState.currentTheme =
  theme;

}



function setActiveModal(
  modal
){

  uiState.activeModal =
  modal;

}



function setActiveToast(
  toast
){

  uiState.activeToast =
  toast;

}



// =====================================
// DOM REFERENCES
// =====================================

function trackElement(
  key,
  element
){

  uiState
  .trackedElements
  .set(

    key,

    element

  );

  return true;

}



function getTrackedElement(
  key
){

  return (

    uiState
    .trackedElements
    .get(key)

    ??

    null

  );

}



function removeTrackedElement(
  key
){

  return uiState
  .trackedElements
  .delete(
    key
  );

}



// =====================================
// ELEMENT MANAGEMENT
// =====================================

function setElement(
  key,
  element
){

  uiElements[key] =
  element;

  return true;

}



function getElement(
  key
){

  return (

    uiElements[key]

    ??

    null

  );

}



// =====================================
// SNAPSHOT
// =====================================

function getUiSnapshot(){

  return Object.freeze({

    initialized:
    uiState.initialized,

    destroyed:
    uiState.destroyed,

    rendering:
    uiState.rendering,

    resizing:
    uiState.resizing,

    loading:
    uiState.loading,

    typing:
    uiState.typing,

    mobile:
    uiState.mobile,

    hydrated:
    uiState.hydrated,

    visible:
    uiState.visible,

    focused:
    uiState.focused,

    currentView:
    uiState.currentView,

    currentTheme:
    uiState.currentTheme,

    trackedElements:
    uiState
    .trackedElements
    .size,

    listeners:
    uiState
    .listeners
    .size

  });

}



// =====================================
// RESET
// =====================================

function resetUiState(){

  uiState.initialized = false;
  uiState.destroyed = false;
  uiState.rendering = false;
  uiState.resizing = false;
  uiState.loading = false;
  uiState.typing = false;
  uiState.mobile = false;
  uiState.hydrated = false;
  uiState.visible = true;
  uiState.focused = true;

  uiState.currentView = null;
  uiState.currentTheme = "dark";

  uiState.renderLocked = false;
  uiState.animationFrame = null;
  uiState.renderQueue = [];

  uiState.activeModal = null;
  uiState.activeToast = null;

  uiState.trackedElements.clear();
  uiState.cleanupCallbacks.clear();
  uiState.listeners.clear();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const UiState =
Object.freeze({

  setInitialized,
  setDestroyed,
  setRendering,
  setResizing,
  setLoading,
  setTyping,
  setMobile,
  setHydrated,
  setVisible,
  setFocused,

  setCurrentView,
  setTheme,
  setActiveModal,
  setActiveToast,

  trackElement,
  getTrackedElement,
  removeTrackedElement,

  setElement,
  getElement,

  snapshot:
  getUiSnapshot,

  reset:
  resetUiState

});



// =====================================
// EXPORTS
// =====================================

export {

  UI_CONFIG,

  uiState,
  uiElements,

  setInitialized,
  setDestroyed,
  setRendering,
  setResizing,
  setLoading,
  setTyping,
  setMobile,
  setHydrated,
  setVisible,
  setFocused,

  setCurrentView,
  setTheme,
  setActiveModal,
  setActiveToast,

  trackElement,
  getTrackedElement,
  removeTrackedElement,

  setElement,
  getElement,

  getUiSnapshot,
  resetUiState,

  UiState

};

export default
UiState;
