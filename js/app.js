// =====================================
// RIGO AI
// APP SYSTEM
// =====================================



// =====================================
// APP STATE
// =====================================

let appStarted = false;



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

}



// =====================================
// DOM VALIDATION
// =====================================

function validateDOMElements(){

  if(!messageInput){

    logError(
      "messageInput missing"
    );

    return false;

  }

  if(!sendButton){

    logError(
      "sendButton missing"
    );

    return false;

  }

  if(!chatContainer){

    logError(
      "chatContainer missing"
    );

    return false;

  }

  return true;

}



// =====================================
// SEND BUTTON EVENT
// =====================================

function setupSendButton(){

  if(!sendButton){

    return false;

  }

  sendButton.addEventListener(
    "click",
    () => {

      sendMessage()
      .catch((error) => {

        logError(error);

      });

    }
  );

  return true;

}



// =====================================
// INPUT EVENTS
// =====================================

function setupMessageInput(){

  if(!messageInput){

    return false;

  }

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if(
        event.key === "Enter" &&
        !event.shiftKey
      ){

        event.preventDefault();

        sendMessage()
        .catch((error) => {

          logError(error);

        });

      }

    }
  );

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
// START APP
// =====================================

function startApp(){

  if(appStarted){

    return false;

  }

  initializeDOMElements();

  const validDOM =
  validateDOMElements();

  if(!validDOM){

    logError(
      "APP START FAILED"
    );

    return false;

  }

  const eventsReady =
  setupAppEvents();

  if(!eventsReady){

    logError(
      "APP EVENTS FAILED"
    );

    return false;

  }

  appStarted = true;

  logInfo(
    APP_CONFIG.APP.NAME +
    " STARTED"
  );

  return true;

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
    startApp
  );

}

else{

  startApp();

}
