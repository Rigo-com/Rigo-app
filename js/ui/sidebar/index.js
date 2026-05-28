// =====================================
// RIGO AI
// SIDEBAR INDEX
// ENTERPRISE SIDEBAR RUNTIME
// FINAL HARDENED EDITION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "./sidebar-state.js";
import "./sidebar-elements.js";
import "./sidebar-events.js";
import "./sidebar-actions.js";
import "./sidebar-renderer.js";
import "./sidebar-runtime.js";



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



function normalizeSidebarError(
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
    error || "UNKNOWN_SIDEBAR_ERROR"
  );

}



function emitSidebarWarning(
  message,
  error = null
){

  console.warn(

    `[RIGOSidebarRuntime] ${message}`,

    error || ""

  );

}



// =====================================
// VALIDATION
// =====================================

function validateSidebarLayer(){

  if(
    typeof globalThis ===
    "undefined"
  ){

    return false;

  }

  const requiredSystems = [

    "SidebarRuntime",
    "SidebarRenderer",
    "SidebarActions",
    "SidebarEvents"

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

    emitSidebarWarning(

      `Missing systems: ${missingSystems.join(", ")}`

    );

    return false;

  }

  return true;

}



// =====================================
// INITIALIZE SIDEBAR SYSTEM
// =====================================

async function initializeSidebarSystem(){

  try{

    if(
      !validateSidebarLayer()
    ){

      return false;

    }

    if(
      !isFunction(
        SidebarRuntime
        .initialize
      )
    ){

      return false;

    }

    return await SidebarRuntime
    .initialize();

  }

  catch(error){

    emitSidebarWarning(

      "Initialization failed",

      normalizeSidebarError(
        error
      )

    );

    return false;

  }

}



// =====================================
// RESET SIDEBAR SYSTEM
// =====================================

async function resetSidebarSystem(){

  try{

    if(

      typeof SidebarRuntime ===
      "undefined"

      ||

      !isFunction(
        SidebarRuntime
        .reset
      )

    ){

      return false;

    }

    return await SidebarRuntime
    .reset();

  }

  catch(error){

    emitSidebarWarning(

      "Reset failed",

      normalizeSidebarError(
        error
      )

    );

    return false;

  }

}



// =====================================
// DESTROY SIDEBAR SYSTEM
// =====================================

async function destroySidebarSystem(){

  try{

    if(

      typeof SidebarRuntime ===
      "undefined"

      ||

      !isFunction(
        SidebarRuntime
        .destroy
      )

    ){

      return false;

    }

    return await SidebarRuntime
    .destroy();

  }

  catch(error){

    emitSidebarWarning(

      "Destroy failed",

      normalizeSidebarError(
        error
      )

    );

    return false;

  }

}



// =====================================
// SIDEBAR READY
// =====================================

function isSidebarReady(){

  return (

    typeof sidebarRuntimeState !==
    "undefined"

    &&

    sidebarRuntimeState
    .initialized ===
    true

    &&

    sidebarRuntimeState
    .destroyed !==
    true

  );

}



// =====================================
// REFRESH SIDEBAR
// =====================================

async function refreshSidebarSystem(){

  try{

    if(

      typeof SidebarActions ===
      "undefined"

      ||

      !isFunction(
        SidebarActions
        .refresh
      )

    ){

      return false;

    }

    return await SidebarActions
    .refresh();

  }

  catch(error){

    emitSidebarWarning(

      "Refresh failed",

      normalizeSidebarError(
        error
      )

    );

    return false;

  }

}



// =====================================
// SIDEBAR DIAGNOSTICS
// =====================================

function getSidebarSystemDiagnostics(){

  return Object.freeze({

    runtime:

      typeof SidebarRuntime !==
      "undefined"

      &&

      isFunction(
        SidebarRuntime
        .diagnostics
      )

      ?

      SidebarRuntime
      .diagnostics()

      :

      null,



    renderer:

      typeof SidebarRenderer !==
      "undefined"

      &&

      isFunction(
        SidebarRenderer
        .diagnostics
      )

      ?

      SidebarRenderer
      .diagnostics()

      :

      null,



    events:

      typeof SidebarEvents !==
      "undefined"

      &&

      isFunction(
        SidebarEvents
        .diagnostics
      )

      ?

      SidebarEvents
      .diagnostics()

      :

      null,



    actions:

      typeof SidebarActions !==
      "undefined"

      &&

      isFunction(
        SidebarActions
        .diagnostics
      )

      ?

      SidebarActions
      .diagnostics()

      :

      null,



    elements:

      typeof SidebarElements !==
      "undefined"

      &&

      isFunction(
        SidebarElements
        .diagnostics
      )

      ?

      SidebarElements
      .diagnostics()

      :

      null,



    state:

      typeof getSidebarDiagnostics ===
      "function"

      ?

      getSidebarDiagnostics()

      :

      null,



    healthy:
    validateSidebarLayer(),



    timestamp:
    Date.now()

  });

}



// =====================================
// SIDEBAR PUBLIC API
// =====================================

const RIGOSidebarRuntime =
Object.freeze({

  initialize:
  initializeSidebarSystem,



  reset:
  resetSidebarSystem,



  destroy:
  destroySidebarSystem,



  refresh:
  refreshSidebarSystem,



  isReady:
  isSidebarReady,



  diagnostics:
  getSidebarSystemDiagnostics,



  snapshot:
  getSidebarSystemDiagnostics,



  validate:
  validateSidebarLayer,



  // ===================================
  // MODULES
  // ===================================

  get runtime(){

    return (

      typeof SidebarRuntime !==
      "undefined"

      ?

      SidebarRuntime

      :

      null

    );

  },



  get renderer(){

    return (

      typeof SidebarRenderer !==
      "undefined"

      ?

      SidebarRenderer

      :

      null

    );

  },



  get events(){

    return (

      typeof SidebarEvents !==
      "undefined"

      ?

      SidebarEvents

      :

      null

    );

  },



  get actions(){

    return (

      typeof SidebarActions !==
      "undefined"

      ?

      SidebarActions

      :

      null

    );

  },



  get elements(){

    return (

      typeof SidebarElements !==
      "undefined"

      ?

      SidebarElements

      :

      null

    );

  },



  get state(){

    return (

      typeof sidebarRuntimeState !==
      "undefined"

      ?

      sidebarRuntimeState

      :

      null

    );

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGOSidebarRuntime,

  initializeSidebarSystem,

  resetSidebarSystem,

  destroySidebarSystem,

  refreshSidebarSystem,

  isSidebarReady,

  getSidebarSystemDiagnostics

};



// =====================================
// DEFAULT EXPORT
// =====================================

export default
RIGOSidebarRuntime;



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGOSidebarRuntime",

    {

      value:
      RIGOSidebarRuntime,

      writable:false,

      configurable:false

    }

  );

}
