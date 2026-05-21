// =====================================
// SAFE LOGGER
// =====================================

function safeLogInfo(
  ...args
){

  try{

    console.log(
      "[RIGO AI]:",
      ...args
    );

  }

  catch(error){

    console.log(error);

  }

}



function safeLogError(
  ...args
){

  try{

    console.error(
      "[RIGO AI]:",
      ...args
    );

  }

  catch(error){

    console.error(error);

  }

}



// =====================================
// LOGGER
// =====================================

function logInfo(message){

  safeLogInfo(
    message
  );

}



function logError(message){

  safeLogError(
    message
  );

}



// =====================================
// INITIALIZE DOM
// =====================================

function initializeDOMElements(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

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

  return (

    Boolean(messageInput) &&

    Boolean(sendButton) &&

    Boolean(chatContainer)

  );

}



// =====================================
// MESSAGE TIMEOUT
// =====================================

function createMessageTimeout(){

  const timeoutDuration =

    APP_CONFIG?.CHAT
    ?.MESSAGE_TIMEOUT

    ?? 30000;

  let timeoutId =
  null;

  const promise =
  new Promise(
    (_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "MESSAGE TIMEOUT"
          )

        );

      },timeoutDuration);

    }
  );

  return {

    promise,

    clear(){

      if(timeoutId){

        clearTimeout(
          timeoutId
        );

      }

    }

  };

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

    safeLogError(
      "sendMessage unavailable"
    );

    return false;

  }

  sendingMessage =
  true;

  updateMessageUIState(
    true
  );

  const timeoutController =
  createMessageTimeout();

  try{

    await Promise.race([

      sendMessage(),

      timeoutController
      .promise

    ]);

    return true;

  }

  catch(error){

    safeLogError(
      getSafeErrorMessage(
        error
      )
    );

    return false;

  }

  finally{

    timeoutController
    .clear();

    sendingMessage =
    false;

    updateMessageUIState(
      false
    );

  }

}



// =====================================
// CLEANUP APP
// =====================================

function cleanupApp(){

  sendingMessage =
  false;

  if(sendButton){

    sendButton.disabled =
    false;
  }

  if(messageInput){

    messageInput.disabled =
    false;
  }

  updateAppStatus(
    "idle"
  );

  return true;

}



// =====================================
// INITIALIZE APP
// =====================================

async function initializeApp(){

  const initializedDOM =
  initializeDOMElements();

  if(!initializedDOM){

    throw new Error(
      "DOM INITIALIZATION FAILED"
    );

  }

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

    safeLogInfo(

      APP_CONFIG.APP.NAME +

      " STARTED"

    );

    return true;

  }

  catch(error){

    updateAppStatus(
      "error"
    );

    cleanupApp();

    if(
      typeof document !==
      "undefined" &&

      document.body
    ){

      document.body.classList.add(
        "app-error"
      );

    }

    hideLoadingScreen();

    safeLogError(

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
  typeof document !==
  "undefined"
){

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(

      "DOMContentLoaded",

      () => {

        startApp()
        .catch((error) => {

          safeLogError(error);

        });

      },

      { once:true }

    );

  }

  else{

    startApp()
    .catch((error) => {

      safeLogError(error);

    });

  }

}
