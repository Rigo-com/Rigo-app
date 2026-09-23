// =====================================
// RIGO AI
// UI RUNTIME
// =====================================

import {UiState} from "./ui-state.js";
import {isMobileDevice} from "./ui-utils.js";
import LanguageRuntime from "./i18n/index.js";

function initializeUi(){
  if(UiState.snapshot().initialized) return true;
  UiState.setMobile(isMobileDevice());
  UiState.setInitialized(true);
  return true;
}

async function initialize(){
  initializeUi();
  await LanguageRuntime.initialize();
  return true;
}

async function shutdown(){
  await LanguageRuntime.reset();
  UiState.reset();
  return true;
}

async function reset(){
  await shutdown();
  return initialize();
}

function snapshot(){
  return Object.freeze({
    ui:UiState.snapshot(),
    language:LanguageRuntime.snapshot()
  });
}

const UiRuntime = Object.freeze({
  initialize,
  shutdown,
  reset,
  snapshot,
  initializeUi,
  language:LanguageRuntime
});

export {
  initialize,
  shutdown,
  reset,
  snapshot,
  initializeUi,
  UiRuntime
};

export default UiRuntime;
