// =====================================
// RIGO AI
// SIDEBAR ELEMENTS
// DOM REFERENCES LAYER
// =====================================

import {
  SidebarState
}
from "./sidebar-state.js";



// =====================================
// SIDEBAR ELEMENTS
// =====================================

const sidebarElements =
Object.seal({

  sidebar:null,

  overlay:null,

  toggleButton:null,

  closeButton:null,

  content:null,

  header:null,

  body:null,

  footer:null,

  navigation:null,

  search:null

});



// =====================================
// SETTERS
// =====================================

function setElement(
  key,
  element
){

  if(
    !(key in sidebarElements)
  ){

    return false;

  }

  sidebarElements[
    key
  ] = element;

  SidebarState
  .setElement(
    key,
    element
  );

  return true;

}



// =====================================
// GETTERS
// =====================================

function getElement(
  key
){

  return (

    sidebarElements[
      key
    ]

    ??

    null

  );

}



function hasElement(
  key
){

  return Boolean(
    getElement(key)
  );

}



// =====================================
// BULK
// =====================================

function registerElements(
  elements = {}
){

  Object.entries(
    elements
  )
  .forEach(([key,value]) => {

    setElement(
      key,
      value
    );

  });

  return true;

}



function getAllElements(){

  return Object.freeze({

    ...sidebarElements

  });

}



// =====================================
// QUERY HELPERS
// =====================================

function queryElement(
  selector
){

  if(
    typeof document ===
    "undefined"
  ){

    return null;

  }

  return document
  .querySelector(
    selector
  );

}



function queryElements(
  selector
){

  if(
    typeof document ===
    "undefined"
  ){

    return [];
  }

  return [

    ...document
    .querySelectorAll(
      selector
    )

  ];

}



// =====================================
// RESET
// =====================================

function resetElements(){

  Object.keys(
    sidebarElements
  )
  .forEach(key => {

    sidebarElements[
      key
    ] = null;

  });

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SidebarElements =
Object.freeze({

  setElement,
  getElement,
  hasElement,

  registerElements,
  getAllElements,

  queryElement,
  queryElements,

  reset:
  resetElements

});



// =====================================
// EXPORTS
// =====================================

export {

  sidebarElements,

  SidebarElements

};

export default
SidebarElements;
