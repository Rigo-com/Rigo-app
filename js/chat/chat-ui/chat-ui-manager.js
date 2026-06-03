// =====================================
// RIGO AI
// CHAT UI MANAGER
// UI COORDINATION LAYER
// =====================================

import {
  on,
  off
}
from "../chat-events/chat-events.js";

import {
  CHAT_EVENTS
}
from "../chat-config.js";

import ChatActions
from "../chat-actions/chat-actions.js";

import ChatUiRenderer
from "./chat-ui-renderer.js";

import ChatScrollManager
from "./chat-scroll-manager.js";

import {
  clearElements
}
from "./chat-elements.js";



// =====================================
// UI STATE
// =====================================

const uiState =
Object.seal({

  initialized:false,

  listeners:[]

});



// =====================================
// EVENT HANDLERS
// =====================================

function handleMessageCreated(
  message
){

  ChatUiRenderer
  .renderMessage(
    message
  );

  ChatScrollManager
  .scrollToBottom();

}



function handleMessageUpdated(
  message
){

  ChatUiRenderer
  .updateMessage(
    message
  );

}



function handleMessageDeleted(
  message
){

  if(
    !message
  ){
    return;
  }

  ChatUiRenderer
  .removeMessage(
    message.id
  );

}



function handleChatReset(){

  ChatUiRenderer
  .clearMessages();

}



// =====================================
// EVENT BINDING
// =====================================

function bindEvent(
  eventName,
  handler
){

  on(
    eventName,
    handler
  );

  uiState
  .listeners
  .push({

    eventName,

    handler

  });

}



function bindEvents(){

  bindEvent(

    CHAT_EVENTS
    .MESSAGE_CREATED,

    handleMessageCreated

  );

  bindEvent(

    CHAT_EVENTS
    .MESSAGE_UPDATED,

    handleMessageUpdated

  );

  bindEvent(

    CHAT_EVENTS
    .MESSAGE_DELETED,

    handleMessageDeleted

  );

  bindEvent(

    CHAT_EVENTS
    .CHAT_RESET,

    handleChatReset

  );

  return true;

}



function unbindEvents(){

  for(
    const listener
    of uiState.listeners
  ){

    off(

      listener.eventName,

      listener.handler

    );

  }

  uiState.listeners =
  [];

  return true;

}



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    uiState.initialized
  ){
    return true;
  }

  bindEvents();

  uiState.initialized =
  true;

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  unbindEvents();

  clearElements();

  uiState.initialized =
  false;

  return true;

}



// =====================================
// RESET
// =====================================

function reset(){

  ChatUiRenderer
  .clearMessages();

  ChatUiRenderer
  .reset();

  ChatScrollManager
  .reset();

  return true;

}



// =====================================
// ACTION HELPERS
// =====================================

function sendMessage(
  payload
){

  return ChatActions
  .sendMessage(
    payload
  );

}



function clearChat(){

  ChatActions
  .clearChat();

  reset();

  return true;

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    initialized:
    uiState
    .initialized,

    listeners:
    uiState
    .listeners
    .length,

    renderer:
    ChatUiRenderer
    .status(),

    scroll:
    ChatScrollManager
    .status()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ChatUiManager =
Object.freeze({

  initialize,

  destroy,

  reset,

  sendMessage,

  clearChat,

  status:
  getStatus

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  reset,

  sendMessage,

  clearChat,

  getStatus,

  ChatUiManager

};

export default
ChatUiManager;
