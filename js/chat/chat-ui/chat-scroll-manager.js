// =====================================
// RIGO AI
// CHAT SCROLL MANAGER
// UI SCROLL LAYER
// =====================================

import {
  getScrollContainerElement
}
from "./chat-elements.js";



// =====================================
// RUNTIME
// =====================================

const scrollRuntime =
Object.seal({

  scrolls:0,

  restores:0

});



// =====================================
// SCROLL TO BOTTOM
// =====================================

function scrollToBottom(
  smooth = true
){

  const container =

    getScrollContainerElement();

  if(
    !container
  ){
    return false;
  }

  container.scrollTo({

    top:
    container.scrollHeight,

    behavior:

    smooth
    ? "smooth"
    : "auto"

  });

  scrollRuntime
  .scrolls++;

  return true;

}



// =====================================
// IS NEAR BOTTOM
// =====================================

function isNearBottom(
  threshold = 100
){

  const container =

    getScrollContainerElement();

  if(
    !container
  ){
    return false;
  }

  const distance =

    container.scrollHeight

    -

    container.scrollTop

    -

    container.clientHeight;

  return (
    distance <= threshold
  );

}



// =====================================
// SAVE POSITION
// =====================================

function savePosition(){

  const container =

    getScrollContainerElement();

  if(
    !container
  ){
    return null;
  }

  return {

    top:
    container.scrollTop

  };

}



// =====================================
// RESTORE POSITION
// =====================================

function restorePosition(
  snapshot
){

  const container =

    getScrollContainerElement();

  if(
    !container
  ){
    return false;
  }

  if(
    !snapshot
  ){
    return false;
  }

  container.scrollTop =

    snapshot.top ??
    0;

  scrollRuntime
  .restores++;

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    scrolls:
    scrollRuntime
    .scrolls,

    restores:
    scrollRuntime
    .restores

  });

}



// =====================================
// RESET
// =====================================

function reset(){

  scrollRuntime
  .scrolls = 0;

  scrollRuntime
  .restores = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatScrollManager =
Object.freeze({

  scrollToBottom,

  isNearBottom,

  savePosition,

  restorePosition,

  status:
  getStatus,

  reset

});



// =====================================
// EXPORTS
// =====================================

export {

  scrollToBottom,

  isNearBottom,

  savePosition,

  restorePosition,

  getStatus,

  reset,

  ChatScrollManager

};

export default
ChatScrollManager;
