// =====================================
// RIGO AI
// CHAT ACTIONS
// ORCHESTRATION LAYER
// =====================================

import {
  CHAT_EVENTS,
  CHAT_LIMITS,
  CHAT_TIMERS
}
from "../chat-config.js";

import { emit }
from "../chat-events/chat-events.js";

import ChatRuntime
from "../chat-runtime/chat-runtime.js";

import ChatMessageService
from "../chat-services/chat-message-service.js";

import ChatQueueService
from "../chat-services/chat-queue-service.js";

import ChatStreamService
from "../chat-services/chat-stream-service.js";

import ChatState,{ chatState }
from "../chat-state/chat-state.js";

import {
  loadAccountSection,
  saveAccountSection
}
from "../../storage/account-data-client.js";

const conversationRuntime = Object.seal({
  localKey:null,
  saveTimer:null,
  initialized:false,
  messageCounter:0
});

function createConversationId(){
  return "chat-" + Date.now() + "-" + Math.random().toString(36).slice(2,8);
}

function createConversationMessageId(){
  conversationRuntime.messageCounter++;
  return "chatmsg_" + Date.now() + "_" + conversationRuntime.messageCounter;
}

function normalizeOwner(owner){
  return String(owner || "").trim().toLowerCase();
}

function normalizeMessageContent(content){
  const value = String(content || "");
  if(value.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH){
    throw new Error("CHAT_MESSAGE_TOO_LONG");
  }
  return value;
}

function createLocalKey(owner){
  return "rigo_user_" + encodeURIComponent(owner) + "_chat_history_v2";
}

function clone(value){
  if(typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function persistLocal(){
  if(typeof localStorage === "undefined" || !conversationRuntime.localKey) return false;
  try{
    localStorage.setItem(conversationRuntime.localKey,JSON.stringify(ChatState.getStore()));
    return true;
  }
  catch{
    return false;
  }
}

function loadLocal(){
  if(typeof localStorage === "undefined" || !conversationRuntime.localKey) return null;
  try{
    const parsed = JSON.parse(localStorage.getItem(conversationRuntime.localKey) || "null");
    if(!parsed || parsed.owner !== chatState.owner || !Array.isArray(parsed.chats)) return null;
    return parsed;
  }
  catch{
    return null;
  }
}

async function persistRemote(){
  if(!chatState.remoteReady) return false;
  chatState.syncing = true;
  try{
    await saveAccountSection("chats",ChatState.getStore());
    chatState.lastSyncAt = Date.now();
    ChatState.incrementDiagnostic("syncWrites");
    return true;
  }
  catch(error){
    ChatState.incrementDiagnostic("syncFailures");
    throw error;
  }
  finally{
    chatState.syncing = false;
  }
}

function scheduleRemoteSave(){
  if(!chatState.remoteReady) return false;
  clearTimeout(conversationRuntime.saveTimer);
  conversationRuntime.saveTimer = setTimeout(() => {
    persistRemote().catch(() => {});
  },CHAT_TIMERS.SAVE_DEBOUNCE);
  return true;
}

function persistConversationStore(){
  persistLocal();
  scheduleRemoteSave();
  return true;
}

async function initializeConversationStore(owner){
  const normalizedOwner = normalizeOwner(owner);
  if(!normalizedOwner) throw new Error("CHAT_OWNER_REQUIRED");

  ChatState.setOwner(normalizedOwner);
  conversationRuntime.localKey = createLocalKey(normalizedOwner);

  const localStore = loadLocal();
  if(localStore){
    ChatState.replaceConversations(localStore.chats,localStore.activeId);
  }

  try{
    const remoteStore = await loadAccountSection("chats");
    ChatState.incrementDiagnostic("syncReads");

    if(remoteStore && Array.isArray(remoteStore.chats)){
      ChatState.replaceConversations(remoteStore.chats,remoteStore.activeId);
      persistLocal();
    }
    else if(localStore && localStore.chats.length){
      chatState.remoteReady = true;
      await persistRemote();
    }
  }
  catch{
    ChatState.incrementDiagnostic("syncFailures");
  }

  chatState.hydrated = true;
  chatState.remoteReady = true;
  conversationRuntime.initialized = true;
  return getConversationStore();
}

function createConversation(options = {}){
  const conversation = ChatState.addConversation({
    id:options.id || createConversationId(),
    owner:chatState.owner,
    title:String(options.title || ""),
    createdAt:Date.now(),
    updatedAt:Date.now(),
    messages:Array.isArray(options.messages) ? clone(options.messages) : []
  });

  if(!conversation) return null;
  ChatState.setActiveConversation(conversation.id);
  persistConversationStore();
  return conversation;
}

function ensureConversation(){
  return ChatState.getActiveConversation() || createConversation();
}

function activateConversation(conversationId){
  const activated = ChatState.setActiveConversation(conversationId);
  if(activated) persistConversationStore();
  return activated;
}

function renameConversation(conversationId,title){
  const conversation = ChatState.updateConversation(conversationId,{
    title:String(title || "").trim().slice(0,80),
    updatedAt:Date.now()
  });
  if(!conversation) return null;
  ChatState.incrementDiagnostic("conversationsRenamed");
  persistConversationStore();
  return conversation;
}

function deleteConversation(conversationId){
  const removed = ChatState.removeConversation(conversationId);
  if(removed) persistConversationStore();
  return removed;
}

function findMirroredMessage(payload = {}){
  const id = String(payload.id || "").trim();
  if(id){
    const byId = ChatMessageService.get(id);
    if(byId) return byId;
  }

  const role = String(payload.role || "assistant");
  const content = String(payload.content || "");
  const conversationId = payload.conversationId ?? payload.metadata?.conversationId ?? null;

  return ChatMessageService.getAll()
  .slice()
  .reverse()
  .find(message =>
    message.role === role &&
    message.content === content &&
    (message.metadata?.conversationId ?? null) === conversationId
  ) || null;
}

function sendMessage(payload = {}){
  const existing = findMirroredMessage(payload);
  if(existing) return existing;

  const message = ChatMessageService.create({
    ...payload,
    content:normalizeMessageContent(payload.content)
  });

  emit(CHAT_EVENTS.MESSAGE_SENT,structuredClone(message));
  ChatState.incrementDiagnostic("messagesSent");
  return message;
}

function appendConversationMessage(conversationId,message = {}){
  const conversation = ChatState.getConversation(conversationId);
  if(!conversation) return null;

  const nextMessage = {
    id:String(message.id || createConversationMessageId()),
    role:String(message.role || "assistant"),
    content:normalizeMessageContent(message.content),
    createdAt:Number(message.createdAt || Date.now())
  };

  const messages = [...conversation.messages,nextMessage]
  .slice(-CHAT_LIMITS.MAX_MESSAGES);

  const updated = ChatState.updateConversation(conversationId,{
    messages,
    updatedAt:Date.now()
  });

  if(!updated) return null;

  persistConversationStore();
  ChatState.incrementDiagnostic("messagesCreated");

  try{
    sendMessage({
      ...nextMessage,
      userId:chatState.owner,
      conversationId
    });
  }
  catch{
    ChatState.incrementDiagnostic("messagesFailed");
  }

  return updated;
}

function replaceConversationMessages(conversationId,messages = []){
  const normalized = Array.isArray(messages)
    ? messages.slice(-CHAT_LIMITS.MAX_MESSAGES).map(message => ({
        ...clone(message || {}),
        id:String(message?.id || createConversationMessageId()),
        role:String(message?.role || "assistant"),
        content:normalizeMessageContent(message?.content),
        createdAt:Number(message?.createdAt || Date.now())
      }))
    : [];

  const updated = ChatState.updateConversation(conversationId,{
    messages:normalized,
    updatedAt:Date.now()
  });

  if(updated) persistConversationStore();
  return updated;
}

function getConversationStore(){ return ChatState.getStore(); }
function getConversations(){ return ChatState.getConversations(); }
function getActiveConversation(){ return ChatState.getActiveConversation(); }

async function flushConversationStore(){
  persistLocal();
  clearTimeout(conversationRuntime.saveTimer);
  conversationRuntime.saveTimer = null;
  if(chatState.remoteReady) await persistRemote();
  return true;
}

function deleteMessage(messageId){
  return ChatMessageService.delete(messageId);
}

function retryMessage(messageId){
  ChatState.incrementDiagnostic("retries");
  emit(CHAT_EVENTS.MESSAGE_RETRY,{messageId});
  return true;
}

function startGeneration(payload = null){ emit(CHAT_EVENTS.GENERATION_STARTED,payload); return true; }
function completeGeneration(payload = null){ emit(CHAT_EVENTS.GENERATION_COMPLETED,payload); return true; }
function abortGeneration(payload = null){ emit(CHAT_EVENTS.GENERATION_ABORTED,payload); return true; }

function startStream(messageId){ return ChatStreamService.start(messageId); }
function pushChunk(chunk){ return ChatStreamService.pushChunk(chunk); }
function completeStream(){ return ChatStreamService.complete(); }
function abortStream(){ return ChatStreamService.abort(); }

function clearChat(){
  ChatRuntime.reset();
  return true;
}

function getStatus(){
  return Object.freeze({
    runtime:ChatRuntime.status(),
    messages:ChatMessageService.status(),
    queue:ChatQueueService.status(),
    stream:ChatStreamService.status(),
    conversations:{
      initialized:conversationRuntime.initialized,
      hydrated:chatState.hydrated,
      syncing:chatState.syncing,
      count:chatState.conversations.length,
      activeId:chatState.activeConversationId,
      lastSyncAt:chatState.lastSyncAt,
      maxMessages:CHAT_LIMITS.MAX_MESSAGES,
      maxMessageLength:CHAT_LIMITS.MAX_MESSAGE_LENGTH
    }
  });
}

const ChatActions = Object.freeze({
  initializeConversationStore,
  createConversation,
  ensureConversation,
  activateConversation,
  renameConversation,
  deleteConversation,
  appendConversationMessage,
  replaceConversationMessages,
  getConversationStore,
  getConversations,
  getActiveConversation,
  flushConversationStore,
  sendMessage,
  deleteMessage,
  retryMessage,
  startGeneration,
  completeGeneration,
  abortGeneration,
  startStream,
  pushChunk,
  completeStream,
  abortStream,
  clearChat,
  status:getStatus
});

export {
  initializeConversationStore,
  createConversation,
  ensureConversation,
  activateConversation,
  renameConversation,
  deleteConversation,
  appendConversationMessage,
  replaceConversationMessages,
  getConversationStore,
  getConversations,
  getActiveConversation,
  flushConversationStore,
  sendMessage,
  deleteMessage,
  retryMessage,
  startGeneration,
  completeGeneration,
  abortGeneration,
  startStream,
  pushChunk,
  completeStream,
  abortStream,
  clearChat,
  getStatus,
  ChatActions
};

export default ChatActions;
