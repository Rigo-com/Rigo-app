// =====================================
// RIGO AI
// UI STATE
// =====================================

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
  snapshot:getUiSnapshot,
  reset:resetUiState
});

export {
  uiState,
  UiState
};

export default UiState;
