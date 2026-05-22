// =====================================
// RIGO AI
// APP DOM
// =====================================



// =====================================
// DOM REFERENCES
// =====================================

const DOMReferences =
Object.seal({

  initialized:false,

  messageInput:null,

  sendButton:null,

  chatContainer:null,

  loadingScreen:null

});



// =====================================
// VALIDATE ELEMENT
// =====================================

function validateDOMElement(
  element
){

  return Boolean(
    element
  );

}



// =====================================
// INITIALIZE DOM ELEMENTS
// =====================================

function initializeDOMElements(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  DOMReferences
  .messageInput =
  document.getElementById(
    "messageInput"
  );

  DOMReferences
  .sendButton =
  document.getElementById(
    "sendButton"
  );

  DOMReferences
  .chatContainer =
  document.getElementById(
    "chatContainer"
  );

  DOMReferences
  .loadingScreen =
  document.getElementById(
    "loadingScreen"
  );



  // ================================
  // LEGACY GLOBAL REFERENCES
  // ================================

  messageInput =
  DOMReferences
  .messageInput;

  sendButton =
  DOMReferences
  .sendButton;

  chatContainer =
  DOMReferences
  .chatContainer;



  const valid =

    validateDOMElement(
      DOMReferences
      .messageInput
    ) &&

    validateDOMElement(
      DOMReferences
      .sendButton
    ) &&

    validateDOMElement(
      DOMReferences
      .chatContainer
    );

  DOMReferences
  .initialized =
  valid;

  return valid;

}



// =====================================
// VALIDATE DOM
// =====================================

function validateDOMElements(){

  return (

    DOMReferences
    .initialized &&

    validateDOMElement(

      DOMReferences
      .messageInput

    ) &&

    validateDOMElement(

      DOMReferences
      .sendButton

    ) &&

    validateDOMElement(

      DOMReferences
      .chatContainer

    )

  );

}



// =====================================
// RESET DOM
// =====================================

function resetDOMReferences(){

  DOMReferences
  .initialized =
  false;

  DOMReferences
  .messageInput =
  null;

  DOMReferences
  .sendButton =
  null;

  DOMReferences
  .chatContainer =
  null;

  DOMReferences
  .loadingScreen =
  null;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getDOMDiagnostics(){

  return {

    initialized:
    DOMReferences
    .initialized,

    messageInput:

      Boolean(
        DOMReferences
        .messageInput
      ),

    sendButton:

      Boolean(
        DOMReferences
        .sendButton
      ),

    chatContainer:

      Boolean(
        DOMReferences
        .chatContainer
      ),

    loadingScreen:

      Boolean(
        DOMReferences
        .loadingScreen
      )

  };

}



// =====================================
// PUBLIC API
// =====================================

const AppDOM =
Object.freeze({

  initialize:
  initializeDOMElements,

  validate:
  validateDOMElements,

  reset:
  resetDOMReferences,

  diagnostics:
  getDOMDiagnostics,

  refs:
  DOMReferences

});
