// =====================================
// RIGO AI
// UI RUNTIME
// UI SYSTEM RUNTIME
// =====================================

import {
  UiState
}
from "./ui-state.js";

import {
  UiElements
}
from "./ui-elements.js";

import {
  UiEvents
}
from "./ui-events.js";

import {
  UiRenderer
}
from "./ui-renderer.js";

import {
  isMobileDevice
}
from "./ui-utils.js";

import LanguageRuntime
from "./i18n/index.js";

import SidebarRuntime
from "./sidebar/index.js";


function initializeUi(){

  if(
    UiState
    .snapshot()
    .initialized
  ){
    return true;
  }

  UiState
  .setMobile(
    isMobileDevice()
  );

  UiState
  .setInitialized(
    true
  );

  return true;
}


function registerUiElements(
  elements = {}
){

  UiElements
  .registerElements(
    elements
  );

  return true;
}


function render(
  callback
){

  UiRenderer
  .enqueueRender(
    callback
  );

  UiRenderer
  .renderFrame();

  return true;
}


function refresh(){

  UiRenderer
  .renderFrame();

  SidebarRuntime
  .refresh();

  return true;
}


function handleResize(){

  UiState
  .setMobile(
    isMobileDevice()
  );

  return true;
}


function startListeners(){

  if(
    typeof window ===
    "undefined"
  ){
    return false;
  }

  UiEvents
  .addListener(
    window,
    "resize",
    handleResize
  );

  return true;
}


function stopListeners(){

  UiEvents
  .removeAllListeners();

  return true;
}


function getRuntimeStatus(){

  return Object.freeze({
    ui:UiState.snapshot(),
    renderer:UiRenderer.getRenderStats(),
    listeners:UiEvents.getListenerCount(),
    language:LanguageRuntime.snapshot(),
    sidebar:SidebarRuntime.status()
  });
}


function destroyUi(){

  SidebarRuntime
  .destroy();

  stopListeners();

  UiRenderer
  .clearRenderQueue();

  UiState
  .reset();

  return true;
}


async function bootstrapUi(
  elements = {}
){

  initializeUi();

  registerUiElements(
    elements
  );

  await LanguageRuntime
  .initialize();

  SidebarRuntime
  .initialize();

  startListeners();

  return true;
}


async function initialize(){

  initializeUi();

  await LanguageRuntime
  .initialize();

  return true;
}


async function boot(){

  return bootstrapUi();
}


async function shutdown(){

  destroyUi();

  await LanguageRuntime
  .reset();

  return true;
}


async function reset(){

  await shutdown();

  return initialize();
}


function snapshot(){

  return getRuntimeStatus();
}


const UiRuntime = Object.freeze({
  initialize,
  boot,
  shutdown,
  reset,
  snapshot,
  initializeUi,
  registerUiElements,
  render,
  refresh,
  handleResize,
  startListeners,
  stopListeners,
  getRuntimeStatus,
  destroyUi,
  bootstrapUi,
  language:LanguageRuntime,
  sidebar:SidebarRuntime
});


export {
  initialize,
  boot,
  shutdown,
  reset,
  snapshot,
  initializeUi,
  registerUiElements,
  render,
  refresh,
  handleResize,
  startListeners,
  stopListeners,
  getRuntimeStatus,
  destroyUi,
  bootstrapUi,
  UiRuntime
};

export default UiRuntime;
