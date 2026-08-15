// =====================================
// RIGO AI
// CHAT ACTIONS
// ORCHESTRATION LAYER
// =====================================

import {
  CHAT_EVENTS
}
from "../chat-config.js";

import {
  emit
}
from "../chat-events/chat-events.js";

import ChatRuntime
from "../chat-runtime/chat-runtime.js";

import ChatMessageService
from "../chat-services/chat-message-service.js";

import ChatQueueService
from "../chat-services/chat-queue-service.js";

import ChatStreamService
from "../chat-services/chat-stream-service.js";

import ChatState,
{
  chatState
}
from "../chat-state/chat-state.js";

import {
  loadAccountSection,
  saveAccountSection
}
from "../../storage/account-data-client.js";


// =====================================
// INTERNAL STATE
// =====================================

const conversationRuntime =
Object.seal({

  localKey:null,
  saveTimer:null,
  initialized:false

});


// =====================================
// HELPERS
// =====================================

function createConversationId(){

  return (
    "chat-" +
    Date.now() +
    "-" +
    Math.random()
    .toString(36)
    .slice(2,8)
  );

}


function normalizeOwner(
  owner
){

  return String(
    owner ||
    ""
  )
  .trim()
  .toLowerCase();

}


function createLocalKey(
  owner
){

  return (
    "rigo_user_" +
    encodeURIComponent(
      owner
    ) +
    "_chat_history_v2"
  );

}


function clone(value){

  if(
    typeof structuredClone ===
    "function"
  ){

    return structuredClone(
      value
    );

  }

  return JSON.parse(
    JSON.stringify(value)
  );

}


function persistLocal(){

  if(
    typeof localStorage ===
    "undefined" ||
    !conversationRuntime.localKey
  ){
    return false;
  }

  try{

    localStorage
    .setItem(
      conversationRuntime.localKey,
      JSON.stringify(
        ChatState.getStore()
      )
    );

    return true;

  }
  catch{
    return false;
  }

}


function loadLocal(){

  if(
    typeof localStorage ===
    "undefined" ||
    !conversationRuntime.localKey
  ){
    return null;
  }

  try{

    const parsed =
    JSON.parse(
      localStorage
      .getItem(
        conversationRuntime.localKey
      ) ||
      "null"
    );

    if(
      !parsed ||
      parsed.owner !==
      chatState.owner ||
      !Array.isArray(
        parsed.chats
      )
    ){
      return null;
    }

    return parsed;

  }
  catch{
    return null;
  }

}


async function persistRemote(){

  if(
    !chatState.remoteReady
  ){
    return false;
  }

  chatState.syncing =
  true;

  try{

    await saveAccountSection(
      "chats",
      ChatState.getStore()
    );

    chatState.lastSyncAt =
    Date.now();

    ChatState
    .incrementDiagnostic(
      "syncWrites"
    );

    return true;

  }
  catch(error){

    ChatState
    .incrementDiagnostic(
      "syncFailures"
    );

    throw error;

  }
  finally{

    chatState.syncing =
    false;

  }

}


function scheduleRemoteSave(){

  if(
    !chatState.remoteReady
  ){
    return false;
  }

  clearTimeout(
    conversationRuntime
    .saveTimer
  );

  conversationRuntime.saveTimer =
  setTimeout(

    () => {

      persistRemote()
      .catch(
        () => {}
      );

    },

    250

  );

  return true;

}


function persistConversationStore(){

  persistLocal();
  scheduleRemoteSave();

  return true;

}


// =====================================
// CONVERSATION STORE INITIALIZATION
// =====================================

async function initializeConversationStore(
  owner
){

  const normalizedOwner =
  normalizeOwner(
    owner
  );

  if(
    !normalizedOwner
  ){

    throw new Error(
      "CHAT_OWNER_REQUIRED"
    );

  }

  ChatState
  .setOwner(
    normalizedOwner
  );

  conversationRuntime.localKey =
  createLocalKey(
    normalizedOwner
  );

  const localStore =
  loadLocal();

  if(
    localStore
  ){

    ChatState
    .replaceConversations(
      localStore.chats,
      localStore.activeId
    );

  }

  try{

    const remoteStore =
    await loadAccountSection(
      "chats"
    );

    ChatState
    .incrementDiagnostic(
      "syncReads"
    );

    if(
      remoteStore &&
      Array.isArray(
        remoteStore.chats
      )
    ){

      ChatState
      .replaceConversations(
        remoteStore.chats,
        remoteStore.activeId
      );

      persistLocal();

    }
    else if(
      localStore &&
      localStore.chats.length
    ){

      chatState.remoteReady =
      true;

      await persistRemote();

    }

  }
  catch{

    ChatState
    .incrementDiagnostic(
      "syncFailures"
    );

  }

  chatState.hydrated =
  true;

  chatState.remoteReady =
  true;

  conversationRuntime.initialized =
  true;

  return getConversationStore();

}


// =====================================
// CONVERSATIONS
// =====================================

function createConversation(
  options = {}
){

  const conversation =
  ChatState
  .addConversation({

    id:
    options.id ||
    createConversationId(),

    owner:
    chatState.owner,

    title:
    String(
      options.title ||
      ""
    ),

    createdAt:
    Date.now(),

    updatedAt:
    Date.now(),

    messages:
    Array.isArray(
      options.messages
    )
      ? clone(
          options.messages
        )
      : []

  });

  if(
    !conversation
  ){
    return null;
  }

  ChatState
  .setActiveConversation(
    conversation.id
  );

  persistConversationStore();

  return conversation;

}


function ensureConversation(){

  const active =
  ChatState
  .getActiveConversation();

  if(
    active
  ){
    return active;
  }

  return createConversation();

}


function activateConversation(
  conversationId
){

  const activated =
  ChatState
  .setActiveConversation(
    conversationId
  );

  if(
    activated
  ){
    persistConversationStore();
  }

  return activated;

}


function renameConversation(
  conversationId,
  title
){

  const nextTitle =
  String(
    title ||
    ""
  )
  .trim()
  .slice(0,80);

  const conversation =
  ChatState
  .updateConversation(
    conversationId,
    {
      title:
      nextTitle,

      updatedAt:
      Date.now()
    }
  );

  if(
    !conversation
  ){
    return null;
  }

  ChatState
  .incrementDiagnostic(
    "conversationsRenamed"
  );

  persistConversationStore();

  return conversation;

}


function deleteConversation(
  conversationId
){

  const removed =
  ChatState
  .removeConversation(
    conversationId
  );

  if(
    removed
  ){
    persistConversationStore();
  }

  return removed;

}


function appendConversationMessage(
  conversationId,
  message = {}
){

  const conversation =
  ChatState
  .getConversation(
    conversationId
  );

  if(
    !conversation
  ){
    return null;
  }

  const nextMessage = {

    role:
    String(
      message.role ||
      "assistant"
    ),

    content:
    String(
      message.content ||
      ""
    ),

    ...(message.id
      ? {
          id:
          String(message.id)
        }
      : {}),

    createdAt:
    Number(
      message.createdAt ||
      Date.now()
    )

  };

  const messages = [
    ...conversation.messages,
    nextMessage
  ];

  const updated =
  ChatState
  .updateConversation(
    conversationId,
    {
      messages,
      updatedAt:
      Date.now()
    }
  );

  if(
    updated
  ){
    persistConversationStore();
  }

  return updated;

}


function replaceConversationMessages(
  conversationId,
  messages = []
){

  const updated =
  ChatState
  .updateConversation(
    conversationId,
    {
      messages:
      Array.isArray(messages)
        ? clone(messages)
        : [],

      updatedAt:
      Date.now()
    }
  );

  if(
    updated
  ){
    persistConversationStore();
  }

  return updated;

}


function getConversationStore(){

  return ChatState
  .getStore();

}


function getConversations(){

  return ChatState
  .getConversations();

}


function getActiveConversation(){

  return ChatState
  .getActiveConversation();

}


async function flushConversationStore(){

  persistLocal();

  clearTimeout(
    conversationRuntime
    .saveTimer
  );

  if(
    chatState.remoteReady
  ){

    await persistRemote();

  }

  return true;

}


// =====================================
// SEND MESSAGE
// =====================================

function sendMessage(
  payload = {}
){

  const message =

    ChatMessageService
    .create(
      payload
    );

  emit(
    CHAT_EVENTS
    .MESSAGE_SENT,
    structuredClone(
      message
    )
  );

  return message;

}


// =====================================
// DELETE MESSAGE
// =====================================

function deleteMessage(
  messageId
){

  return ChatMessageService
  .delete(
    messageId
  );

}


// =====================================
// RETRY MESSAGE
// =====================================

function retryMessage(
  messageId
){

  emit(
    CHAT_EVENTS
    .MESSAGE_RETRY,
    {
      messageId
    }
  );

  return true;

}


// =====================================
// GENERATION
// =====================================

function startGeneration(
  payload = null
){

  emit(
    CHAT_EVENTS
    .GENERATION_STARTED,
    payload
  );

  return true;

}


function completeGeneration(
  payload = null
){

  emit(
    CHAT_EVENTS
    .GENERATION_COMPLETED,
    payload
  );

  return true;

}


function abortGeneration(
  payload = null
){

  emit(
    CHAT_EVENTS
    .GENERATION_ABORTED,
    payload
  );

  return true;

}


// =====================================
// STREAM
// =====================================

function startStream(
  messageId
){

  return ChatStreamService
  .start(
    messageId
  );

}


function pushChunk(
  chunk
){

  return ChatStreamService
  .pushChunk(
    chunk
  );

}


function completeStream(){

  return ChatStreamService
  .complete();

}


function abortStream(){

  return ChatStreamService
  .abort();

}


// =====================================
// CLEAR CHAT
// =====================================

function clearChat(){

  ChatRuntime
  .reset();

  return true;

}


// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    runtime:
    ChatRuntime
    .status(),

    messages:
    ChatMessageService
    .status(),

    queue:
    ChatQueueService
    .status(),

    stream:
    ChatStreamService
    .status(),

    conversations:{

      initialized:
      conversationRuntime.initialized,

      hydrated:
      chatState.hydrated,

      syncing:
      chatState.syncing,

      count:
      chatState
      .conversations
      .length,

      activeId:
      chatState
      .activeConversationId,

      lastSyncAt:
      chatState
      .lastSyncAt

    }

  });

}


// =====================================
// PUBLIC API
// =====================================

const ChatActions =
Object.freeze({

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

  status:
  getStatus

});


// =====================================
// EXPORTS
// =====================================

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

export default
ChatActions;
