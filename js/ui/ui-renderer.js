// =====================================
// RIGO AI
// UI RENDERER
// RENDER PIPELINE
// =====================================

import {
  uiState,
  UI_CONFIG
}
from "./ui-state.js";



// =====================================
// RENDER QUEUE
// =====================================

function enqueueRender(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(

    uiState
    .renderQueue
    .length >=

    UI_CONFIG
    .MAX_RENDER_QUEUE

  ){

    return false;

  }

  uiState
  .renderQueue
  .push(
    callback
  );

  return true;

}



// =====================================
// PROCESS QUEUE
// =====================================

function processRenderQueue(){

  if(
    uiState.renderLocked
  ){

    return 0;

  }

  uiState.renderLocked =
  true;

  let processed = 0;

  while(

    uiState
    .renderQueue
    .length > 0

  ){

    const callback =

      uiState
      .renderQueue
      .shift();

    try{

      callback();

      processed++;

    }

    catch(error){

      console.error(

        "[UI RENDER]",

        error

      );

    }

  }

  uiState.renderLocked =
  false;

  uiState.lastRenderAt =
  Date.now();

  return processed;

}



// =====================================
// RENDER FRAME
// =====================================

function renderFrame(){

  if(
    uiState.rendering
  ){

    return false;

  }

  uiState.rendering =
  true;

  uiState.animationFrame =

    requestAnimationFrame(
      () => {

        processRenderQueue();

        uiState.rendering =
        false;

      }
    );

  return true;

}



// =====================================
// BATCH RENDER
// =====================================

function batchRender(
  callbacks = []
){

  if(
    !Array.isArray(
      callbacks
    )
  ){

    return false;

  }

  for(
    const callback
    of callbacks
  ){

    enqueueRender(
      callback
    );

  }

  renderFrame();

  return true;

}



// =====================================
// FORCE RENDER
// =====================================

function forceRender(
  callback
){

  try{

    callback();

    uiState.lastRenderAt =
    Date.now();

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CLEAR QUEUE
// =====================================

function clearRenderQueue(){

  uiState.renderQueue =
  [];

  return true;

}



// =====================================
// RENDER STATS
// =====================================

function getRenderStats(){

  return Object.freeze({

    rendering:
    uiState.rendering,

    queued:

    uiState
    .renderQueue
    .length,

    locked:
    uiState
    .renderLocked,

    lastRenderAt:
    uiState
    .lastRenderAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const UiRenderer =
Object.freeze({

  enqueueRender,

  processRenderQueue,

  renderFrame,

  batchRender,

  forceRender,

  clearRenderQueue,

  getRenderStats

});



// =====================================
// EXPORTS
// =====================================

export {

  enqueueRender,

  processRenderQueue,

  renderFrame,

  batchRender,

  forceRender,

  clearRenderQueue,

  getRenderStats,

  UiRenderer

};

export default
UiRenderer;
