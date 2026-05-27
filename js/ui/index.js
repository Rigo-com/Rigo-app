// =====================================
// RIGO AI
// UI INDEX
// ENTERPRISE UI PUBLIC API
// FINAL STABILIZED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./ui-state.js";
import "./ui-utils.js";
import "./ui-elements.js";
import "./ui-events.js";
import "./ui-renderer.js";
import "./ui-runtime.js";

import "./sidebar/index.js";



// =====================================
// INITIALIZE UI SYSTEM
// =====================================

function initializeUISystem(){

  if(
    typeof UIRuntime ===
    "undefined"
  ){

    return false;

  }

  return UIRuntime
  .initialize();

}



// =====================================
// RESET UI SYSTEM
// =====================================

function resetUISystem(){

  if(
    typeof UIRuntime ===
    "undefined"
  ){

    return false;

  }

  return UIRuntime
  .reset();

}



// =====================================
// DESTROY UI SYSTEM
// =====================================

function destroyUISystem(){

  if(
    typeof UIRuntime ===
    "undefined"
  ){

    return false;

  }

  return UIRuntime
  .destroy();

}



// =====================================
// UI READY
// =====================================

function isUIReady(){

  return (

    typeof uiState !==
    "undefined"

    &&

    uiState
    .initialized ===
    true

    &&

    uiState
    .destroyed !==
    true

  );

}



// =====================================
// UI DIAGNOSTICS
// =====================================

function getUISystemDiagnostics(){

  return Object.freeze({

    runtime:

      typeof UIRuntime !==
      "undefined"

      &&

      typeof UIRuntime
      .diagnostics ===
      "function"

      ?

      UIRuntime
      .diagnostics()

      :

      null,



    renderer:

      typeof UIRenderer !==
      "undefined"

      &&

      typeof UIRenderer
      .diagnostics ===
      "function"

      ?

      UIRenderer
      .diagnostics()

      :

      null,



    events:

      typeof UIEvents !==
      "undefined"

      &&

      typeof UIEvents
      .diagnostics ===
      "function"

      ?

      UIEvents
      .diagnostics()

      :

      null,



    elements:

      typeof UIElements !==
      "undefined"

      &&

      typeof UIElements
      .diagnostics ===
      "function"

      ?

      UIElements
      .diagnostics()

      :

      null,



    sidebar:

      typeof Sidebar !==
      "undefined"

      &&

      typeof Sidebar
      .diagnostics ===
      "function"

      ?

      Sidebar
      .diagnostics()

      :

      null,



    state:

      typeof uiState !==
      "undefined"

      ?

      uiState

      :

      null

  });

}



// =====================================
// UI PUBLIC API
// =====================================

const UI =
Object.freeze({

  initialize:
  initializeUISystem,



  reset:
  resetUISystem,



  destroy:
  destroyUISystem,



  isReady:
  isUIReady,



  diagnostics:
  getUISystemDiagnostics,



  // ===================================
  // MODULES
  // ===================================

  runtime:

    typeof UIRuntime !==
    "undefined"

    ?

    UIRuntime

    :

    null,



  renderer:

    typeof UIRenderer !==
    "undefined"

    ?

    UIRenderer

    :

    null,



  events:

    typeof UIEvents !==
    "undefined"

    ?

    UIEvents

    :

    null,



  elements:

    typeof UIElements !==
    "undefined"

    ?

    UIElements

    :

    null,



  sidebar:

    typeof Sidebar !==
    "undefined"

    ?

    Sidebar

    :

    null,



  state:

    typeof uiState !==
    "undefined"

    ?

    uiState

    :

    null

});



// =====================================
// EXPORTS
// =====================================

export {

  UI,

  initializeUISystem,

  resetUISystem,

  destroyUISystem,

  isUIReady,

  getUISystemDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default UI;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  globalThis.UI =
  UI;

}
