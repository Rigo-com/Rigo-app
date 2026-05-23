// =====================================
// RIGO AI
// UI INDEX
// ENTERPRISE UI PUBLIC API
// =====================================



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

    uiState.initialized ===
    true

    &&

    uiState.destroyed ===
    false

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
  UIRuntime,

  renderer:
  UIRenderer,

  events:
  UIEvents,

  elements:
  UIElements,

  state:
  uiState

});
