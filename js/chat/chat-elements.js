// =====================================
// RIGO AI
// CHAT ELEMENTS
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
  .getElementById(id);

}



// =====================================
// CACHE ELEMENTS
// =====================================

function cacheChatElements(){

  if(
    chatElementState.cached
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

  chatElementState.cached =
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

  chatElementState.validated =
  valid;

  return valid;

}



// =====================================
// INITIALIZE
// =====================================

function initializeChatElements(){

  if(
    chatElementState.initialized
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

  chatElementState.initialized =
  true;

  return true;

}



// =====================================
// GETTERS
// =====================================

function getChatContainerElement(){

  return chatElementState
  .elements
  .container;

}



function getMessageInputElement(){

  return chatElementState
  .elements
  .input;

}



function getSendButtonElement(){

  return chatElementState
  .elements
  .sendButton;

}



function getScrollContainerElement(){

  return chatElementState
  .elements
  .scrollContainer;

}



// =====================================
// CLEAR CONTAINER
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

  return true;

}



// =====================================
// APPEND ELEMENT
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
// FOCUS INPUT
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

    catch{

      return false;

    }

  }

}



// =====================================
// RESET
// =====================================

function resetChatElements(){

  chatElementState.validated =
  false;

  chatElementState.cached =
  false;

  return true;

}



// =====================================
// CLEANUP
// =====================================

function cleanupChatElements(){

  resetChatElements();

  Object.assign(

    chatElementState.elements,

    {

      container:null,

      input:null,

      sendButton:null,

      scrollContainer:null

    }

  );

  chatElementState.cached =
  false;

  chatElementState.validated =
  false;

  chatElementState.initialized =
  false;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getChatElementDiagnostics(){

  return Object.freeze({

    initialized:
    chatElementState.initialized,

    validated:
    chatElementState.validated,

    cached:
    chatElementState.cached,

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
    .sendButton

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
// EXPORTS
// =====================================

export {

  ChatElements,

  initializeChatElements,

  validateChatElements,

  cleanupChatElements,

  resetChatElements,

  getChatContainerElement,

  getMessageInputElement,

  getSendButtonElement,

  getScrollContainerElement,

  clearChatContainer,

  appendChatElement,

  focusMessageInput,

  getChatElementDiagnostics

};

export default
ChatElements;
