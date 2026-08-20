// =====================================
// RIGO AI
// CHAT QUEUE SERVICE
// =====================================

import {
  enqueueItem,
  dequeueItem,
  removeQueueItem,
  getQueueItem,
  getQueueItems,
  hasQueueItem,
  getQueueSize,
  isQueueEmpty,
  clearQueue,
  setQueueProcessing,
  setQueuePaused,
  setActiveQueueItem,
  incrementEnqueued,
  incrementDequeued,
  incrementCompleted,
  incrementFailed,
  incrementCleared,
  getChatQueueSnapshot,
  resetChatQueueState
}
from "../chat-state/chat-queue-state.js";

import { emit }
from "../chat-events/chat-events.js";

import { CHAT_EVENTS }
from "../chat-config.js";

const serviceState = Object.seal({
  initialized:false,
  activeItem:null
});

let queueCounter = 0;

function createQueueItemId(){
  queueCounter++;
  return "queue_" + Date.now() + "_" + queueCounter;
}

function initialize(){
  if(serviceState.initialized) return true;
  serviceState.initialized = true;
  return true;
}

function destroy(){
  reset();
  serviceState.initialized = false;
  return true;
}

function reset(){
  queueCounter = 0;
  serviceState.activeItem = null;
  resetChatQueueState();
  return true;
}

function enqueue(payload = {}){
  const item = {
    id:createQueueItemId(),
    type:String(payload.type || "default"),
    data:payload.data ?? null,
    createdAt:Date.now()
  };

  if(!enqueueItem(item)) return null;
  incrementEnqueued();
  emit(CHAT_EVENTS.QUEUE_ENQUEUED, structuredClone(item));
  return structuredClone(item);
}

function dequeue(){
  const item = dequeueItem();
  if(!item) return null;

  serviceState.activeItem = structuredClone(item);
  setActiveQueueItem(item.id);
  incrementDequeued();
  emit(CHAT_EVENTS.QUEUE_DEQUEUED, structuredClone(item));
  return structuredClone(item);
}

function remove(itemId){
  if(serviceState.activeItem?.id === itemId){
    serviceState.activeItem = null;
    setActiveQueueItem(null);
    return true;
  }
  if(!hasQueueItem(itemId)) return false;
  return removeQueueItem(itemId);
}

function resolveTrackedItem(itemId){
  if(serviceState.activeItem?.id === itemId){
    return serviceState.activeItem;
  }
  return getQueueItem(itemId);
}

function complete(itemId){
  const item = resolveTrackedItem(itemId);
  if(!item) return false;

  incrementCompleted();
  emit(CHAT_EVENTS.QUEUE_COMPLETED, structuredClone(item));

  if(serviceState.activeItem?.id === itemId){
    serviceState.activeItem = null;
    setActiveQueueItem(null);
  }
  else{
    removeQueueItem(itemId);
  }

  return true;
}

function fail(itemId){
  const item = resolveTrackedItem(itemId);
  if(!item) return false;

  incrementFailed();
  emit(CHAT_EVENTS.QUEUE_FAILED, structuredClone(item));

  if(serviceState.activeItem?.id === itemId){
    serviceState.activeItem = null;
    setActiveQueueItem(null);
  }
  else{
    removeQueueItem(itemId);
  }

  return true;
}

function pause(){
  setQueuePaused(true);
  return true;
}

function resume(){
  setQueuePaused(false);
  return true;
}

function clear(){
  clearQueue();
  serviceState.activeItem = null;
  incrementCleared();
  emit(CHAT_EVENTS.QUEUE_CLEARED);
  return true;
}

function startProcessing(){
  setQueueProcessing(true);
  emit(CHAT_EVENTS.QUEUE_STARTED);
  return true;
}

function stopProcessing(){
  setQueueProcessing(false);
  serviceState.activeItem = null;
  setActiveQueueItem(null);
  return true;
}

function get(itemId){
  const item = resolveTrackedItem(itemId);
  return item ? structuredClone(item) : null;
}

function getAll(){
  const items = getQueueItems().map(item => structuredClone(item));
  if(serviceState.activeItem){
    items.unshift(structuredClone(serviceState.activeItem));
  }
  return items;
}

function getStatus(){
  return Object.freeze({
    initialized:serviceState.initialized,
    size:getQueueSize(),
    empty:isQueueEmpty(),
    activeItemId:serviceState.activeItem?.id || null
  });
}

function getSnapshot(){
  return Object.freeze({
    ...getChatQueueSnapshot(),
    activeItem:serviceState.activeItem
      ? structuredClone(serviceState.activeItem)
      : null
  });
}

const ChatQueueService = Object.freeze({
  initialize,
  destroy,
  reset,
  status:getStatus,
  snapshot:getSnapshot,
  enqueue,
  dequeue,
  remove,
  complete,
  fail,
  pause,
  resume,
  clear,
  startProcessing,
  stopProcessing,
  get,
  getAll
});

export {
  initialize,
  destroy,
  reset,
  enqueue,
  dequeue,
  remove,
  complete,
  fail,
  pause,
  resume,
  clear,
  startProcessing,
  stopProcessing,
  get,
  getAll,
  getStatus,
  getSnapshot,
  ChatQueueService
};

export default ChatQueueService;
