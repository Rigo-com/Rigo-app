// =====================================
// RIGO AI
// APP DOM
// DOM BRIDGE SERVICE
// ENTERPRISE FINAL
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const DOMReferences =
Object.seal({

  initialized:false,

  initializing:false,

  lastInitializedAt:null,

  lastValidationAt:null,

  lastError:null,

  messageInput:null,

  sendButton:null,

  chatContainer:null,

  loadingScreen:null

});



// =====================================
// HELPERS
// =====================================

function isFunction(
  value
){

  return typeof value ===
  "function";

}



function isPlainObject(
  value
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype ||

    prototype ===
    null

  );

}



function isHTMLElement(
  element
){

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



function safeFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof HTMLElement ||

    value instanceof Date ||

    value instanceof Map ||

    value instanceof Set ||

    value instanceof RegExp ||

    value instanceof Promise

  ){

    return value;

  }

  if(

    !Array.isArray(value) &&

    !isPlainObject(value)

  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    safeFreeze(
      nestedValue,
      visited
    );

  });

  return value;

}



function normalizeDOMError(
  error
){

  if(
    typeof getSafeErrorMessage ===
    "function"
  ){

    return getSafeErrorMessage(
      error
    );

  }

  return String(
    error || "UNKNOWN ERROR"
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



// =====================================
// EVENTS
// =====================================

const APP_DOM_EVENTS =
Object.freeze({

  INITIALIZED:
  "app.dom.initialized",

  RESET:
  "app.dom.reset",

  VALIDATED:
  "app.dom.validated"

});



// =====================================
// EVENT EMITTER
// =====================================

async function emitDOMEvent(
  event,
  payload = {}
){

  try{

    if(
      !isFunction(
        emitSystemEvent
      )
    ){

      return false;

    }

    await emitSystemEvent(

      event,

      {

        source:
        "app-dom",

        timestamp:
        Date.now(),

        ...payload

      }

    );

    return true;

  }

  catch(error){

    emitDOMWarning(

      `Event failed: ${event}`,

      error

    );

    return false;

  }

}



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

    const element =
    document.getElementById(
      id
    );

    if(
      !element
    ){

      emitDOMWarning(
        `Missing DOM element: ${id}`
      );

    }

    return element;

  }

  catch(error){

    emitDOMWarning(

      `DOM query failed: ${id}`,

      error

    );

    return null;

  }

}



// =====================================
// VALIDATION
// =====================================

function validateDOMElement(
  element
){

  return isHTMLElement(
    element
  );

}



function validateDOMElements(){

  const valid = (

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

  DOMReferences
  .lastValidationAt =
  Date.now();

  return valid;

}



// =====================================
// LEGACY SUPPORT
// =====================================

function syncLegacyDOMGlobals(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return false;

    }

    // ===============================
    // TEMPORARY LEGACY SUPPORT
    // ===============================

    window.messageInput =
    DOMReferences.messageInput;

    window.sendButton =
    DOMReferences.sendButton;

    window.chatContainer =
    DOMReferences.chatContainer;

    return true;

  }

  catch(error){

    emitDOMWarning(
      "Legacy DOM sync failed",
      error
    );

    return false;

  }

}



// =====================================
// RESET
// =====================================

async function resetDOMReferences(){

  DOMReferences
  .initialized =
  false;

  DOMReferences
  .initializing =
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

  DOMReferences
  .lastError =
  null;

  try{

    if(
      typeof window !==
      "undefined"
    ){

      // =============================
      // TEMPORARY LEGACY SUPPORT
      // =============================

      window.messageInput =
      null;

      window.sendButton =
      null;

      window.chatContainer =
      null;

    }

    await emitDOMEvent(
      APP_DOM_EVENTS.RESET
    );

    return true;

  }

  catch(error){

    DOMReferences
    .lastError =
    normalizeDOMError(
      error
    );

    emitDOMWarning(
      "DOM reset failed",
      error
    );

    return false;

  }

}



// =====================================
// INITIALIZE
// =====================================

async function initializeDOMElements(){

  if(
    DOMReferences
    .initialized
  ){

    return true;

  }

  if(
    DOMReferences
    .initializing
  ){

    return false;

  }

  DOMReferences
  .initializing =
  true;

  DOMReferences
  .lastError =
  null;

  try{

    if(
      typeof document ===
      "undefined"
    ){

      throw new Error(
        "DOCUMENT NOT AVAILABLE"
      );

    }

    await resetDOMReferences();

    // =============================
    // REFERENCES
    // =============================

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

    // =============================
    // VALIDATION
    // =============================

    const valid =
    validateDOMElements();

    DOMReferences
    .initialized =
    valid;

    DOMReferences
    .lastInitializedAt =
    Date.now();

    // =============================
    // LEGACY SUPPORT
    // =============================

    syncLegacyDOMGlobals();

    // =============================
    // EVENTS
    // =============================

    await emitDOMEvent(

      APP_DOM_EVENTS
      .INITIALIZED,

      {

        valid

      }

    );

    await emitDOMEvent(

      APP_DOM_EVENTS
      .VALIDATED,

      {

        valid

      }

    );

    // =============================
    // DIAGNOSTICS
    // =============================

    if(
      isFunction(
        logDiagnosticInfo
      )
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

  catch(error){

    DOMReferences
    .lastError =
    normalizeDOMError(
      error
    );

    emitDOMWarning(

      "DOM initialization failed",

      error

    );

    return false;

  }

  finally{

    DOMReferences
    .initializing =
    false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createDOMSnapshot(){

  return safeFreeze({

    initialized:
    DOMReferences.initialized,

    initializing:
    DOMReferences.initializing,

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

    lastInitializedAt:

      DOMReferences
      .lastInitializedAt,

    lastValidationAt:

      DOMReferences
      .lastValidationAt,

    lastError:

      DOMReferences
      .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// READONLY REFERENCES
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

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "AppDOM",

    {

      value:
      AppDOM,

      writable:false,

      configurable:false

    }

  );

}
