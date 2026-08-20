// =====================================
// RIGO AI
// CHAT STATE
// FOUNDATION STATE LAYER
// =====================================

import {
  CHAT_FEATURES,
  CHAT_LIMITS
}
from "../chat-config.js";

const chatState = Object.seal({
  initialized:false,
  initializing:false,
  destroyed:false,
  generating:false,
  processing:false,
  rendering:false,
  syncing:false,
  owner:null,
  hydrated:false,
  remoteReady:false,
  lastSyncAt:null,
  activeConversationId:null,
  activeMessageId:null,
  lastMessageId:null,
  conversations:[],
  diagnostics:Object.seal({
    messagesCreated:0,
    messagesSent:0,
    messagesFailed:0,
    conversationsCreated:0,
    conversationsRenamed:0,
    conversationsDeleted:0,
    syncReads:0,
    syncWrites:0,
    syncFailures:0,
    retries:0,
    resets:0,
    renders:0
  })
});

function clone(value){
  if(typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function createSnapshot(){
  return clone(chatState);
}

function normalizeMessages(messages = []){
  if(!Array.isArray(messages)) return [];

  return messages
  .slice(-CHAT_LIMITS.MAX_MESSAGES)
  .map(message => ({
    ...clone(message || {}),
    role:String(message?.role || "assistant"),
    content:String(message?.content || "").slice(0,CHAT_LIMITS.MAX_MESSAGE_LENGTH)
  }));
}

function normalizeConversation(conversation = {}){
  return {
    id:String(conversation.id || ""),
    owner:String(conversation.owner || chatState.owner || ""),
    title:String(conversation.title || ""),
    createdAt:Number(conversation.createdAt || Date.now()),
    updatedAt:Number(conversation.updatedAt || conversation.createdAt || Date.now()),
    messages:normalizeMessages(conversation.messages)
  };
}

function sortConversations(){
  chatState.conversations.sort((a,b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  return true;
}

function getChatState(){ return chatState; }
function getChatSnapshot(){ return Object.freeze(createSnapshot()); }

function updateChatState(updates = {}){
  if(!updates || typeof updates !== "object") return false;
  const safeUpdates = {...updates};
  if("conversations" in safeUpdates) delete safeUpdates.conversations;
  Object.assign(chatState,safeUpdates);
  return true;
}

function setOwner(owner){
  const normalized = String(owner || "").trim().toLowerCase();
  chatState.owner = normalized || null;
  return chatState.owner;
}

function replaceConversations(conversations = [],activeConversationId = null){
  chatState.conversations = Array.isArray(conversations)
    ? conversations.map(normalizeConversation).filter(conversation => Boolean(conversation.id))
    : [];

  sortConversations();

  const requestedId = String(activeConversationId || "");
  chatState.activeConversationId = chatState.conversations.some(c => c.id === requestedId)
    ? requestedId
    : chatState.conversations[0]?.id || null;

  return getConversations();
}

function getConversations(){
  return chatState.conversations.map(clone);
}

function getConversation(conversationId){
  const conversation = chatState.conversations.find(item => item.id === conversationId);
  return conversation ? clone(conversation) : null;
}

function getActiveConversation(){
  return getConversation(chatState.activeConversationId);
}

function addConversation(conversation){
  const normalized = normalizeConversation(conversation);
  if(!normalized.id || chatState.conversations.some(item => item.id === normalized.id)) return null;
  chatState.conversations.push(normalized);
  sortConversations();
  chatState.diagnostics.conversationsCreated++;
  return clone(normalized);
}

function updateConversation(conversationId,updates = {}){
  const index = chatState.conversations.findIndex(item => item.id === conversationId);
  if(index < 0) return null;

  const current = chatState.conversations[index];
  const next = normalizeConversation({
    ...current,
    ...updates,
    id:current.id,
    owner:current.owner || chatState.owner,
    createdAt:current.createdAt,
    updatedAt:Number(updates.updatedAt || Date.now())
  });

  chatState.conversations[index] = next;
  sortConversations();
  return clone(next);
}

function removeConversation(conversationId){
  const index = chatState.conversations.findIndex(item => item.id === conversationId);
  if(index < 0) return false;

  chatState.conversations.splice(index,1);
  if(chatState.activeConversationId === conversationId){
    chatState.activeConversationId = chatState.conversations[0]?.id || null;
  }
  chatState.diagnostics.conversationsDeleted++;
  return true;
}

function setActiveConversation(conversationId){
  if(conversationId === null){
    chatState.activeConversationId = null;
    return true;
  }
  if(!chatState.conversations.some(c => c.id === conversationId)) return false;
  chatState.activeConversationId = conversationId;
  return true;
}

function getConversationStore(){
  return Object.freeze({
    owner:chatState.owner,
    activeId:chatState.activeConversationId,
    chats:getConversations()
  });
}

function incrementDiagnostic(key){
  if(!Object.prototype.hasOwnProperty.call(chatState.diagnostics,key)) return false;
  chatState.diagnostics[key]++;
  return true;
}

function resetChatDiagnostics(){
  for(const key of Object.keys(chatState.diagnostics)) chatState.diagnostics[key] = 0;
  return true;
}

function resetChatState(){
  chatState.initialized = false;
  chatState.initializing = false;
  chatState.destroyed = false;
  chatState.generating = false;
  chatState.processing = false;
  chatState.rendering = false;
  chatState.syncing = false;
  chatState.owner = null;
  chatState.hydrated = false;
  chatState.remoteReady = false;
  chatState.lastSyncAt = null;
  chatState.activeConversationId = null;
  chatState.activeMessageId = null;
  chatState.lastMessageId = null;
  chatState.conversations.splice(0,chatState.conversations.length);
  resetChatDiagnostics();
  if(CHAT_FEATURES.ENABLE_DIAGNOSTICS) chatState.diagnostics.resets++;
  return true;
}

const ChatState = Object.freeze({
  get:getChatState,
  snapshot:getChatSnapshot,
  update:updateChatState,
  reset:resetChatState,
  resetDiagnostics:resetChatDiagnostics,
  setOwner,
  replaceConversations,
  getConversations,
  getConversation,
  getActiveConversation,
  addConversation,
  updateConversation,
  removeConversation,
  setActiveConversation,
  getStore:getConversationStore,
  incrementDiagnostic
});

export {
  chatState,
  getChatState,
  getChatSnapshot,
  updateChatState,
  resetChatState,
  resetChatDiagnostics,
  setOwner,
  replaceConversations,
  getConversations,
  getConversation,
  getActiveConversation,
  addConversation,
  updateConversation,
  removeConversation,
  setActiveConversation,
  getConversationStore,
  incrementDiagnostic,
  ChatState
};

export default ChatState;
