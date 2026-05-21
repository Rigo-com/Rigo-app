// =====================================
// RIGO AI
// APP SYSTEM
// ULTIMATE STABLE FINAL
// =====================================



// =====================================
// VALID APP STATUSES
// =====================================

const VALID_APP_STATUSES =
new Set([

  "idle",

  "starting",

  "ready",

  "error"

]);



// =====================================
// APP STATE
// =====================================

const appState =
Object.seal({

  started:false,

  starting:false,

  status:"idle",

  initializedAt:null

});



// =====================================
// MESSAGE STATE
// =====================================

let sendingMessage =
false;



// =====================================
// DOM ELEMENTS
// =====================================

let messageInput = null;

let sendButton = null;

let chatContainer = null;



// =====================================
// LOGGER
// =====================================

function logInfo(message){

  console.log(
    "[RIGO AI]:",
    message
  );

}



function logError(message){

  console.error(
    "[RIGO AI]:",
    message
  );

}



// =====================================
// SAFE ERROR MESSAGE
// =====================================

function getSafeErrorMessage(
  error
){

  return String(

    error?.message ||

    error ||

    "Unknown Error"

  );

}



// =====================================
// UPDATE APP STATUS
// =====================================

function updateAppStatus(
  status
){

  const normalizedStatus =
  String(
    status || ""
  )
  .trim()
  .toLowerCase();

  const isValidStatus =

    VALID_APP_STATUSES
    .has(
      normalizedStatus
    );

  if(!isValidStatus){

    return false;

  }

  appState.status =
  normalizedStatus;

  return true;

}



// =====================================
// HIDE LOADING SCREEN
// =====================================

function hideLoadingScreen(){

  const loadingScreen =
  document.getElementById(
    "loadingScreen"
  );

  if(!loadingScreen){

    return false;

  }

  loadingScreen
  .classList
  ?.add(
    "hidden"
  );

  const configuredDuration =
    APP_CONFIG?.UI
    ?.LOADING_FADE_DURATION;

  const fadeDuration =

    Number.isFinite(
      configuredDuration
    )

    ? configuredDuration

    : 300;

  setTimeout(() => {

    if(
      loadingScreen
      .isConnected
    ){

      loadingScreen
      .remove();

    }

  },fadeDuration);

  return true;

}



// =====================================
// INITIALIZE DOM
// =====================================

function initializeDOMElements(){

  messageInput =
  document.getElementById(
    "messageInput"
  );

  sendButton =
  document.getElementById(
    "sendButton"
  );

  chatContainer =
  document.getElementById(
    "chatContainer"
  );

  return true;

}



// =====================================
// DOM VALIDATION
// =====================================

function validateDOMElements(){

  const requiredElements = [

    {

      key:"messageInput",

      value:messageInput

    },

    {

      key:"sendButton",

      value:sendButton

    },

    {

      key:"chatContainer",

      value:chatContainer

    }

  ];

  for(
    const element of
    requiredElements
  ){

    if(!element.value){

      logError(

        element.key +
        " missing"

      );

      return false;

    }

  }

  return true;

}



// =====================================
// VALIDATE DEPENDENCIES
// =====================================

function validateDependencies(){

  const requiredDependencies = [

    {

      name:"sendMessage",

      valid:

      typeof sendMessage ===
      "function"

    },

    {

      name:"APP_CONFIG",

      valid:

      APP_CONFIG &&

      typeof APP_CONFIG ===
      "object"

    },

    {

      name:"APP_CONFIG.APP",

      valid:

      APP_CONFIG?.APP &&

      typeof APP_CONFIG.APP ===
      "object"

    }

  ];

  for(
    const dependency of
    requiredDependencies
  ){

    if(!dependency.valid){

      logError(

        dependency.name +
        " missing"

      );

      return false;

    }

  }

  return true;

}



// =====================================
// UPDATE MESSAGE UI STATE
// =====================================

function updateMessageUIState(
  disabled
){

  const safeDisabled =
  Boolean(disabled);

  if(sendButton){

    sendButton.disabled =
    safeDisabled;

  }

  if(messageInput){

    messageInput.disabled =
    safeDisabled;

    if(!safeDisabled){

      requestAnimationFrame(() => {

        if(
          messageInput &&
          typeof messageInput
          .focus ===
          "function"
        ){

          messageInput.focus();

        }

      });

    }

  }

}



// =====================================
// MESSAGE TIMEOUT
// =====================================

function createMessageTimeout(){

  const timeoutDuration =

    APP_CONFIG?.CHAT
    ?.MESSAGE_TIMEOUT

    ?? 30000;

  return new Promise(
    (_,reject) => {

      setTimeout(() => {

        reject(

          new Error(
            "MESSAGE TIMEOUT"
          )

        );

      },timeoutDuration);

    }
  );

}



// =====================================
// HANDLE SEND MESSAGE
// =====================================

async function handleSendMessage(){

  if(
    sendingMessage
  ){

    return false;

  }

  if(
    typeof sendMessage !==
    "function"
  ){

    logError(
      "sendMessage unavailable"
    );

    return false;

  }

  sendingMessage =
  true;

  updateMessageUIState(
    true
  );

  try{

    await Promise.race([

      sendMessage(),

      createMessageTimeout()

    ]);

    return true;

  }

  catch(error){

    logError(
      getSafeErrorMessage(
        error
      )
    );

    return false;

  }

  finally{

    sendingMessage =
    false;

    updateMessageUIState(
      false
    );

  }

}



// =====================================
// SEND BUTTON EVENT
// =====================================

function setupSendButton(){

  if(!sendButton){

    return false;

  }

  if(
    sendButton.dataset
    .listenerAttached ===
    "true"
  ){

    return true;

  }

  sendButton.addEventListener(
    "click",
    () => {

      handleSendMessage()
      .catch(logError);

    }
  );

  sendButton.dataset
  .listenerAttached =
  "true";

  return true;

}



// =====================================
// INPUT EVENTS
// =====================================

function setupMessageInput(){

  if(!messageInput){

    return false;

  }

  if(
    messageInput.dataset
    .listenerAttached ===
    "true"
  ){

    return true;

  }

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if(
        event.isComposing
      ){

        return;

      }

      if(
        event.key === "Enter" &&
        !event.shiftKey
      ){

        event.preventDefault();

        handleSendMessage()
        .catch(logError);

      }

    }
  );

  messageInput.dataset
  .listenerAttached =
  "true";

  return true;

}



// =====================================
// APP EVENTS
// =====================================

function setupAppEvents(){

  const sendReady =
  setupSendButton();

  const inputReady =
  setupMessageInput();

  return (
    sendReady &&
    inputReady
  );

}



// =====================================
// INITIALIZE APP
// =====================================

async function initializeApp(){

  initializeDOMElements();

  const validDOM =
  validateDOMElements();

  if(!validDOM){

    throw new Error(
      "DOM VALIDATION FAILED"
    );

  }

  const validDependencies =
  validateDependencies();

  if(!validDependencies){

    throw new Error(
      "DEPENDENCY VALIDATION FAILED"
    );

  }

  const eventsReady =
  setupAppEvents();

  if(!eventsReady){

    throw new Error(
      "APP EVENTS FAILED"
    );

  }

  return true;

}



// =====================================
// START APP
// =====================================

async function startApp(){

  if(
    appState.started ||
    appState.starting
  ){

    return false;

  }

  appState.starting =
  true;

  updateAppStatus(
    "starting"
  );

  try{

    await initializeApp();

    appState.started =
    true;

    appState.initializedAt =
    Date.now();

    updateAppStatus(
      "ready"
    );

    hideLoadingScreen();

    logInfo(

      APP_CONFIG.APP.NAME +

      " STARTED"

    );

    return true;

  }

  catch(error){

    updateAppStatus(
      "error"
    );

    if(document.body){

      document.body.classList.add(
        "app-error"
      );

    }

    hideLoadingScreen();

    logError(

      getSafeErrorMessage(
        error
      )

    );

    return false;

  }

  finally{

    appState.starting =
    false;

  }

}



// =====================================
// APP INIT
// =====================================

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(

    "DOMContentLoaded",

    () => {

      startApp()
      .catch(logError);

    },

    { once:true }

  );

}

else{

  startApp()
  .catch(logError);

}
