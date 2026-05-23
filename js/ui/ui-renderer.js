// =====================================
// RIGO AI
// UI RENDERER
// ENTERPRISE RENDER PIPELINE
// =====================================



// =====================================
// RENDER STATE
// =====================================

const uiRenderState =
Object.seal({

  scheduled:false,

  rendering:false,

  pendingFrame:null,

  renderQueue:[],

  completedRenders:0,

  failedRenders:0,

  cancelledFrames:0

});



// =====================================
// VALIDATE RENDER CALLBACK
// =====================================

function validateRenderCallback(
  callback
){

  return (
    typeof callback ===
    "function"
  );

}



// =====================================
// SAFE RENDER EXECUTION
// =====================================

function safelyExecuteRender(
  callback
){

  if(
    !validateRenderCallback(
      callback
    )
  ){

    return false;

  }

  try{

    callback();

    uiRenderState
    .completedRenders++;

    uiState.lastRenderAt =
    Date.now();

    return true;

  }

  catch(error){

    uiRenderState
    .failedRenders++;

    safeLogError(

      "UI RENDER ERROR",

      error

    );

    return false;

  }

}



// =====================================
// PROCESS RENDER QUEUE
// =====================================

function processUIRenderQueue(){

  if(
    uiRenderState
    .rendering
  ){

    return false;

  }

  if(

    uiState
    .renderLocked

  ){

    return false;

  }

  if(

    uiRenderState
    .renderQueue
    .length <= 0

  ){

    uiRenderState
    .scheduled =
    false;

    return true;

  }

  uiRenderState
  .rendering =
  true;

  uiState
  .rendering =
  true;

  const executeQueue = () => {

    try{

      while(

        uiRenderState
        .renderQueue
        .length > 0

      ){

        const callback =

          uiRenderState
          .renderQueue
          .shift();

        safelyExecuteRender(
          callback
        );

      }

    }

    finally{

      uiRenderState
      .rendering =
      false;

      uiState
      .rendering =
      false;

      uiRenderState
      .scheduled =
      false;

      uiRenderState
      .pendingFrame =
      null;

    }

  };

  if(

    typeof requestAnimationFrame !==
    "function"

  ){

    executeQueue();

    return true;

  }

  uiRenderState
  .pendingFrame =

  requestAnimationFrame(
    executeQueue
  );

  return true;

}



// =====================================
// QUEUE RENDER
// =====================================

function queueUIRender(
  callback
){

  if(
    !validateRenderCallback(
      callback
    )
  ){

    return false;

  }

  if(
    uiState.destroyed
  ){

    return false;

  }

  if(

    uiRenderState
    .renderQueue
    .length >=

    UI_CONFIG
    .MAX_RENDER_QUEUE

  ){

    uiRenderState
    .failedRenders++;

    return false;

  }

  uiRenderState
  .renderQueue
  .push(
    callback
  );

  if(
    !uiRenderState
    .scheduled
  ){

    uiRenderState
    .scheduled =
    true;

    processUIRenderQueue();

  }

  return true;

}



// =====================================
// REQUEST UI FRAME
// =====================================

function requestUIAnimationFrame(
  callback
){

  return queueUIRender(
    callback
  );

}



// =====================================
// CANCEL UI FRAME
// =====================================

function cancelUIAnimationFrame(){

  if(

    typeof cancelAnimationFrame !==
    "function"

  ){

    uiRenderState
    .pendingFrame =
    null;

    return false;

  }

  if(
    uiRenderState
    .pendingFrame
  ){

    cancelAnimationFrame(

      uiRenderState
      .pendingFrame

    );

    uiRenderState
    .cancelledFrames++;

    uiRenderState
    .pendingFrame =
    null;

  }

  uiRenderState
  .scheduled =
  false;

  return true;

}



// =====================================
// CLEAR RENDER QUEUE
// =====================================

function clearUIRenderQueue(){

  uiRenderState
  .renderQueue
  .length = 0;

  return true;

}



// =====================================
// LOCK RENDERING
// =====================================

function lockUIRendering(){

  uiState.renderLocked =
  true;

  return true;

}



// =====================================
// UNLOCK RENDERING
// =====================================

function unlockUIRendering(){

  uiState.renderLocked =
  false;

  if(

    uiRenderState
    .renderQueue
    .length > 0

  ){

    processUIRenderQueue();

  }

  return true;

}



// =====================================
// RENDER DIAGNOSTICS
// =====================================

function getUIRenderDiagnostics(){

  return Object.freeze({

    scheduled:
    uiRenderState
    .scheduled,

    rendering:
    uiRenderState
    .rendering,

    queueSize:

      uiRenderState
      .renderQueue
      .length,

    completedRenders:

      uiRenderState
      .completedRenders,

    failedRenders:

      uiRenderState
      .failedRenders,

    cancelledFrames:

      uiRenderState
      .cancelledFrames,

    renderLocked:
    uiState
    .renderLocked

  });

}



// =====================================
// PUBLIC API
// =====================================

const UIRenderer =
Object.freeze({

  queue:
  queueUIRender,

  requestFrame:
  requestUIAnimationFrame,

  cancelFrame:
  cancelUIAnimationFrame,

  clearQueue:
  clearUIRenderQueue,

  lock:
  lockUIRendering,

  unlock:
  unlockUIRendering,

  diagnostics:
  getUIRenderDiagnostics

});
