// =====================================
// RIGO AI
// CHAT MESSAGE SERVICE
// =====================================

import {
  addMessage,
  updateMessageRecord,
  removeMessage,
  getMessage as getStoredMessage,
  getMessages as getStoredMessages,
  hasMessage,
  getMessageCount,
  incrementCreated,
  incrementUpdated,
  incrementDeleted,
  getChatMessageSnapshot,
  resetChatMessageState
}
from "../chat-state/chat-message-state.js";

import { emit }
from "../chat-events/chat-events.js";

import { CHAT_EVENTS }
from "../chat-config.js";

import ChatQueueService
from "./chat-queue-service.js";

import ChatStreamService
from "./chat-stream-service.js";

const serviceState = Object.seal({
  initialized:false
});

let messageCounter = 0;

function createMessageId(){
  messageCounter++;
  return "msg_" + Date.now() + "_" + messageCounter;
}

function initialize(){
  if(serviceState.initialized) return true;
  ChatQueueService.initialize();
  ChatStreamService.initialize();
  serviceState.initialized = true;
  return true;
}

function destroy(){
  reset();
  serviceState.initialized = false;
  return true;
}

function reset(){
  messageCounter = 0;
  ChatQueueService.reset();
  ChatStreamService.reset();
  resetChatMessageState();
  return true;
}

function createMessage(payload = {}){
  if(!serviceState.initialized) initialize();

  const queueItem = ChatQueueService.enqueue({
    type:"message",
    data:{
      role:String(payload.role || "assistant"),
      conversationId:payload.conversationId ?? payload.metadata?.conversationId ?? null
    }
  });

  ChatQueueService.startProcessing();
  const activeItem = ChatQueueService.dequeue() || queueItem;

  try{
    const requestedId = String(payload.id || "").trim();
    const id = requestedId && !hasMessage(requestedId)
      ? requestedId
      : createMessageId();

    const message = {
      id,
      role:String(payload.role || "assistant"),
      content:String(payload.content || ""),
      metadata:{
        ...(payload.metadata && typeof payload.metadata === "object"
          ? payload.metadata
          : {}),
        ...(payload.userId ? {userId:payload.userId} : {}),
        ...(payload.conversationId ? {conversationId:payload.conversationId} : {})
      },
      createdAt:Number(payload.createdAt || Date.now()),
      updatedAt:Date.now()
    };

    addMessage(message);
    incrementCreated();

    if(message.role === "assistant" && message.content){
      ChatStreamService.start(message.id);
      ChatStreamService.pushChunk(message.content);
      ChatStreamService.flush();
      ChatStreamService.complete();
    }

    emit(CHAT_EVENTS.MESSAGE_CREATED, structuredClone(message));

    if(activeItem?.id) ChatQueueService.complete(activeItem.id);
    ChatQueueService.stopProcessing();

    return structuredClone(message);
  }
  catch(error){
    if(activeItem?.id) ChatQueueService.fail(activeItem.id);
    ChatQueueService.stopProcessing();
    throw error;
  }
}

function updateMessage(messageId, updates = {}){
  if(!hasMessage(messageId)) return null;

  updateMessageRecord(messageId, {
    ...updates,
    updatedAt:Date.now()
  });

  const message = getStoredMessage(messageId);
  incrementUpdated();
  emit(CHAT_EVENTS.MESSAGE_UPDATED, structuredClone(message));
  return structuredClone(message);
}

function deleteMessage(messageId){
  const message = getStoredMessage(messageId);
  if(!message) return false;

  removeMessage(messageId);
  incrementDeleted();
  emit(CHAT_EVENTS.MESSAGE_DELETED, structuredClone(message));
  return true;
}

function getMessage(messageId){
  const message = getStoredMessage(messageId);
  return message ? structuredClone(message) : null;
}

function getMessages(){
  return getStoredMessages().map(message => structuredClone(message));
}

function getStatus(){
  return Object.freeze({
    initialized:serviceState.initialized,
    messages:getMessageCount(),
    queue:ChatQueueService.status(),
    stream:ChatStreamService.status()
  });
}

function getSnapshot(){
  return Object.freeze({
    messages:getChatMessageSnapshot(),
    queue:ChatQueueService.snapshot(),
    stream:ChatStreamService.snapshot()
  });
}

const ChatMessageService = Object.freeze({
  initialize,
  destroy,
  reset,
  status:getStatus,
  snapshot:getSnapshot,
  create:createMessage,
  update:updateMessage,
  delete:deleteMessage,
  get:getMessage,
  getAll:getMessages
});

export {
  initialize,
  destroy,
  reset,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessage,
  getMessages,
  getStatus,
  getSnapshot,
  ChatMessageService
};

export default ChatMessageService;
