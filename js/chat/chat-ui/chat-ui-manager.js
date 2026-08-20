// =====================================
// RIGO AI
// CHAT UI MANAGER
// UI COORDINATION LAYER
// =====================================

import { on, off }
from "../chat-events/chat-events.js";

import { CHAT_EVENTS }
from "../chat-config.js";

import ChatActions
from "../chat-actions/chat-actions.js";

import ChatRenderService
from "../chat-services/chat-render-service.js";

import ChatUiRenderer
from "./chat-ui-renderer.js";

import ChatScrollManager
from "./chat-scroll-manager.js";

import { clearElements }
from "./chat-elements.js";

const uiState = Object.seal({
  initialized:false,
  listeners:[]
});

function schedule(handler,payload = null){
  return ChatRenderService.enqueueRender({
    handler,
    payload
  });
}

function handleMessageCreated(message){
  schedule((payload) => {
    ChatUiRenderer.renderMessage(payload);
    ChatScrollManager.scrollToBottom();
  },message);
}

function handleMessageUpdated(message){
  schedule(
    payload => ChatUiRenderer.updateMessage(payload),
    message
  );
}

function handleMessageDeleted(message){
  if(!message) return;
  schedule(
    payload => ChatUiRenderer.removeMessage(payload.id),
    message
  );
}

function handleStreamUpdated(payload){
  if(!payload?.messageId) return;
  schedule(
    data => ChatUiRenderer.updateMessage({
      id:data.messageId,
      role:"assistant",
      content:data.content
    }),
    payload
  );
}

function handleChatReset(){
  schedule(() => ChatUiRenderer.clearMessages());
}

function bindEvent(eventName,handler){
  on(eventName,handler);
  uiState.listeners.push({eventName,handler});
}

function bindEvents(){
  bindEvent(CHAT_EVENTS.MESSAGE_CREATED,handleMessageCreated);
  bindEvent(CHAT_EVENTS.MESSAGE_UPDATED,handleMessageUpdated);
  bindEvent(CHAT_EVENTS.MESSAGE_DELETED,handleMessageDeleted);
  bindEvent(CHAT_EVENTS.STREAM_UPDATED,handleStreamUpdated);
  bindEvent(CHAT_EVENTS.CHAT_RESET,handleChatReset);
  return true;
}

function unbindEvents(){
  for(const listener of uiState.listeners){
    off(listener.eventName,listener.handler);
  }
  uiState.listeners = [];
  return true;
}

function initialize(){
  if(uiState.initialized) return true;
  ChatRenderService.initialize();
  bindEvents();
  uiState.initialized = true;
  return true;
}

function destroy(){
  unbindEvents();
  ChatRenderService.clear();
  clearElements();
  uiState.initialized = false;
  return true;
}

function reset(){
  ChatRenderService.clear();
  ChatUiRenderer.clearMessages();
  ChatUiRenderer.reset();
  ChatScrollManager.reset();
  return true;
}

function sendMessage(payload){
  return ChatActions.sendMessage(payload);
}

function clearChat(){
  ChatActions.clearChat();
  reset();
  return true;
}

function getStatus(){
  return Object.freeze({
    initialized:uiState.initialized,
    listeners:uiState.listeners.length,
    renderer:ChatUiRenderer.status(),
    renderService:ChatRenderService.status(),
    scroll:ChatScrollManager.status()
  });
}

const ChatUiManager = Object.freeze({
  initialize,
  destroy,
  reset,
  sendMessage,
  clearChat,
  status:getStatus
});

export {
  initialize,
  destroy,
  reset,
  sendMessage,
  clearChat,
  getStatus,
  ChatUiManager
};

export default ChatUiManager;
