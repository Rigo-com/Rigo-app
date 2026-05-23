// =====================================
// RIGO AI
// UI ELEMENTS
// ENTERPRISE DOM REGISTRY
// =====================================



// =====================================
// UI SELECTORS
// =====================================

const UI_SELECTORS =
Object.freeze({

  app:
  "#app",

  sidebar:
  "#sidebar",

  chatContainer:
  "#chat-container",

  messagesContainer:
  "#messages-container",

  input:
  "#message-input",

  sendButton:
  "#send-button",

  toastContainer:
  "#toast-container",

  modalContainer:
  "#modal-container"

});



// =====================================
// SAFE ELEMENT CACHE
// =====================================

function cacheUIElement(
  key,
  selector
){

  if(
    typeof key !==
    "string"
  ){

    return false;

  }

  const element =
  safeQuerySelector(
    selector
  );

  uiElements[key] =
  element || null;

  if(
    element
  ){

    uiState
    .mountedNodes
    .add(
      element
    );

    uiState
    .trackedElements
    .set(
      key,
      element
    );
  }

  return Boolean(
    element
  );

}



// =====================================
// CACHE UI ELEMENTS
// =====================================

function cacheUIElements(){

  Object.entries(
    UI_SELECTORS
  )
  .forEach(([key,selector]) => {

    cacheUIElement(
      key,
      selector
    );

  });

  return true;

}



// =====================================
// REQUIRED ELEMENTS
// =====================================

function getRequiredUIElements(){

  return [

    "app",

    "chatContainer",

    "messagesContainer"

  ];

}



// =====================================
// VALIDATE UI ELEMENTS
// =====================================

function validateUIElements(){

  const required =
  getRequiredUIElements();

  return required.every((key) => {

    return isValidElement(
      uiElements[key]
    );

  });

}



// =====================================
// GET UI ELEMENT
// =====================================

function getUIElement(
  key
){

  if(
    typeof key !==
    "string"
  ){

    return null;

  }

  const element =
  uiElements[key];

  if(
    !isValidElement(
      element
    )
  ){

    return null;

  }

  return element;

}



// =====================================
// TRACK UI ELEMENT
// =====================================

function trackUIElement(
  key,
  element
){

  if(
    typeof key !==
    "string"
  ){

    return false;

  }

  if(
    !isValidElement(
      element
    )
  ){

    return false;

  }

  if(

    uiState
    .trackedElements
    .size >=

    UI_CONFIG
    .MAX_DOM_REFERENCES

  ){

    return false;

  }

  uiElements[key] =
  element;

  uiState
  .mountedNodes
  .add(
    element
  );

  uiState
  .trackedElements
  .set(
    key,
    element
  );

  return true;

}



// =====================================
// UNTRACK UI ELEMENT
// =====================================

function untrackUIElement(
  key
){

  if(
    typeof key !==
    "string"
  ){

    return false;

  }

  uiState
  .trackedElements
  .delete(
    key
  );

  if(
    key in uiElements
  ){

    uiElements[key] =
    null;

  }

  return true;

}



// =====================================
// CLEAN DETACHED ELEMENTS
// =====================================

function cleanupDetachedUIElements(){

  uiState
  .trackedElements
  .forEach((element,key) => {

    if(
      !isValidElement(
        element
      )
    ){

      untrackUIElement(
        key
      );

      return;
    }

    if(
      !document.body.contains(
        element
      )
    ){

      untrackUIElement(
        key
      );

    }

  });

  return true;

}



// =====================================
// TOAST CONTAINER
// =====================================

function initializeToastContainer(){

  if(
    isValidElement(
      uiElements
      .toastContainer
    )
  ){

    return true;

  }

  const container =
  safeCreateElement(
    "div",
    ["toast-container"]
  );

  if(!container){

    return false;

  }

  container.id =
  "toast-container";

  document.body
  .appendChild(
    container
  );

  return trackUIElement(
    "toastContainer",
    container
  );

}



// =====================================
// MODAL CONTAINER
// =====================================

function initializeModalContainer(){

  if(
    isValidElement(
      uiElements
      .modalContainer
    )
  ){

    return true;

  }

  const container =
  safeCreateElement(
    "div",
    ["modal-container"]
  );

  if(!container){

    return false;

  }

  container.id =
  "modal-container";

  document.body
  .appendChild(
    container
  );

  return trackUIElement(
    "modalContainer",
    container
  );

}



// =====================================
// CLEAR MODAL CONTAINER
// =====================================

function clearModalContainer(){

  const container =
  uiElements
  .modalContainer;

  if(
    !isValidElement(
      container
    )
  ){

    return false;

  }

  container.innerHTML =
  "";

  return true;

}



// =====================================
// ELEMENT DIAGNOSTICS
// =====================================

function getUIElementDiagnostics(){

  return Object.freeze({

    tracked:

      uiState
      .trackedElements
      .size,

    mountedReferences:

      Object.keys(
        uiElements
      )
      .filter((key) => {

        return isValidElement(
          uiElements[key]
        );

      })

  });

}



// =====================================
// PUBLIC API
// =====================================

const UIElements =
Object.freeze({

  cache:
  cacheUIElements,

  validate:
  validateUIElements,

  get:
  getUIElement,

  track:
  trackUIElement,

  untrack:
  untrackUIElement,

  cleanup:
  cleanupDetachedUIElements,

  initializeToast:
  initializeToastContainer,

  initializeModal:
  initializeModalContainer,

  clearModal:
  clearModalContainer,

  diagnostics:
  getUIElementDiagnostics

});
