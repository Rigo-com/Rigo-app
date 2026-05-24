// =====================================
// RIGO AI
// SIDEBAR INDEX
// ENTERPRISE SIDEBAR PUBLIC API
// =====================================



// =====================================
// INITIALIZE SIDEBAR SYSTEM
// =====================================

function initializeSidebarSystem(){

  if(
    typeof SidebarRuntime ===
    "undefined"
  ){

    return false;

  }

  return SidebarRuntime
  .initialize();

}



// =====================================
// RESET SIDEBAR SYSTEM
// =====================================

function resetSidebarSystem(){

  if(
    typeof SidebarRuntime ===
    "undefined"
  ){

    return false;

  }

  return SidebarRuntime
  .reset();

}



// =====================================
// DESTROY SIDEBAR SYSTEM
// =====================================

function destroySidebarSystem(){

  if(
    typeof SidebarRuntime ===
    "undefined"
  ){

    return false;

  }

  return SidebarRuntime
  .destroy();

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
    .destroyed ===
    false

  );

}



// =====================================
// REFRESH SIDEBAR
// =====================================

function refreshSidebarSystem(){

  if(
    typeof SidebarActions ===
    "undefined"
  ){

    return false;

  }

  return SidebarActions
  .refresh();

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

      typeof SidebarRuntime
      .diagnostics ===
      "function"

      ?

      SidebarRuntime
      .diagnostics()

      :

      null,



    renderer:

      typeof SidebarRenderer !==
      "undefined"

      &&

      typeof SidebarRenderer
      .diagnostics ===
      "function"

      ?

      SidebarRenderer
      .diagnostics()

      :

      null,



    events:

      typeof SidebarEvents !==
      "undefined"

      &&

      typeof SidebarEvents
      .diagnostics ===
      "function"

      ?

      SidebarEvents
      .diagnostics()

      :

      null,



    actions:

      typeof SidebarActions !==
      "undefined"

      &&

      typeof SidebarActions
      .diagnostics ===
      "function"

      ?

      SidebarActions
      .diagnostics()

      :

      null,



    elements:

      typeof SidebarElements !==
      "undefined"

      &&

      typeof SidebarElements
      .diagnostics ===
      "function"

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

      null

  });

}



// =====================================
// SIDEBAR PUBLIC API
// =====================================

const Sidebar =
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



  // ===================================
  // MODULES
  // ===================================

  runtime:
  SidebarRuntime,

  renderer:
  SidebarRenderer,

  events:
  SidebarEvents,

  actions:
  SidebarActions,

  elements:
  SidebarElements,

  state:
  sidebarRuntimeState

});
