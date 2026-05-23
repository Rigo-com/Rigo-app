// =====================================
// RIGO AI
// UI RUNTIME
// ENTERPRISE UI ORCHESTRATOR
// =====================================



// =====================================
// UI RUNTIME STATE
// =====================================

const uiRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  destroying:false,

  crashed:false,

  initializedAt:null,

  destroyedAt:null,

  lastError:null

});



// =====================================
// UI MODULES
// =====================================

const UI_RUNTIME_MODULES =
Object.freeze([

  {

    name:"elements",

    required:true,

    initialize(){

      return (

        typeof UIElements !==
        "undefined"

        &&

        UIElements
        .cache()

        &&

        UIElements
        .validate()

      );

    }

  },



  {

    name:"events",

    required:true,

    initialize(){

      return (

        typeof UIEvents !==
        "undefined"

        &&

        UIEvents
        .bind()

      );

    }

  },



  {

    name:"renderer",

    required:true,

    initialize(){

      return (
        typeof UIRenderer !==
        "undefined"
      );

    }

  }

]);



// =====================================
// VALIDATE DOM
// =====================================

function validateUIRuntimeEnvironment(){

  return (

    typeof window !==
    "undefined"

    &&

    typeof document !==
    "undefined"

  );

}



// =====================================
// INITIALIZE RESPONSIVE UI
// =====================================

function initializeResponsiveUI(){

  try{

    if(
      typeof detectMobileMode ===
      "function"
    ){

      detectMobileMode();

    }

    if(
      typeof updateResponsiveUI ===
      "function"
    ){

      updateResponsiveUI();

    }

    return true;

  }

  catch(error){

    safeLogError(
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZE THEME
// =====================================

function initializeUITheme(){

  try{

    if(
      typeof initializeTheme ===
      "function"
    ){

      return initializeTheme();

    }

    return true;

  }

  catch(error){

    safeLogError(
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZE CONTAINERS
// =====================================

function initializeUIContainers(){

  if(
    typeof UIElements ===
    "undefined"
  ){

    return false;

  }

  const toastReady =
  UIElements
  .initializeToast();

  const modalReady =
  UIElements
  .initializeModal();

  return (
    toastReady &&
    modalReady
  );

}



// =====================================
// INITIALIZE MODULES
// =====================================

function initializeUIModules(){

  return UI_RUNTIME_MODULES
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

      safeLogError(

        "UI MODULE INIT FAILED",

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
// INITIALIZE UI
// =====================================

function initializeUI(){

  if(
    uiRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    uiRuntimeState
    .initializing
  ){

    return false;

  }

  uiRuntimeState
  .initializing =
  true;

  try{

    const environmentValid =
    validateUIRuntimeEnvironment();

    if(
      !environmentValid
    ){

      return false;

    }

    const modulesReady =
    initializeUIModules();

    if(
      !modulesReady
    ){

      return false;

    }

    const containersReady =
    initializeUIContainers();

    if(
      !containersReady
    ){

      return false;

    }

    initializeResponsiveUI();

    initializeUITheme();

    uiState.initialized =
    true;

    uiState.destroyed =
    false;

    uiState.hydrated =
    true;

    uiState.initializedAt =
    Date.now();

    uiRuntimeState
    .initialized =
    true;

    uiRuntimeState
    .initializedAt =
    Date.now();

    safeLogInfo(
      "UI SYSTEM READY"
    );

    return true;

  }

  catch(error){

    uiRuntimeState
    .crashed =
    true;

    uiRuntimeState
    .lastError =
    error;

    safeLogError(

      "UI INITIALIZATION FAILED",

      error

    );

    return false;

  }

  finally{

    uiRuntimeState
    .initializing =
    false;

  }

}



// =====================================
// RESET UI
// =====================================

function resetUIState(){

  try{

    if(
      typeof UIRenderer !==
      "undefined"
    ){

      UIRenderer
      .cancelFrame();

      UIRenderer
      .clearQueue();
    }

    if(
      typeof closeSidebar ===
      "function"
    ){

      closeSidebar();

    }

    if(
      typeof closeModal ===
      "function"
    ){

      closeModal();

    }

    if(
      typeof hideLoadingScreen ===
      "function"
    ){

      hideLoadingScreen();

    }

    if(
      typeof clearAllToasts ===
      "function"
    ){

      clearAllToasts();

    }

    uiState.loading =
    false;

    uiState.rendering =
    false;

    uiState.typing =
    false;

    uiState.resizing =
    false;

    return true;

  }

  catch(error){

    safeLogError(
      "UI RESET FAILED",
      error
    );

    return false;

  }

}



// =====================================
// DESTROY UI
// =====================================

function destroyUI(){

  if(
    uiRuntimeState
    .destroying
  ){

    return false;

  }

  uiRuntimeState
  .destroying =
  true;

  try{

    resetUIState();

    if(
      typeof UIEvents !==
      "undefined"
    ){

      UIEvents
      .unbind();

    }

    if(
      typeof UIElements !==
      "undefined"
    ){

      UIElements
      .cleanup();

      UIElements
      .clearModal();
    }

    uiState.initialized =
    false;

    uiState.destroyed =
    true;

    uiState.hydrated =
    false;

    uiState.destroyedAt =
    Date.now();

    uiRuntimeState
    .initialized =
    false;

    uiRuntimeState
    .destroyedAt =
    Date.now();

    safeLogInfo(
      "UI DESTROYED"
    );

    return true;

  }

  catch(error){

    uiRuntimeState
    .lastError =
    error;

    safeLogError(
      "UI DESTROY FAILED",
      error
    );

    return false;

  }

  finally{

    uiRuntimeState
    .destroying =
    false;

  }

}



// =====================================
// UI DIAGNOSTICS
// =====================================

function getUIRuntimeDiagnostics(){

  return Object.freeze({

    initialized:
    uiRuntimeState
    .initialized,

    initializing:
    uiRuntimeState
    .initializing,

    destroying:
    uiRuntimeState
    .destroying,

    crashed:
    uiRuntimeState
    .crashed,

    initializedAt:
    uiRuntimeState
    .initializedAt,

    destroyedAt:
    uiRuntimeState
    .destroyedAt,

    lastError:

      uiRuntimeState
      .lastError

      ?

      String(
        uiRuntimeState
        .lastError
      )

      :

      null,

    trackedElements:

      uiState
      .trackedElements
      .size,

    activeListeners:

      uiState
      .activeListeners
      .size

  });

}



// =====================================
// PUBLIC API
// =====================================

const UIRuntime =
Object.freeze({

  initialize:
  initializeUI,

  reset:
  resetUIState,

  destroy:
  destroyUI,

  diagnostics:
  getUIRuntimeDiagnostics

});
