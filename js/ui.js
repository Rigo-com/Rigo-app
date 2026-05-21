// =====================================
// UI EVENT STATE
// =====================================

const uiEventState =
Object.seal({

  eventsBound:false,

  resizeTimeout:null,

  toastTimeouts:new WeakMap()

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
// RESIZE EVENTS
// =====================================

function bindResizeEvents(){

  window.addEventListener(
    "resize",
    () => {

      uiState.resizing =
      true;

      clearTimeout(
        uiEventState
        .resizeTimeout
      );

      uiEventState
      .resizeTimeout =
      setTimeout(() => {

        detectMobileMode();

        updateResponsiveUI();

        uiState.resizing =
        false;

        uiEventState
        .resizeTimeout =
        null;

      },

      UI_CONFIG
      .RESIZE_DELAY);

    }
  );

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

  uiElements.toastContainer
  .appendChild(
    toast
  );

  uiState.activeToast =
  toast;

  const timeoutId =
  setTimeout(() => {

    toast.remove();

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
// MODAL
// =====================================

function openModal(
  content
){

  if(
    !uiElements.modalContainer
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

  modal.textContent =
  String(content);

  uiElements.modalContainer
  .appendChild(
    modal
  );

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

  if(
    uiState.activeToast
  ){

    const timeoutId =

      uiEventState
      .toastTimeouts
      .get(
        uiState.activeToast
      );

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

    uiState.activeToast
    .remove();

    uiState.activeToast =
    null;

  }

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
