// =====================================
// RIGO AI
// UI STATE
// =====================================

const UI_CONFIG = Object.freeze({
  RESIZE_DELAY:120,
  MAX_RENDER_QUEUE:500,
  ENABLE_ANIMATIONS:true,
  ENABLE_BATCH_RENDERING:true
});

const uiState = Object.seal({
  initialized:false,
  mobile:false,
  rendering:false,
  lastRenderAt:null
});

function setInitialized(value){
  uiState.initialized = Boolean(value);
}

function setMobile(value){
  uiState.mobile = Boolean(value);
}

function setRendering(value){
  uiState.rendering = Boolean(value);
}

function getUiSnapshot(){
  return Object.freeze({
    initialized:uiState.initialized,
    mobile:uiState.mobile,
    rendering:uiState.rendering,
    lastRenderAt:uiState.lastRenderAt
  });
}

function resetUiState(){
  uiState.initialized = false;
  uiState.mobile = false;
  uiState.rendering = false;
  uiState.lastRenderAt = null;
  return true;
}

const UiState = Object.freeze({
  setInitialized,
  setMobile,
  setRendering,
  snapshot:getUiSnapshot,
  reset:resetUiState
});

export {
  UI_CONFIG,
  uiState,
  setInitialized,
  setMobile,
  setRendering,
  getUiSnapshot,
  resetUiState,
  UiState
};

export default UiState;
