// =====================================
// RIGO AI
// UI EVENTS
// ENTERPRISE EVENT SYSTEM
// =====================================



// =====================================
// UI EVENT STATE
// =====================================

const uiEventState =
Object.seal({

  eventsBound:false,

  resizeTimeout:null,

  toastTimeouts:
  new WeakMap()

});



// =====================================
// SAFE EVENT TARGET
// =====================================

function isValidEventTarget(
  target
){

  return (

    target instanceof
    EventTarget

    ||

    target ===
    window

    ||

    target ===
    document

  );

}



// =====================================
// TRACK EVENT LISTENER
// =====================================

function trackUIListener(
  target,
  type,
  handler,
  options = false
){

  if(
    !isValidEventTarget(
      target
    )
  ){

    return false;

  }

  if(
    typeof type !==
    "string"
  ){

    return false;

  }

  if(
    typeof handler !==
    "function"
  ){

    return false;

  }

  try{

    target.addEventListener(

      type,

      handler,

      options

    );

    uiState
    .activeListeners
    .add({

      target,
      type,
      handler,
      options

    });

    return true;

  }

  catch(error){

    safeLogError(

      "TRACK EVENT LISTENER ERROR",

      error

    );

    return false;

  }

}



// =====================================
// REMOVE EVENT LISTENER
// =====================================

function removeTrackedUIListener(
  listenerObject
){

  if(
    !listenerObject
  ){

    return false;

  }

  try{

    listenerObject
    .target
    ?.removeEventListener(

      listenerObject.type,

      listenerObject.handler,

      listenerObject.options

    );

    uiState
    .activeListeners
    .delete(
      listenerObject
    );

    return true;

  }

  catch(error){

    safeLogError(

      "REMOVE EVENT LISTENER ERROR",

      error

    );

    return false;

  }

}



// =====================================
// REMOVE ALL EVENT LISTENERS
// =====================================

function removeAllUIListeners(){

  [

    ...uiState
    .activeListeners

  ]
  .forEach((listener) => {

    removeTrackedUIListener(
      listener
    );

  });

  return true;

}



// =====================================
// WINDOW RESIZE HANDLER
// =====================================

function handleWindowResize(){

  uiState.resizing =
  true;

  uiState.lastResizeAt =
  Date.now();

  clearTimeout(
    uiEventState
    .resizeTimeout
  );

  uiEventState
  .resizeTimeout =
  setTimeout(() => {

    requestUIAnimationFrame(
      () => {

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

        }

        catch(error){

          safeLogError(
            error
          );

        }

        finally{

          uiState.resizing =
          false;

          uiEventState
          .resizeTimeout =
          null;

        }

      }
    );

  },

  UI_CONFIG
  .RESIZE_DELAY);

}



// =====================================
// RESIZE EVENTS
// =====================================

function bindResizeEvents(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  return trackUIListener(

    window,

    "resize",

    handleWindowResize,

    {

      passive:true

    }

  );

}



// =====================================
// GLOBAL KEYBOARD
// =====================================

function handleGlobalKeyboard(
  event
){

  if(
    !event
  ){

    return false;

  }

  const activeElement =
  document.activeElement;

  const typingTarget =

    activeElement?.tagName ===
    "INPUT"

    ||

    activeElement?.tagName ===
    "TEXTAREA"

    ||

    activeElement
    ?.isContentEditable ===
    true;

  if(
    typingTarget
  ){

    return false;

  }

  if(
    event.key ===
    "Escape"
  ){

    if(
      typeof closeModal ===
      "function"
    ){

      closeModal();

    }

    if(
      typeof closeSidebar ===
      "function"
    ){

      closeSidebar();

    }

  }

  return true;

}



// =====================================
// KEYBOARD EVENTS
// =====================================

function bindKeyboardEvents(){

  return trackUIListener(

    document,

    "keydown",

    handleGlobalKeyboard

  );

}



// =====================================
// VISIBILITY CHANGE
// =====================================

function handleVisibilityChange(){

  if(
    document.hidden
  ){

    if(
      typeof cancelUIAnimationFrame ===
      "function"
    ){

      cancelUIAnimationFrame();

    }

  }

}



// =====================================
// VISIBILITY EVENTS
// =====================================

function bindVisibilityEvents(){

  return trackUIListener(

    document,

    "visibilitychange",

    handleVisibilityChange

  );

}



// =====================================
// BIND ALL UI EVENTS
// =====================================

function bindUIEvents(){

  if(
    uiEventState
    .eventsBound
  ){

    return true;

  }

  if(
    typeof bindSidebarEvents ===
    "function"
  ){

    bindSidebarEvents();

  }

  if(
    typeof bindInputEvents ===
    "function"
  ){

    bindInputEvents();

  }

  bindResizeEvents();

  bindKeyboardEvents();

  bindVisibilityEvents();

  uiEventState
  .eventsBound =
  true;

  return true;

}



// =====================================
// UNBIND ALL UI EVENTS
// =====================================

function unbindUIEvents(){

  clearTimeout(
    uiEventState
    .resizeTimeout
  );

  uiEventState
  .resizeTimeout =
  null;

  removeAllUIListeners();

  uiEventState
  .eventsBound =
  false;

  return true;

}



// =====================================
// EVENT DIAGNOSTICS
// =====================================

function getUIEventDiagnostics(){

  return Object.freeze({

    eventsBound:
    uiEventState
    .eventsBound,

    activeListeners:

      uiState
      .activeListeners
      .size,

    resizePending:

      uiEventState
      .resizeTimeout !==
      null

  });

}



// =====================================
// PUBLIC API
// =====================================

const UIEvents =
Object.freeze({

  bind:
  bindUIEvents,

  unbind:
  unbindUIEvents,

  track:
  trackUIListener,

  remove:
  removeTrackedUIListener,

  removeAll:
  removeAllUIListeners,

  diagnostics:
  getUIEventDiagnostics

});
