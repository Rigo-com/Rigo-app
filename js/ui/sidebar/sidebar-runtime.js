// =====================================
// RIGO AI
// SIDEBAR RUNTIME
// ENTERPRISE SIDEBAR ORCHESTRATOR
// =====================================



// =====================================
// SIDEBAR MODULES
// =====================================

const SIDEBAR_RUNTIME_MODULES =
Object.freeze([

  {

    name:"elements",

    required:true,

    initialize(){

      return (

        typeof SidebarElements !==
        "undefined"

        &&

        SidebarElements
        .initialize()

        &&

        SidebarElements
        .validate()

      );

    }

  },



  {

    name:"events",

    required:true,

    initialize(){

      return (

        typeof SidebarEvents !==
        "undefined"

        &&

        SidebarEvents
        .bind()

      );

    }

  },



  {

    name:"renderer",

    required:true,

    initialize(){

      return (
        typeof SidebarRenderer !==
        "undefined"
      );

    }

  },



  {

    name:"actions",

    required:true,

    initialize(){

      return (
        typeof SidebarActions !==
        "undefined"
      );

    }

  }

]);



// =====================================
// VALIDATE ENVIRONMENT
// =====================================

function validateSidebarEnvironment(){

  return (

    typeof window !==
    "undefined"

    &&

    typeof document !==
    "undefined"

  );

}



// =====================================
// INITIALIZE MODULES
// =====================================

function initializeSidebarModules(){

  return SIDEBAR_RUNTIME_MODULES
  .every((module) => {

    try{

      const initialized =
      module.initialize();

      if(
        !initialized
      ){

        if(
          module.required
        ){

          return false;

        }

      }

      return true;

    }

    catch(error){

      sidebarRuntimeState
      .lastError =
      error;

      safeLogError(

        "SIDEBAR MODULE INIT FAILED",

        module.name,

        error

      );

      if(
        module.required
      ){

        return false;

      }

      return true;

    }

  });

}



// =====================================
// HYDRATE SIDEBAR
// =====================================

function hydrateSidebarRuntime(){

  try{

    SidebarRenderer
    .renderHistory();

    sidebarRuntimeState
    .hydrated =
    true;

    return true;

  }

  catch(error){

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(
      "SIDEBAR HYDRATION FAILED",
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZE SIDEBAR
// =====================================

function initializeSidebar(){

  if(
    sidebarRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    sidebarRuntimeState
    .destroyed ===
    false

    &&

    isSidebarBusy()
  ){

    return false;

  }

  try{

    const environmentValid =
    validateSidebarEnvironment();

    if(
      !environmentValid
    ){

      return false;

    }

    const modulesReady =
    initializeSidebarModules();

    if(
      !modulesReady
    ){

      return false;

    }

    const hydrated =
    hydrateSidebarRuntime();

    if(
      !hydrated
    ){

      return false;

    }

    sidebarRuntimeState
    .initialized =
    true;

    sidebarRuntimeState
    .destroyed =
    false;

    sidebarRuntimeState
    .initializedAt =
    Date.now();

    safeLogInfo(
      "SIDEBAR READY"
    );

    return true;

  }

  catch(error){

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(

      "SIDEBAR INITIALIZATION FAILED",

      error

    );

    return false;

  }

}



// =====================================
// RESET SIDEBAR
// =====================================

function resetSidebar(){

  try{

    SidebarRenderer
    ?.cancel();

    SidebarRenderer
    ?.clearQueue();

    SidebarElements
    ?.clearHistory();

    resetSidebarCache();

    sidebarRuntimeState
    .rendering =
    false;

    sidebarRuntimeState
    .loading =
    false;

    sidebarRuntimeState
    .deleting =
    false;

    sidebarRuntimeState
    .creating =
    false;

    sidebarRuntimeState
    .activeChatId =
    null;

    return true;

  }

  catch(error){

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(
      "SIDEBAR RESET FAILED",
      error
    );

    return false;

  }

}



// =====================================
// DESTROY SIDEBAR
// =====================================

function destroySidebar(){

  if(
    sidebarRuntimeState
    .destroyed
  ){

    return true;

  }

  try{

    resetSidebar();

    SidebarEvents
    ?.unbind();

    SidebarRenderer
    ?.cancel();

    SidebarRenderer
    ?.clearQueue();

    SidebarElements
    ?.cleanup();

    resetSidebarCache();

    resetSidebarElements();

    sidebarRuntimeState
    .destroyed =
    true;

    sidebarRuntimeState
    .initialized =
    false;

    sidebarRuntimeState
    .hydrated =
    false;

    sidebarRuntimeState
    .listenersAttached =
    false;

    sidebarRuntimeState
    .destroyedAt =
    Date.now();

    safeLogInfo(
      "SIDEBAR DESTROYED"
    );

    return true;

  }

  catch(error){

    sidebarRuntimeState
    .lastError =
    error;

    safeLogError(
      "SIDEBAR DESTROY FAILED",
      error
    );

    return false;

  }

}



// =====================================
// SIDEBAR READY
// =====================================

function isSidebarRuntimeReady(){

  return (

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
// SIDEBAR DIAGNOSTICS
// =====================================

function getSidebarRuntimeDiagnostics(){

  return Object.freeze({

    runtime:

      typeof getSidebarDiagnostics ===
      "function"

      ?

      getSidebarDiagnostics()

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

      null

  });

}



// =====================================
// PUBLIC API
// =====================================

const SidebarRuntime =
Object.freeze({

  initialize:
  initializeSidebar,

  reset:
  resetSidebar,

  destroy:
  destroySidebar,

  isReady:
  isSidebarRuntimeReady,

  diagnostics:
  getSidebarRuntimeDiagnostics

});
