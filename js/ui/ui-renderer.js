// =====================================
// RIGO AI
// UI RENDERER
// =====================================

import {uiState} from "./ui-state.js";

function forceRender(callback){
  if(typeof callback !== "function") return false;

  uiState.rendering = true;
  try{
    callback();
    uiState.lastRenderAt = Date.now();
    return true;
  }
  catch{
    return false;
  }
  finally{
    uiState.rendering = false;
  }
}

const UiRenderer = Object.freeze({
  forceRender
});

export {
  forceRender,
  UiRenderer
};

export default UiRenderer;
