// =====================================
// RIGO AI
// UI ELEMENTS
// DOM ELEMENT REGISTRY
// =====================================

import {
  setElement,
  getElement
}
from "./ui-state.js";



// =====================================
// REGISTER
// =====================================

function registerElement(
  key,
  element
){

  if(
    !key
  ){
    return false;
  }

  setElement(
    key,
    element
  );

  return true;

}



// =====================================
// REGISTER MANY
// =====================================

function registerElements(
  elements = {}
){

  Object.entries(
    elements
  )
  .forEach(

    ([key, element]) => {

      registerElement(
        key,
        element
      );

    }

  );

  return true;

}



// =====================================
// GET
// =====================================

function getUiElement(
  key
){

  return getElement(
    key
  );

}



// =====================================
// EXISTS
// =====================================

function hasElement(
  key
){

  return Boolean(

    getElement(
      key
    )

  );

}



// =====================================
// REMOVE
// =====================================

function removeElement(
  key
){

  setElement(
    key,
    null
  );

  return true;

}



// =====================================
// COMMON ELEMENTS
// =====================================

function getApp(){

  return getElement(
    "app"
  );

}



function getInput(){

  return getElement(
    "input"
  );

}



function getMessagesContainer(){

  return getElement(
    "messagesContainer"
  );

}



function getSendButton(){

  return getElement(
    "sendButton"
  );

}



function getModalContainer(){

  return getElement(
    "modalContainer"
  );

}



function getToastContainer(){

  return getElement(
    "toastContainer"
  );

}



// =====================================
// VALIDATION
// =====================================

function validateElements(){

  return Object.freeze({

    app:
    hasElement(
      "app"
    ),

    input:
    hasElement(
      "input"
    ),

    messagesContainer:
    hasElement(
      "messagesContainer"
    )

  });

}



// =====================================
// PUBLIC API
// =====================================

const UiElements =
Object.freeze({

  registerElement,

  registerElements,

  getUiElement,

  hasElement,

  removeElement,

  getApp,

  getInput,

  getMessagesContainer,

  getSendButton,

  getModalContainer,

  getToastContainer,

  validateElements

});



// =====================================
// EXPORTS
// =====================================

export {

  registerElement,

  registerElements,

  getUiElement,

  hasElement,

  removeElement,

  getApp,

  getInput,

  getMessagesContainer,

  getSendButton,

  getModalContainer,

  getToastContainer,

  validateElements,

  UiElements

};

export default
UiElements;
