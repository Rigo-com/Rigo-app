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
// SAFE QUERY
// =====================================

function queryDOMElement(
  id
){

  try{

    if(
      typeof document ===
      "undefined"
    ){

      return null;

    }

    return document
    .getElementById(id);

  }

  catch(error){

    return null;

  }

}



// =====================================
// VALIDATE ELEMENT
// =====================================

function validateDOMElement(
  element
){

  return Boolean(

    element &&

    typeof element ===
    "object"

  );

}



// =====================================
// LEGACY GLOBALS
// =====================================

function syncLegacyDOMGlobals(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    window.messageInput =
    DOMReferences
    .messageInput;

    window.sendButton =
    DOMReferences
    .sendButton;

    window.chatContainer =
    DOMReferences
    .chatContainer;

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// INITIALIZE DOM ELEMENTS
// =====================================

async function initializeDOMElements(){

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }



  // ================================
  // CLEAN PREVIOUS
  // ================================

  resetDOMReferences();



  // ================================
  // REFERENCES
  // ================================

  DOMReferences
  .messageInput =
  queryDOMElement(
    "messageInput"
  );

  DOMReferences
  .sendButton =
  queryDOMElement(
    "sendButton"
  );

  DOMReferences
  .chatContainer =
  queryDOMElement(
    "chatContainer"
  );

  DOMReferences
  .loadingScreen =
  queryDOMElement(
    "loadingScreen"
  );



  // ================================
  // VALIDATION
  // ================================

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



  // ================================
  // GLOBALS
  // ================================

  syncLegacyDOMGlobals();



  // ================================
  // DIAGNOSTICS
  // ================================

  if(
    typeof logDiagnosticInfo ===
    "function"
  ){

    await logDiagnosticInfo(

      "DOM INITIALIZED",

      {

        valid

      }

    );

  }

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
// SNAPSHOT
// =====================================

function createDOMSnapshot(){

  return Object.freeze({

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
      ),

    timestamp:
    Date.now()

  });

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



  // ================================
  // RESET GLOBALS
  // ================================

  try{

    if(
      typeof window !==
      "undefined"
    ){

      window.messageInput =
      null;

      window.sendButton =
      null;

      window.chatContainer =
      null;

    }

  }

  catch(error){}

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getDOMDiagnostics(){

  return Object.freeze({

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
      ),

    timestamp:
    Date.now()

  });

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

  snapshot:
  createDOMSnapshot,

  refs:
  DOMReferences

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AppDOM =
  AppDOM;

  window.DOMReferences =
  DOMReferences;

  window.initializeDOMElements =
  initializeDOMElements;

  window.validateDOMElements =
  validateDOMElements;

  window.resetDOMReferences =
  resetDOMReferences;

  window.getDOMDiagnostics =
  getDOMDiagnostics;

  window.createDOMSnapshot =
  createDOMSnapshot;

}
