// =====================================
// RIGO AI
// APP DOM
// =====================================



// =====================================
// IMPORTS
// =====================================

import AppState
from "./app-state.js";



// =====================================
// HELPERS
// =====================================

function isBrowser(){

  return (
    typeof document !==
    "undefined"
  );

}



function getElement(
  selector
){

  if(
    !isBrowser()
  ){

    return null;

  }

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



function getElements(
  selector
){

  if(
    !isBrowser()
  ){

    return [];

  }

  if(
    !selector
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



function elementExists(
  selector
){

  return Boolean(
    getElement(
      selector
    )
  );

}



// =====================================
// DOM READY
// =====================================

async function waitForDOMReady(){

  if(
    !isBrowser()
  ){

    return false;

  }

  if(

    document.readyState ===
    "complete"

    ||

    document.readyState ===
    "interactive"

  ){

    return true;

  }

  return new Promise(
    (resolve) => {

      document
      .addEventListener(

        "DOMContentLoaded",

        () => {

          resolve(
            true
          );

        },

        {

          once:true

        }

      );

    }
  );

}



// =====================================
// ROOT ELEMENT
// =====================================

function getAppRoot(){

  return (

    getElement(
      "#app"
    )

    ||

    getElement(
      "[data-app-root]"
    )

    ||

    document.body

  );

}



// =====================================
// UI STATE
// =====================================

function showApp(){

  const root =
  getAppRoot();

  if(
    !root
  ){

    return false;

  }

  root.hidden =
  false;

  AppState
  .setReady(
    true
  );

  return true;

}



function hideApp(){

  const root =
  getAppRoot();

  if(
    !root
  ){

    return false;

  }

  root.hidden =
  true;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createDOMSnapshot(){

  return Object.freeze({

    ready:

      typeof document !==
      "undefined"

      ?

      document.readyState

      :

      "unavailable",

    rootExists:
    Boolean(
      getAppRoot()
    ),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AppDOM =
Object.freeze({

  getElement,

  getElements,

  elementExists,

  waitForDOMReady,

  getAppRoot,

  showApp,

  hideApp,

  snapshot:
  createDOMSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  getElement,

  getElements,

  elementExists,

  waitForDOMReady,

  getAppRoot,

  showApp,

  hideApp,

  createDOMSnapshot,

  AppDOM

};

export default
AppDOM;
