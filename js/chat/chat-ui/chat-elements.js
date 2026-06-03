// =====================================
// RIGO AI
// CHAT ELEMENTS
// UI ELEMENT REGISTRY
// =====================================



// =====================================
// ELEMENT CACHE
// =====================================

const elementCache =
Object.seal({

  root:null,

  messages:null,

  input:null,

  sendButton:null,

  scrollContainer:null

});



// =====================================
// HELPERS
// =====================================

function query(
  selector
){

  if(
    !selector
  ){
    return null;
  }

  return document
  .querySelector(
    selector
  );

}



// =====================================
// REGISTER
// =====================================

function registerElements(
  elements = {}
){

  Object.assign(
    elementCache,
    elements
  );

  return true;

}



// =====================================
// CLEAR
// =====================================

function clearElements(){

  elementCache.root = null;

  elementCache.messages = null;

  elementCache.input = null;

  elementCache.sendButton = null;

  elementCache.scrollContainer = null;

  return true;

}



// =====================================
// ROOT
// =====================================

function getRootElement(){

  return (
    elementCache.root
    ?? null
  );

}



function setRootElement(
  element
){

  elementCache.root =
  element ?? null;

  return true;

}



// =====================================
// MESSAGE CONTAINER
// =====================================

function getMessagesElement(){

  return (
    elementCache.messages
    ?? null
  );

}



function setMessagesElement(
  element
){

  elementCache.messages =
  element ?? null;

  return true;

}



// =====================================
// INPUT
// =====================================

function getInputElement(){

  return (
    elementCache.input
    ?? null
  );

}



function setInputElement(
  element
){

  elementCache.input =
  element ?? null;

  return true;

}



// =====================================
// SEND BUTTON
// =====================================

function getSendButtonElement(){

  return (
    elementCache.sendButton
    ?? null
  );

}



function setSendButtonElement(
  element
){

  elementCache.sendButton =
  element ?? null;

  return true;

}



// =====================================
// SCROLL CONTAINER
// =====================================

function getScrollContainerElement(){

  return (

    elementCache
    .scrollContainer

    ?? null

  );

}



function setScrollContainerElement(
  element
){

  elementCache
  .scrollContainer =
  element ?? null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function getSnapshot(){

  return Object.freeze({

    root:
    Boolean(
      elementCache.root
    ),

    messages:
    Boolean(
      elementCache.messages
    ),

    input:
    Boolean(
      elementCache.input
    ),

    sendButton:
    Boolean(
      elementCache.sendButton
    ),

    scrollContainer:
    Boolean(
      elementCache
      .scrollContainer
    )

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatElements =
Object.freeze({

  query,

  registerElements,

  clearElements,

  getRootElement,
  setRootElement,

  getMessagesElement,
  setMessagesElement,

  getInputElement,
  setInputElement,

  getSendButtonElement,
  setSendButtonElement,

  getScrollContainerElement,
  setScrollContainerElement,

  snapshot:
  getSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  query,

  registerElements,

  clearElements,

  getRootElement,
  setRootElement,

  getMessagesElement,
  setMessagesElement,

  getInputElement,
  setInputElement,

  getSendButtonElement,
  setSendButtonElement,

  getScrollContainerElement,
  setScrollContainerElement,

  getSnapshot,

  ChatElements

};

export default
ChatElements;
