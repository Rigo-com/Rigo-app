// =====================================
// RIGO AI
// UI RUNTIME
// =====================================

import {UiState} from "./ui-state.js";
import {isMobileDevice} from "./ui-utils.js";

function initializeUi(){
  if(UiState.snapshot().initialized) return true;
  UiState.setMobile(isMobileDevice());
  UiState.setInitialized(true);
  return true;
}

async function initialize(){
  return initializeUi();
}

async function shutdown(){
  UiState.reset();
  return true;
}

async function reset(){
  await shutdown();
  return initialize();
}

function snapshot(){
  return Object.freeze({
    ui:UiState.snapshot()
  });
}

const UiRuntime = Object.freeze({
  initialize,
  shutdown,
  reset,
  snapshot,
  initializeUi
});

export {
  UiRuntime
};

export default UiRuntime;
