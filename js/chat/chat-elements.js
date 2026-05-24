// =====================================
// RIGO AI
// CHAT ELEMENTS
// ENTERPRISE CHAT DOM SYSTEM
// =====================================



// =====================================
// CHAT ELEMENT STATE
// =====================================

const chatElementState =
Object.seal({

  initialized:false,

  validated:false,

  cached:false,

  activeInput:null,

  activeContainer:null,

  typingIndicator:null,

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

  chatElementState
  .elements
  .sendButton =

    getChatElement(
      "sendButton"
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

    !!elements.input;

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

    return false;

  }

  chatElementState
  .activeContainer =

    chatElementState
    .elements
    .container;

  chatElementState
  .activeInput =

    chatElementState
    .elements
    .input;

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

  chatElementState
  .elements
  .typingIndicator =
  element;

  chatElementState
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

  container.replaceChildren();

  chatElementState
  .typingIndicator =
  null;

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

    input.focus();

    return true;

  }

  catch(error){

    safeLogError?.(
      error
    );

    return false;

  }

}



// =====================================
// RESET ELEMENTS
// =====================================

function resetChatElements(){

  chatElementState
  .activeInput =
  null;

  chatElementState
  .activeContainer =
  null;

  chatElementState
  .typingIndicator =
  null;

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
  getChatElementDiagnostics

});
