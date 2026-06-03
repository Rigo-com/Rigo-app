// =====================================
// RIGO AI
// CHAT RENDER SERVICE
// =====================================

import {
  CHAT_EVENTS
}
from "../chat-config.js";

import {
  emit
}
from "../chat-events/chat-events.js";



// =====================================
// SERVICE STATE
// =====================================

const serviceState =
Object.seal({

  initialized:false

});



// =====================================
// RENDER RUNTIME
// =====================================

const renderRuntime =
Object.seal({

  queue:[],

  rendering:false,

  scheduled:false,

  frameId:null,

  renderCount:0

});



let renderCounter = 0;



// =====================================
// HELPERS
// =====================================

function createRenderTaskId(){

  renderCounter++;

  return (

    "render_" +

    Date.now() +

    "_" +

    renderCounter

  );

}



function cancelRenderFrame(){

  if(
    renderRuntime.frameId ===
    null
  ){
    return true;
  }

  if(

    typeof cancelAnimationFrame ===
    "function"

    &&

    typeof requestAnimationFrame ===
    "function"

  ){

    cancelAnimationFrame(
      renderRuntime.frameId
    );

  }

  else{

    clearTimeout(
      renderRuntime.frameId
    );

  }

  renderRuntime.frameId =
  null;

  return true;

}



function scheduleRender(){

  if(
    renderRuntime.scheduled
  ){
    return true;
  }

  renderRuntime.scheduled =
  true;

  if(
    typeof requestAnimationFrame ===
    "function"
  ){

    renderRuntime.frameId =

      requestAnimationFrame(
        renderBatch
      );

  }

  else{

    renderRuntime.frameId =

      setTimeout(
        renderBatch,
        0
      );

  }

  return true;

}




// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    serviceState.initialized
  ){
    return true;
  }

  serviceState.initialized =
  true;

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  reset();

  serviceState.initialized =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  cancelRenderFrame();

  renderRuntime.queue =
  [];

  renderRuntime.rendering =
  false;

  renderRuntime.scheduled =
  false;

  renderRuntime.renderCount =
  0;

  renderCounter = 0;

  return true;

}



// =====================================
// ENQUEUE RENDER
// =====================================

function enqueueRender(
  task = {}
){

  if(
    !task
  ){
    return false;
  }

  if(
    typeof task.handler !==
    "function"
  ){
    return false;
  }

  const renderTask = {

    id:

    task.id ||

    createRenderTaskId(),

    handler:
    task.handler,

    payload:
    task.payload

  };

  renderRuntime
  .queue
  .push(
    renderTask
  );

  emit(

    CHAT_EVENTS
    .RENDER_ENQUEUED,

    {

      id:
      renderTask.id

    }

  );

  scheduleRender();

  return renderTask.id;

}



// =====================================
// RENDER
// =====================================

function render(
  task
){

  if(
    !task
  ){
    return false;
  }

  if(
    typeof task.handler !==
    "function"
  ){
    return false;
  }

  try{

    task.handler(
      task.payload
    );

    renderRuntime
    .renderCount++;

    return true;

  }

  catch(error){

    console.error(
      "[CHAT RENDER]",
      error
    );

    return false;

  }

}



// =====================================
// RENDER BATCH
// =====================================

function renderBatch(){

  if(
    renderRuntime.rendering
  ){
    return false;
  }

  renderRuntime.rendering =
  true;

  renderRuntime.scheduled =
  false;

  emit(
    CHAT_EVENTS
    .RENDER_STARTED
  );

  while(

    renderRuntime
    .queue
    .length > 0

  ){

    const task =

      renderRuntime
      .queue
      .shift();

    render(
      task
    );

  }

  renderRuntime.rendering =
  false;

  emit(
    CHAT_EVENTS
    .RENDER_COMPLETED
  );

  return true;

}



// =====================================
// FLUSH
// =====================================

function flush(){

  return renderBatch();

}



// =====================================
// CLEAR
// =====================================

function clear(){

  renderRuntime
  .queue =
  [];

  emit(
    CHAT_EVENTS
    .RENDER_CLEARED
  );

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    rendering:
    renderRuntime
    .rendering,

    scheduled:
    renderRuntime
    .scheduled,

    queueSize:
    renderRuntime
    .queue
    .length,

    renderCount:
    renderRuntime
    .renderCount

  });

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    rendering:
    renderRuntime
    .rendering,

    scheduled:
    renderRuntime
    .scheduled,

    queueSize:
    renderRuntime
    .queue
    .length,

    renderCount:
    renderRuntime
    .renderCount

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatRenderService =
Object.freeze({

  initialize,

  destroy,

  reset,

  status:
  getStatus,

  snapshot:
  getSnapshot,

  enqueueRender,

  render,

  renderBatch,

  flush,

  clear

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  reset,

  enqueueRender,

  render,

  renderBatch,

  flush,

  clear,

  getStatus,

  getSnapshot,

  ChatRenderService

};

export default
ChatRenderService;
