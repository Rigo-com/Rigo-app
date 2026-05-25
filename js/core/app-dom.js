// =====================================
// RIGO AI
// APP DOM
// DOM BRIDGE SERVICE
// =====================================



// =====================================
// INTERNAL DOM REFERENCES
// =====================================

const DOMReferences = {

  initialized:
  false,

  messageInput:
  null,

  sendButton:
  null,

  chatContainer:
  null,

  loadingScreen:
  null

};



// =====================================
// HELPERS
// =====================================

function isHTMLElement(element){

  if(
    typeof HTMLElement ===
    "undefined"
  ){
    return false;
  }

  return (
    element instanceof HTMLElement
  );

}



function emitDOMWarning(
  message,
  error = null
){

  console.warn(
    `[AppDOM] ${message}`,
    error || ""
  );

}



function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !== "object"
  ){
    return value;
  }

  if(visited.has(value)){
    return value;
  }

  if(

    value instanceof HTMLElement ||
    value instanceof Date ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof RegExp

  ){
    return value;
  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value).forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue === "object"
    ){

      safeFreeze(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// SAFE QUERY
// =====================================

function queryDOMElement(id){

  try{

    if(
      typeof document ===
      "undefined"
    ){

      return null;

    }

    const element =
      document.getElementById(id);

    if(!element){

      emitDOMWarning(
        `Missing DOM element: ${id}`
      );

    }

    return element;

  }catch(error){

    emitDOMWarning(
      `DOM query failed: ${id}`,
      error
    );

    return null;

  }

}



// =====================================
// VALIDATE ELEMENT
// =====================================

function validateDOMElement(
  element
){

  return (
    isHTMLElement(element)
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

    // =================================
    // TEMPORARY LEGACY SUPPORT
    // =================================

    window.messageInput =
      DOMReferences.messageInput;

    window.sendButton =
      DOMReferences.sendButton;

    window.chatContainer =
      DOMReferences.chatContainer;

    return true;

  }catch(error){

    emitDOMWarning(
      "Legacy DOM sync failed",
      error
    );

    return false;

  }

}



// =====================================
// RESET DOM REFERENCES
// =====================================

function resetDOMReferences(){

  DOMReferences.initialized =
    false;

  DOMReferences.messageInput =
    null;

  DOMReferences.sendButton =
    null;

  DOMReferences.chatContainer =
    null;

  DOMReferences.loadingScreen =
    null;

  try{

    if(
      typeof window !==
      "undefined"
    ){

      // ===============================
      // TEMPORARY LEGACY SUPPORT
      // ===============================

      window.messageInput =
        null;

      window.sendButton =
        null;

      window.chatContainer =
        null;

    }

  }catch(error){

    emitDOMWarning(
      "DOM reset failed",
      error
    );

  }

  return true;

}



// =====================================
// INITIALIZE DOM
// =====================================

async function initializeDOMElements(){

  try{

    if(
      typeof document ===
      "undefined"
    ){

      return false;

    }



    // ===============================
    // CLEAN PREVIOUS
    // ===============================

    resetDOMReferences();



    // ===============================
    // REFERENCES
    // ===============================

    DOMReferences.messageInput =
      queryDOMElement(
        "messageInput"
      );

    DOMReferences.sendButton =
      queryDOMElement(
        "sendButton"
      );

    DOMReferences.chatContainer =
      queryDOMElement(
        "chatContainer"
      );

    DOMReferences.loadingScreen =
      queryDOMElement(
        "loadingScreen"
      );



    // ===============================
    // VALIDATION
    // ===============================

    const valid =

      validateDOMElement(
        DOMReferences.messageInput
      ) &&

      validateDOMElement(
        DOMReferences.sendButton
      ) &&

      validateDOMElement(
        DOMReferences.chatContainer
      );

    DOMReferences.initialized =
      valid;



    // ===============================
    // LEGACY SUPPORT
    // ===============================

    syncLegacyDOMGlobals();



    // ===============================
    // DIAGNOSTICS
    // ===============================

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

  }catch(error){

    emitDOMWarning(
      "DOM initialization failed",
      error
    );

    return false;

  }

}



// =====================================
// VALIDATE DOM
// =====================================

function validateDOMElements(){

  return (

    DOMReferences.initialized &&

    validateDOMElement(
      DOMReferences.messageInput
    ) &&

    validateDOMElement(
      DOMReferences.sendButton
    ) &&

    validateDOMElement(
      DOMReferences.chatContainer
    )

  );

}



// =====================================
// DOM SNAPSHOT
// =====================================

function createDOMSnapshot(){

  return safeFreeze({

    initialized:
    DOMReferences.initialized,

    messageInput:

      Boolean(
        DOMReferences.messageInput
      ),

    sendButton:

      Boolean(
        DOMReferences.sendButton
      ),

    chatContainer:

      Boolean(
        DOMReferences.chatContainer
      ),

    loadingScreen:

      Boolean(
        DOMReferences.loadingScreen
      ),

    timestamp:
    Date.now()

  });

}



// =====================================
// DOM ACCESSORS
// =====================================

function getDOMReferences(){

  return safeFreeze({

    initialized:
    DOMReferences.initialized,

    messageInput:
    DOMReferences.messageInput,

    sendButton:
    DOMReferences.sendButton,

    chatContainer:
    DOMReferences.chatContainer,

    loadingScreen:
    DOMReferences.loadingScreen

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

  snapshot:
  createDOMSnapshot,

  refs:
  getDOMReferences

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(typeof window !== "undefined"){

  Object.defineProperty(
    window,
    "AppDOM",
    {

      value:
      AppDOM,

      writable:
      false,

      configurable:
      false

    }
  );

}
