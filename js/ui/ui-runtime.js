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



// =====================================
// INITIALIZE
// =====================================

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



// =====================================
// DOM REGISTRATION
// =====================================

function registerUiElements(
  elements = {}
){

  UiElements
  .registerElements(
    elements
  );

  return true;

}



// =====================================
// RENDER
// =====================================

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



// =====================================
// REFRESH
// =====================================

function refresh(){

  UiRenderer
  .renderFrame();

  return true;

}



// =====================================
// RESIZE
// =====================================

function handleResize(){

  UiState
  .setMobile(

    isMobileDevice()

  );

  return true;

}



// =====================================
// START LISTENERS
// =====================================

function startListeners(){

  UiEvents
  .addListener(

    window,

    "resize",

    handleResize

  );

  return true;

}



// =====================================
// STOP LISTENERS
// =====================================

function stopListeners(){

  UiEvents
  .removeAllListeners();

  return true;

}



// =====================================
// STATUS
// =====================================

function getRuntimeStatus(){

  return Object.freeze({

    ui:
    UiState
    .snapshot(),

    renderer:
    UiRenderer
    .getRenderStats(),

    listeners:

    UiEvents
    .getListenerCount()

  });

}



// =====================================
// DESTROY
// =====================================

function destroyUi(){

  stopListeners();

  UiRenderer
  .clearRenderQueue();

  UiState
  .reset();

  return true;

}



// =====================================
// BOOTSTRAP
// =====================================

function bootstrapUi(
  elements = {}
){

  initializeUi();

  registerUiElements(
    elements
  );

  startListeners();

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const UiRuntime =
Object.freeze({

  initializeUi,

  registerUiElements,

  render,

  refresh,

  handleResize,

  startListeners,

  stopListeners,

  getRuntimeStatus,

  destroyUi,

  bootstrapUi

});



// =====================================
// EXPORTS
// =====================================

export {

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

export default
UiRuntime;
