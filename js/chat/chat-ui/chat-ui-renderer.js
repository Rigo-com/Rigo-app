// =====================================
// RIGO AI
// CHAT UI RENDERER
// UI RENDER LAYER
// =====================================

import {
  getMessagesElement
}
from "./chat-elements.js";



// =====================================
// RUNTIME
// =====================================

const rendererRuntime =
Object.seal({

  rendered:0,

  updated:0,

  removed:0,

  cleared:0

});



// =====================================
// HELPERS
// =====================================

function createMessageElement(
  message = {}
){

  const element =
  document.createElement(
    "div"
  );

  element.dataset.messageId =
  message.id || "";

  element.dataset.role =
  message.role || "";

  element.className =
  "chat-message";

  element.textContent =
  message.content || "";

  return element;

}



function findMessageElement(
  messageId
){

  const container =
  getMessagesElement();

  if(
    !container
  ){
    return null;
  }

  return container
  .querySelector(

    `[data-message-id="${messageId}"]`

  );

}



// =====================================
// RENDER MESSAGE
// =====================================

function renderMessage(
  message = {}
){

  const container =
  getMessagesElement();

  if(
    !container
  ){
    return null;
  }

  const element =

    createMessageElement(
      message
    );

  container.appendChild(
    element
  );

  rendererRuntime
  .rendered++;

  return element;

}



// =====================================
// UPDATE MESSAGE
// =====================================

function updateMessage(
  message = {}
){

  const element =

    findMessageElement(
      message.id
    );

  if(
    !element
  ){
    return false;
  }

  element.textContent =
  message.content || "";

  rendererRuntime
  .updated++;

  return true;

}



// =====================================
// REMOVE MESSAGE
// =====================================

function removeMessage(
  messageId
){

  const element =

    findMessageElement(
      messageId
    );

  if(
    !element
  ){
    return false;
  }

  element.remove();

  rendererRuntime
  .removed++;

  return true;

}



// =====================================
// CLEAR MESSAGES
// =====================================

function clearMessages(){

  const container =
  getMessagesElement();

  if(
    !container
  ){
    return false;
  }

  container.innerHTML =
  "";

  rendererRuntime
  .cleared++;

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    rendered:
    rendererRuntime
    .rendered,

    updated:
    rendererRuntime
    .updated,

    removed:
    rendererRuntime
    .removed,

    cleared:
    rendererRuntime
    .cleared

  });

}



// =====================================
// RESET
// =====================================

function reset(){

  rendererRuntime
  .rendered = 0;

  rendererRuntime
  .updated = 0;

  rendererRuntime
  .removed = 0;

  rendererRuntime
  .cleared = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ChatUiRenderer =
Object.freeze({

  renderMessage,

  updateMessage,

  removeMessage,

  clearMessages,

  status:
  getStatus,

  reset

});



// =====================================
// EXPORTS
// =====================================

export {

  renderMessage,

  updateMessage,

  removeMessage,

  clearMessages,

  getStatus,

  reset,

  ChatUiRenderer

};

export default
ChatUiRenderer;
