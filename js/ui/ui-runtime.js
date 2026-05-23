// =====================================
// RIGO AI
// UI RUNTIME SYSTEM
// ENTERPRISE FINAL
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
// STORAGE HELPERS
// =====================================

function safeLocalStorageGet(
  key
){

  try{

    return localStorage
    .getItem(key);

  }

  catch(error){

    safeLogError(

      "LOCAL STORAGE GET ERROR:",

      error

    );

    return null;

  }

}



function safeLocalStorageSet(
  key,
  value
){

  try{

    localStorage.setItem(
      key,
      value
    );

    return true;

  }

  catch(error){

    safeLogError(

      "LOCAL STORAGE SET ERROR:",

      error

    );

    return false;

  }

}



// =====================================
// INITIALIZE UI
// =====================================

function initializeUI(){

  if(
    uiState.initialized
  ){

    return true;

  }

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  cacheUIElements();

  if(
    !validateUIElements()
  ){

    safeLogError(
      "UI VALIDATION FAILED"
    );

    return false;

  }

  detectMobileMode();

  initializeTheme();

  bindUIEvents();

  initializeToastContainer();

  initializeModalContainer();

  updateResponsiveUI();

  uiState.initialized =
  true;

  safeLogInfo(
    "UI SYSTEM READY"
  );

  return true;

}



// =====================================
// BIND EVENTS
// =====================================

function bindUIEvents(){

  if(
    uiEventState.eventsBound
  ){

    return true;

  }

  bindSidebarEvents();

  bindInputEvents();

  bindResizeEvents();

  bindKeyboardEvents();

  bindVisibilityEvents();

  uiEventState.eventsBound =
  true;

  return true;

}



// =====================================
// WINDOW RESIZE HANDLER
// =====================================

function handleWindowResize(){

  uiState.resizing =
  true;

  clearTimeout(
    uiEventState
    .resizeTimeout
  );

  uiEventState
  .resizeTimeout =
  setTimeout(() => {

    requestUIAnimationFrame(
      () => {

        detectMobileMode();

        updateResponsiveUI();

        uiState.resizing =
        false;

        uiEventState
        .resizeTimeout =
        null;

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

  window.addEventListener(
    "resize",
    handleWindowResize,
    {
      passive:true
    }
  );

  return true;

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

    closeModal();

    closeSidebar();

  }

  return true;

}



// =====================================
// KEYBOARD EVENTS
// =====================================

function bindKeyboardEvents(){

  document.addEventListener(
    "keydown",
    handleGlobalKeyboard
  );

  return true;

}



// =====================================
// VISIBILITY CHANGE
// =====================================

function handleVisibilityChange(){

  if(
    document.hidden
  ){

    cancelUIAnimationFrame();

  }

}



// =====================================
// VISIBILITY EVENTS
// =====================================

function bindVisibilityEvents(){

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return true;

}



// =====================================
// UI RAF
// =====================================

function requestUIAnimationFrame(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(
    typeof requestAnimationFrame !==
    "function"
  ){

    try{

      callback();

      return true;

    }

    catch(error){

      safeLogError(
        error
      );

      return false;

    }

  }

  cancelUIAnimationFrame();

  uiState.activeAnimationFrame =
  requestAnimationFrame(() => {

    uiState.activeAnimationFrame =
    null;

    try{

      callback();

    }

    catch(error){

      safeLogError(
        error
      );

    }

  });

  return true;

}



// =====================================
// CANCEL RAF
// =====================================

function cancelUIAnimationFrame(){

  if(

    typeof cancelAnimationFrame !==
    "function"

  ){

    uiState.activeAnimationFrame =
    null;

    return false;

  }

  if(
    uiState.activeAnimationFrame
  ){

    cancelAnimationFrame(

      uiState
      .activeAnimationFrame

    );

    uiState.activeAnimationFrame =
    null;

  }

  return true;

}



// =====================================
// TOAST
// =====================================

function showToast(
  message,
  duration = 3000
){

  if(
    !uiElements.toastContainer
  ){

    return false;

  }

  const activeToasts =

    uiElements
    .toastContainer
    .children;

  if(

    activeToasts.length >=

    UI_CONFIG
    .MAX_TOASTS

  ){

    const oldestToast =
    activeToasts[0];

    if(oldestToast){

      const existingTimeout =

        uiEventState
        .toastTimeouts
        .get(
          oldestToast
        );

      if(existingTimeout){

        clearTimeout(
          existingTimeout
        );

      }

      uiEventState
      .toastTimeouts
      .delete(
        oldestToast
      );

      oldestToast.remove();

    }

  }

  const toast =
  document.createElement(
    "div"
  );

  toast.classList.add(
    "toast"
  );

  toast.textContent =
  String(message);

  uiElements
  .toastContainer
  .appendChild(
    toast
  );

  uiState.activeToast =
  toast;

  const timeoutId =
  setTimeout(() => {

    requestUIAnimationFrame(
      () => {

        toast.remove();

      }
    );

    uiEventState
    .toastTimeouts
    .delete(
      toast
    );

    if(
      uiState.activeToast ===
      toast
    ){

      uiState.activeToast =
      null;

    }

  },duration);

  uiEventState
  .toastTimeouts
  .set(
    toast,
    timeoutId
  );

  return true;

}



// =====================================
// CLEAR TOASTS
// =====================================

function clearAllToasts(){

  if(
    !uiElements.toastContainer
  ){

    return false;

  }

  const toasts = [

    ...uiElements
    .toastContainer
    .children

  ];

  toasts.forEach((toast) => {

    const timeoutId =

      uiEventState
      .toastTimeouts
      .get(
        toast
      );

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

    uiEventState
    .toastTimeouts
    .delete(
      toast
    );

    toast.remove();

  });

  uiState.activeToast =
  null;

  return true;

}



// =====================================
// MODAL
// =====================================

function openModal(
  content
){

  if(
    !uiElements
    .modalContainer
  ){

    return false;

  }

  closeModal();

  const modal =
  document.createElement(
    "div"
  );

  modal.classList.add(
    "modal"
  );

  modal.setAttribute(
    "role",
    "dialog"
  );

  modal.setAttribute(
    "aria-modal",
    "true"
  );

  modal.setAttribute(
    "tabindex",
    "-1"
  );

  if(
    content instanceof Node
  ){

    modal.appendChild(
      content
    );

  }

  else{

    modal.textContent =
    String(content);

  }

  uiElements
  .modalContainer
  .appendChild(
    modal
  );

  modal.focus();

  uiState.activeModal =
  modal;

  return true;

}



// =====================================
// RESET UI
// =====================================

function resetUIState(){

  cancelUIAnimationFrame();

  closeSidebar();

  closeModal();

  hideLoadingScreen();

  clearAllToasts();

  clearTimeout(
    uiEventState
    .resizeTimeout
  );

  uiEventState
  .resizeTimeout =
  null;

  uiState.loading =
  false;

  uiState.rendering =
  false;

  uiState.typing =
  false;

  return true;

}



// =====================================
// DESTROY UI
// =====================================

function destroyUI(){

  cancelUIAnimationFrame();

  closeSidebar();

  closeModal();

  hideLoadingScreen();

  clearAllToasts();

  clearTimeout(
    uiEventState
    .resizeTimeout
  );

  uiEventState
  .resizeTimeout =
  null;

  if(
    typeof window !==
    "undefined"
  ){

    window.removeEventListener(
      "resize",
      handleWindowResize
    );

  }

  document.removeEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  document.removeEventListener(
    "keydown",
    handleGlobalKeyboard
  );

  uiState.loading =
  false;

  uiState.rendering =
  false;

  uiState.typing =
  false;

  uiState.initialized =
  false;

  uiEventState.eventsBound =
  false;

  safeLogInfo(
    "UI DESTROYED"
  );

  return true;

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

  toast:
  showToast,

  modal:
  openModal,

  requestFrame:
  requestUIAnimationFrame,

  cancelFrame:
  cancelUIAnimationFrame

});
