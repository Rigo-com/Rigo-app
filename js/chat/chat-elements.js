// =====================================
// RIGO AI
// CHAT ELEMENTS
// ENTERPRISE CHAT DOM SYSTEM
// FINAL STABLE PATCHED EDITION
// =====================================



// =====================================
// CHAT ELEMENT STATE
// =====================================

const chatElementState =
Object.seal({

  initialized:false,

  validated:false,

  cached:false,

  elements:Object.seal({

    container:null,

    input:null,

    sendButton:null,

    typingIndicator:null,

    scrollContainer:null

  })

});



// =====================================
// GET ELEMENT
// =====================================

function getChatElement(
  id
){

  if(
    typeof document ===
    "undefined"
  ){

    return null;

  }

  if(
    typeof id !==
    "string"
  ){

    return null;

  }

  return document
  .getElementById(
    id
  );

}



// =====================================
// CACHE ELEMENTS
// =====================================

function cacheChatElements(){

  if(
    chatElementState
    .cached
  ){

    return true;

  }

  chatElementState
  .elements
  .container =

    getChatElement(
      "chatContainer"
    );

  chatElementState
  .elements
  .input =

    getChatElement(
      "messageInput"
    );



  // =========================
  // SEND BUTTON
  // =========================

  chatElementState
  .elements
  .sendButton =

    getChatElement(
      "sendBtn"
    );



  chatElementState
  .elements
  .scrollContainer =

    getChatElement(
      "chatScrollContainer"
    )

    ||

    chatElementState
    .elements
    .container;

  chatElementState
  .cached =
  true;

  return true;

}



// =====================================
// VALIDATE ELEMENTS
// =====================================

function validateChatElements(){

  const elements =
  chatElementState
  .elements;

  const valid =

    !!elements.container

    &&

    !!elements.input

    &&

    !!elements.sendButton;

  chatElementState
  .validated =
  valid;

  return valid;

}



// =====================================
// INITIALIZE ELEMENTS
// =====================================

function initializeChatElements(){

  if(
    chatElementState
    .initialized
  ){

    return true;

  }

  cacheChatElements();

  const valid =
  validateChatElements();

  if(!valid){

    console.error(
      "CHAT_ELEMENTS_INVALID"
    );

    return false;

  }

  chatElementState
  .initialized =
  true;

  return true;

}



// =====================================
// GETTERS
// =====================================

function getChatContainerElement(){

  return (

    chatElementState
    .elements
    .container

  );

}



function getMessageInputElement(){

  return (

    chatElementState
    .elements
    .input

  );

}



function getSendButtonElement(){

  return (

    chatElementState
    .elements
    .sendButton

  );

}



function getScrollContainerElement(){

  return (

    chatElementState
    .elements
    .scrollContainer

  );

}



function getTypingIndicatorElement(){

  return (

    chatElementState
    .elements
    .typingIndicator

  );

}



// =====================================
// SET TYPING INDICATOR
// =====================================

function setTypingIndicatorElement(
  element
){

  if(
    !element
  ){

    return false;

  }

  if(

    typeof Element !==
    "undefined"

    &&

    !(element instanceof Element)

  ){

    return false;

  }

  chatElementState
  .elements
  .typingIndicator =
  element;

  return true;

}



// =====================================
// CLEAR CHAT CONTAINER
// =====================================

function clearChatContainer(){

  const container =
  getChatContainerElement();

  if(!container){

    return false;

  }

  if(
    typeof container.replaceChildren ===
    "function"
  ){

    container.replaceChildren();

  }

  else{

    while(
      container.firstChild
    ){

      container.removeChild(
        container.firstChild
      );

    }

  }

  chatElementState
  .elements
  .typingIndicator =
  null;

  return true;

}



// =====================================
// APPEND CHAT ELEMENT
// =====================================

function appendChatElement(
  element
){

  const container =
  getChatContainerElement();

  if(
    !container ||
    !element
  ){

    return false;

  }

  if(

    typeof Element !==
    "undefined"

    &&

    !(element instanceof Element)

  ){

    return false;

  }

  if(
    !container.isConnected
  ){

    return false;

  }

  container.appendChild(
    element
  );

  return true;

}



// =====================================
// FOCUS MESSAGE INPUT
// =====================================

function focusMessageInput(){

  const input =
  getMessageInputElement();

  if(!input){

    return false;

  }

  try{

    input.focus({

      preventScroll:true

    });

    return true;

  }

  catch(error){

    try{

      input.focus();

      return true;

    }

    catch(fallbackError){

      console.error(
        fallbackError
      );

      return false;

    }

  }

}



// =====================================
// RESET ELEMENTS
// =====================================

function resetChatElements(){

  chatElementState
  .elements
  .typingIndicator =
  null;

  chatElementState
  .validated =
  false;

  chatElementState
  .cached =
  false;

  return true;

}



// =====================================
// CLEANUP
// =====================================

function cleanupChatElements(){

  resetChatElements();

  chatElementState
  .elements
  .container =
  null;

  chatElementState
  .elements
  .input =
  null;

  chatElementState
  .elements
  .sendButton =
  null;

  chatElementState
  .elements
  .scrollContainer =
  null;

  chatElementState
  .cached =
  false;

  chatElementState
  .validated =
  false;

  chatElementState
  .initialized =
  false;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getChatElementDiagnostics(){

  return Object.freeze({

    initialized:

      chatElementState
      .initialized,

    validated:

      chatElementState
      .validated,

    cached:

      chatElementState
      .cached,

    hasContainer:

      !!chatElementState
      .elements
      .container,

    hasInput:

      !!chatElementState
      .elements
      .input,

    hasSendButton:

      !!chatElementState
      .elements
      .sendButton,

    hasTypingIndicator:

      !!chatElementState
      .elements
      .typingIndicator

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatElements =
Object.freeze({

  initialize:
  initializeChatElements,

  validate:
  validateChatElements,

  cleanup:
  cleanupChatElements,

  reset:
  resetChatElements,



  getContainer:
  getChatContainerElement,

  getInput:
  getMessageInputElement,

  getSendButton:
  getSendButtonElement,

  getScrollContainer:
  getScrollContainerElement,

  getTypingIndicator:
  getTypingIndicatorElement,



  setTypingIndicator:
  setTypingIndicatorElement,



  clear:
  clearChatContainer,

  append:
  appendChatElement,

  focusInput:
  focusMessageInput,



  diagnostics:
  getChatElementDiagnostics,

  snapshot:
  getChatElementDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "ChatElements",

    {

      value:
      ChatElements,

      writable:false,

      configurable:false

    }

  );

}
