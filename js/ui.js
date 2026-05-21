// =====================================
// RIGO AI
// UI SYSTEM
// ENTERPRISE OMEGA FINAL
// =====================================



// =====================================
// UI CONFIG
// =====================================

const UI_CONFIG =
Object.freeze({

  MAX_TOASTS:5,

  RESIZE_DELAY:150

});



// =====================================
// UI STATE
// =====================================

const uiState =
Object.seal({

  initialized:false,

  loading:false,

  sidebarOpen:false,

  mobileMode:false,

  darkMode:false,

  activeModal:null,

  activeToast:null,

  activeAnimationFrame:null,

  resizing:false,

  rendering:false,

  typing:false

});



// =====================================
// UI ELEMENTS
// =====================================

const uiElements =
Object.seal({

  app:null,

  body:null,

  sidebar:null,

  overlay:null,

  header:null,

  chatContainer:null,

  messageInput:null,

  sendButton:null,

  sidebarToggle:null,

  modalContainer:null,

  toastContainer:null,

  loadingScreen:null

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

    console.error(
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

    console.error(
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

  cacheUIElements();

  if(
    !validateUIElements()
  ){

    console.error(
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

  console.log(
    "UI SYSTEM READY"
  );

  return true;

}



// =====================================
// CACHE UI ELEMENTS
// =====================================

function cacheUIElements(){

  uiElements.app =
  document.getElementById(
    "app"
  );

  uiElements.body =
  document.body;

  uiElements.sidebar =
  document.getElementById(
    "sidebar"
  );

  uiElements.overlay =
  document.getElementById(
    "overlay"
  );

  uiElements.header =
  document.getElementById(
    "header"
  );

  uiElements.chatContainer =
  document.getElementById(
    "chatContainer"
  );

  uiElements.messageInput =
  document.getElementById(
    "messageInput"
  );

  uiElements.sendButton =
  document.getElementById(
    "sendButton"
  );

  uiElements.sidebarToggle =
  document.getElementById(
    "sidebarToggle"
  );

  uiElements.modalContainer =
  document.getElementById(
    "modalContainer"
  );

  uiElements.toastContainer =
  document.getElementById(
    "toastContainer"
  );

  uiElements.loadingScreen =
  document.getElementById(
    "loadingScreen"
  );

}



// =====================================
// VALIDATE UI
// =====================================

function validateUIElements(){

  const requiredElements = [

    "body",

    "chatContainer"

  ];

  return requiredElements
  .every((key) => {

    return Boolean(
      uiElements[key]
    );

  });

}



// =====================================
// BIND EVENTS
// =====================================

function bindUIEvents(){

  bindSidebarEvents();

  bindInputEvents();

  bindResizeEvents();

  bindKeyboardEvents();

  bindVisibilityEvents();

}



// =====================================
// SIDEBAR EVENTS
// =====================================

function bindSidebarEvents(){

  if(
    uiElements.sidebarToggle
  ){

    uiElements.sidebarToggle
    .addEventListener(

      "click",

      toggleSidebar

    );

  }

  if(
    uiElements.overlay
  ){

    uiElements.overlay
    .addEventListener(

      "click",

      closeSidebar

    );

  }

}



// =====================================
// INPUT EVENTS
// =====================================

function bindInputEvents(){

  if(
    !uiElements.messageInput
  ){

    return;
  }

  uiElements.messageInput
  .addEventListener(

    "keydown",

    handleInputKeydown

  );

  if(
    uiElements.sendButton
  ){

    uiElements.sendButton
    .addEventListener(

      "click",

      safelySendMessage

    );

  }

}



// =====================================
// RESIZE EVENTS
// =====================================

function bindResizeEvents(){

  let resizeTimeout =
  null;

  window.addEventListener(
    "resize",
    () => {

      uiState.resizing =
      true;

      clearTimeout(
        resizeTimeout
      );

      resizeTimeout =
      setTimeout(() => {

        detectMobileMode();

        updateResponsiveUI();

        uiState.resizing =
        false;

      },

      UI_CONFIG
      .RESIZE_DELAY);

    }
  );

}



// =====================================
// KEYBOARD EVENTS
// =====================================

function bindKeyboardEvents(){

  document.addEventListener(
    "keydown",
    (event) => {

      if(
        event.key ===
        "Escape"
      ){

        closeModal();

        closeSidebar();

      }

    }
  );

}



// =====================================
// VISIBILITY EVENTS
// =====================================

function bindVisibilityEvents(){

  document.addEventListener(
    "visibilitychange",
    () => {

      if(
        document.hidden
      ){

        cancelUIAnimationFrame();

      }

    }
  );

}



// =====================================
// HANDLE INPUT
// =====================================

function handleInputKeydown(
  event
){

  if(
    event.key !== "Enter"
  ){

    return;
  }

  if(
    event.shiftKey
  ){

    return;
  }

  event.preventDefault();

  safelySendMessage();

}



// =====================================
// SAFE SEND
// =====================================

async function safelySendMessage(){

  if(
    typeof sendMessage !==
    "function"
  ){

    return false;

  }

  try{

    return await sendMessage();

  }

  catch(error){

    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    try{

      showToast(
        "Failed to send message"
      );

    }

    catch(toastError){

      console.error(
        "TOAST ERROR:",
        toastError
      );

    }

    return false;

  }

}



// =====================================
// MOBILE DETECTION
// =====================================

function detectMobileMode(){

  uiState.mobileMode =

    window.innerWidth <= 768;

  return uiState.mobileMode;

}



// =====================================
// RESPONSIVE UI
// =====================================

function updateResponsiveUI(){

  if(
    uiState.mobileMode
  ){

    if(
      uiState.sidebarOpen
    ){

      closeSidebar();

    }

  }

  else{

    if(
      !uiState.sidebarOpen
    ){

      openSidebar();

    }

  }

}



// =====================================
// SIDEBAR
// =====================================

function toggleSidebar(){

  if(
    uiState.sidebarOpen
  ){

    return closeSidebar();

  }

  return openSidebar();

}



function openSidebar(){

  if(
    !uiElements.sidebar
  ){

    return false;

  }

  if(
    uiState.sidebarOpen
  ){

    return true;

  }

  uiState.sidebarOpen =
  true;

  uiElements.sidebar
  .classList.add(
    "sidebar-open"
  );

  if(
    uiElements.overlay
  ){

    uiElements.overlay
    .classList.add(
      "overlay-visible"
    );

  }

  return true;

}



function closeSidebar(){

  if(
    !uiElements.sidebar
  ){

    return false;

  }

  if(
    !uiState.sidebarOpen
  ){

    return true;

  }

  uiState.sidebarOpen =
  false;

  uiElements.sidebar
  .classList.remove(
    "sidebar-open"
  );

  if(
    uiElements.overlay
  ){

    uiElements.overlay
    .classList.remove(
      "overlay-visible"
    );

  }

  return true;

}



// =====================================
// THEME
// =====================================

function initializeTheme(){

  const savedTheme =

    safeLocalStorageGet(
      "rigo-theme"
    );

  if(
    savedTheme === "dark"
  ){

    enableDarkMode();

  }

  else{

    disableDarkMode();

  }

}



function enableDarkMode(){

  uiState.darkMode =
  true;

  uiElements.body
  ?.classList
  .add(
    "dark-mode"
  );

  safeLocalStorageSet(
    "rigo-theme",
    "dark"
  );

  return true;

}



function disableDarkMode(){

  uiState.darkMode =
  false;

  uiElements.body
  ?.classList
  .remove(
    "dark-mode"
  );

  safeLocalStorageSet(
    "rigo-theme",
    "light"
  );

  return true;

}



function toggleTheme(){

  if(
    uiState.darkMode
  ){

    return disableDarkMode();

  }

  return enableDarkMode();

}



// =====================================
// LOADING
// =====================================

function showLoadingScreen(){

  if(
    !uiElements.loadingScreen
  ){

    return false;

  }

  uiState.loading =
  true;

  uiElements.loadingScreen
  .classList.add(
    "loading-visible"
  );

  return true;

}



function hideLoadingScreen(){

  if(
    !uiElements.loadingScreen
  ){

    return false;

  }

  uiState.loading =
  false;

  uiElements.loadingScreen
  .classList.remove(
    "loading-visible"
  );

  return true;

}



// =====================================
// TOAST
// =====================================

function initializeToastContainer(){

  const existingContainer =
  document.getElementById(
    "toastContainer"
  );

  if(
    existingContainer
  ){

    uiElements.toastContainer =
    existingContainer;

    return;
  }

  const container =
  document.createElement(
    "div"
  );

  container.id =
  "toastContainer";

  document.body.appendChild(
    container
  );

  uiElements.toastContainer =
  container;

}



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

    activeToasts[0]
    ?.remove();

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

  setTimeout(() => {

    toast.remove();

    if(
      uiState.activeToast ===
      toast
    ){

      uiState.activeToast =
      null;

    }

  },duration);

  return true;

}



// =====================================
// MODAL
// =====================================

function initializeModalContainer(){

  const existingContainer =
  document.getElementById(
    "modalContainer"
  );

  if(
    existingContainer
  ){

    uiElements.modalContainer =
    existingContainer;

    return;
  }

  const container =
  document.createElement(
    "div"
  );

  container.id =
  "modalContainer";

  document.body.appendChild(
    container
  );

  uiElements.modalContainer =
  container;

}



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



function closeModal(){

  if(
    !uiState.activeModal
  ){

    return false;

  }

  uiState.activeModal
  .remove();

  uiState.activeModal =
  null;

  return true;

}



// =====================================
// RAF CLEANUP
// =====================================

function cancelUIAnimationFrame(){

  if(
    !uiState
    .activeAnimationFrame
  ){

    return false;

  }

  cancelAnimationFrame(

    uiState
    .activeAnimationFrame

  );

  uiState.activeAnimationFrame =
  null;

  return true;

}



// =====================================
// UI RAF
// =====================================

function requestUIAnimationFrame(
  callback
){

  cancelUIAnimationFrame();

  uiState.activeAnimationFrame =
  requestAnimationFrame(() => {

    uiState.activeAnimationFrame =
    null;

    callback();

  });

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

  uiState.loading =
  false;

  uiState.rendering =
  false;

  uiState.typing =
  false;

  return true;

}
