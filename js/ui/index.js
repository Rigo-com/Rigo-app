// =====================================
// RIGO AI
// UI INDEX
// ENTERPRISE UI RUNTIME
// FINAL HARDENED EDITION
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
// INTERNAL HELPERS
// =====================================

function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



function normalizeUIError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN_UI_ERROR"
  );

}



function emitUIWarning(
  message,
  error = null
){

  console.warn(

    `[RIGOUIRuntime] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateUILayer(){

  if(
    typeof globalThis ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "UIRuntime",
    "UIRenderer",
    "UIEvents",
    "UIElements",
    "RIGOSidebarRuntime"

  ];

  const missingSystems =

    requiredSystems.filter((systemName) => {

      return (

        typeof globalThis[
          systemName
        ] ===

        "undefined"

      );

    });

  if(
    missingSystems.length > 0
  ){

    emitUIWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZE UI SYSTEM
// =====================================

async function initializeUISystem(){

  try{

    if(
      !validateUILayer()
    ){

      return false;

    }

    if(

      typeof UIRuntime ===
      "undefined"

      ||

      !isFunction(
        UIRuntime
        .initialize
      )

    ){

      return false;

    }

    return await UIRuntime
    .initialize();

  }

  catch(error){

    emitUIWarning(

      "Initialization failed",

      normalizeUIError(
        error
      )

    );

    return false;

  }

}



// =====================================
// RESET UI SYSTEM
// =====================================

async function resetUISystem(){

  try{

    if(

      typeof UIRuntime ===
      "undefined"

      ||

      !isFunction(
        UIRuntime
        .reset
      )

    ){

      return false;

    }

    return await UIRuntime
    .reset();

  }

  catch(error){

    emitUIWarning(

      "Reset failed",

      normalizeUIError(
        error
      )

    );

    return false;

  }

}



// =====================================
// DESTROY UI SYSTEM
// =====================================

async function destroyUISystem(){

  try{

    if(

      typeof UIRuntime ===
      "undefined"

      ||

      !isFunction(
        UIRuntime
        .destroy
      )

    ){

      return false;

    }

    return await UIRuntime
    .destroy();

  }

  catch(error){

    emitUIWarning(

      "Destroy failed",

      normalizeUIError(
        error
      )

    );

    return false;

  }

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

      isFunction(
        UIRuntime
        .diagnostics
      )

      ?

      UIRuntime
      .diagnostics()

      :

      null,



    renderer:

      typeof UIRenderer !==
      "undefined"

      &&

      isFunction(
        UIRenderer
        .diagnostics
      )

      ?

      UIRenderer
      .diagnostics()

      :

      null,



    events:

      typeof UIEvents !==
      "undefined"

      &&

      isFunction(
        UIEvents
        .diagnostics
      )

      ?

      UIEvents
      .diagnostics()

      :

      null,



    elements:

      typeof UIElements !==
      "undefined"

      &&

      isFunction(
        UIElements
        .diagnostics
      )

      ?

      UIElements
      .diagnostics()

      :

      null,



    sidebar:

      typeof RIGOSidebarRuntime !==
      "undefined"

      &&

      isFunction(
        RIGOSidebarRuntime
        .diagnostics
      )

      ?

      RIGOSidebarRuntime
      .diagnostics()

      :

      null,



    state:

      typeof uiState !==
      "undefined"

      ?

      uiState

      :

      null,



    healthy:
    validateUILayer(),



    timestamp:
    Date.now()

  });

}



// =====================================
// UI PUBLIC API
// =====================================

const RIGOUIRuntime =
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



  snapshot:
  getUISystemDiagnostics,



  validate:
  validateUILayer,



  // ===================================
  // MODULES
  // ===================================

  get runtime(){

    return (

      typeof UIRuntime !==
      "undefined"

      ?

      UIRuntime

      :

      null

    );

  },



  get renderer(){

    return (

      typeof UIRenderer !==
      "undefined"

      ?

      UIRenderer

      :

      null

    );

  },



  get events(){

    return (

      typeof UIEvents !==
      "undefined"

      ?

      UIEvents

      :

      null

    );

  },



  get elements(){

    return (

      typeof UIElements !==
      "undefined"

      ?

      UIElements

      :

      null

    );

  },



  get sidebar(){

    return (

      typeof RIGOSidebarRuntime !==
      "undefined"

      ?

      RIGOSidebarRuntime

      :

      null

    );

  },



  get state(){

    return (

      typeof uiState !==
      "undefined"

      ?

      uiState

      :

      null

    );

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGOUIRuntime,

  initializeUISystem,

  resetUISystem,

  destroyUISystem,

  isUIReady,

  getUISystemDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGOUIRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOUIRuntime",

    {

      value:
      RIGOUIRuntime,

      writable:false,

      configurable:false

    }

  );

}
