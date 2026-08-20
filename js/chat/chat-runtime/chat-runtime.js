// =====================================
// RIGO AI
// CHAT RUNTIME
// CORE LIFECYCLE MANAGER
// =====================================

import {
  updateChatState,
  getChatSnapshot,
  resetChatState
}
from "../chat-state/chat-state.js";

import ChatEvents
from "../chat-events/chat-events.js";

import ChatMessageService
from "../chat-services/chat-message-service.js";

import ChatQueueService
from "../chat-services/chat-queue-service.js";

import ChatStreamService
from "../chat-services/chat-stream-service.js";

import ChatRenderService
from "../chat-services/chat-render-service.js";

import ChatUIManager
from "../chat-ui/chat-ui-manager.js";

const runtimeState = Object.seal({
  initialized:false,
  startedAt:null
});

function initialize(){
  if(runtimeState.initialized) return true;

  updateChatState({
    initializing:true,
    destroyed:false
  });

  ChatEvents.initialize();
  ChatMessageService.initialize();
  ChatQueueService.initialize();
  ChatStreamService.initialize();
  ChatRenderService.initialize();
  ChatUIManager.initialize();

  runtimeState.initialized = true;
  runtimeState.startedAt = Date.now();

  updateChatState({
    initialized:true,
    initializing:false
  });

  return true;
}

function boot(){
  return initialize();
}

function destroy(){
  if(!runtimeState.initialized) return true;

  ChatUIManager.destroy();
  ChatRenderService.destroy();
  ChatStreamService.destroy();
  ChatQueueService.destroy();
  ChatMessageService.destroy();
  ChatEvents.destroy();

  updateChatState({
    initialized:false,
    destroyed:true
  });

  runtimeState.initialized = false;
  runtimeState.startedAt = null;
  return true;
}

function shutdown(){
  return destroy();
}

function reset(){
  ChatUIManager.reset();
  ChatRenderService.reset();
  ChatStreamService.reset();
  ChatQueueService.reset();
  ChatMessageService.reset();
  resetChatState();
  return true;
}

function getStatus(){
  return Object.freeze({
    initialized:runtimeState.initialized,
    startedAt:runtimeState.startedAt,
    messages:ChatMessageService.status(),
    queue:ChatQueueService.status(),
    stream:ChatStreamService.status(),
    render:ChatRenderService.status(),
    ui:ChatUIManager.status()
  });
}

function getSnapshot(){
  return Object.freeze({
    runtime:structuredClone(runtimeState),
    chat:getChatSnapshot(),
    messages:ChatMessageService.snapshot(),
    queue:ChatQueueService.snapshot(),
    stream:ChatStreamService.snapshot(),
    render:ChatRenderService.snapshot(),
    ui:ChatUIManager.status()
  });
}

const ChatRuntime = Object.freeze({
  id:"chat",
  priority:20,
  initialize,
  boot,
  shutdown,
  destroy,
  reset,
  status:getStatus,
  snapshot:getSnapshot
});

export {
  initialize,
  boot,
  shutdown,
  destroy,
  reset,
  getStatus,
  getSnapshot,
  ChatRuntime
};

export default ChatRuntime;
