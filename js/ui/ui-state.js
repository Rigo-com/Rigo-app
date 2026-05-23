// =====================================
// RIGO AI
// UI STATE
// ENTERPRISE UI STATE CONTAINER
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

  typing:false,

  loading:false,

  mobile:false,

  hydrated:false,



  // ===================================
  // RENDER
  // ===================================

  renderLocked:false,

  activeAnimationFrame:null,

  pendingRenderQueue:[],



  // ===================================
  // ACTIVE UI
  // ===================================

  activeModal:null,

  activeToast:null,



  // ===================================
  // DOM
  // ===================================

  mountedNodes:
  new WeakSet(),

  trackedElements:
  new Map(),

  cleanupCallbacks:
  new Set(),



  // ===================================
  // EVENTS
  // ===================================

  activeListeners:
  new Set(),



  // ===================================
  // TIMESTAMPS
  // ===================================

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

  chatContainer:null,

  messagesContainer:null,

  input:null,

  sendButton:null,

  toastContainer:null,

  modalContainer:null

});
