// =====================================
// RIGO AI
// MEMORY CORE
// CORE MEMORY OPERATIONS
// =====================================

import {MEMORY_EVENTS} from "./memory-constants.js";
import {MEMORY_STATES} from "./memory-types.js";
import {emit} from "./memory-events.js";
import {MemoryState} from "./memory-state.js";
import {createMemoryRecord} from "./memory-utils.js";
import {validateMemoryRecord} from "./memory-validation.js";
import {loadMemories,saveMemories} from "./memory-storage.js";
import {indexMemory,buildIndex} from "./memory-indexing.js";

function hydrateStateFromStorage(){
  const memories=loadMemories();

  MemoryState.clearMemories();

  for(const memory of memories){
    MemoryState.setMemory(memory.id,memory);
  }

  buildIndex();
  return memories.length;
}

function initialize(){
  if(MemoryState.snapshot().initialized)return true;

  MemoryState.setState(MEMORY_STATES.INITIALIZING);
  hydrateStateFromStorage();
  MemoryState.setInitialized(true);
  MemoryState.setState(MEMORY_STATES.READY);
  emit(MEMORY_EVENTS.INITIALIZED);
  return true;
}

function reload(){
  try{
    MemoryState.setState(MEMORY_STATES.INITIALIZING);
    hydrateStateFromStorage();
    MemoryState.setInitialized(true);
    MemoryState.setState(MEMORY_STATES.READY);
    return true;
  }
  catch{
    MemoryState.setState(MEMORY_STATES.READY);
    return false;
  }
}

function createMemory(content,options={}){
  const memory=createMemoryRecord(content,options);
  if(!validateMemoryRecord(memory))return null;

  const memories=loadMemories();
  memories.push(memory);
  if(!saveMemories(memories))return null;
  MemoryState.setMemory(memory.id,memory);
  indexMemory(memory);
  MemoryState.incrementCreated();
  emit(MEMORY_EVENTS.CREATED,memory);
  return memory;
}

function updateMemory(memoryId,updates={}){
  const memories=loadMemories();
  const index=memories.findIndex(memory=>memory.id===memoryId);
  if(index<0)return false;

  memories[index]={...memories[index],...updates,updatedAt:Date.now()};
  if(!saveMemories(memories))return false;
  MemoryState.setMemory(memoryId,memories[index]);
  buildIndex();
  MemoryState.incrementUpdated();
  emit(MEMORY_EVENTS.UPDATED,memories[index]);
  return true;
}

function deleteMemory(memoryId){
  const memories=loadMemories();
  const filtered=memories.filter(memory=>memory.id!==memoryId);
  if(filtered.length===memories.length)return false;
  if(!saveMemories(filtered))return false;
  MemoryState.removeMemory(memoryId);
  buildIndex();
  MemoryState.incrementDeleted();
  emit(MEMORY_EVENTS.REMOVED,{memoryId});
  return true;
}

function health(){
  return Object.freeze({
    ...MemoryState.snapshot(),
    diagnostics:MemoryState.diagnostics()
  });
}

function destroy(){
  MemoryState.reset();
  emit(MEMORY_EVENTS.DESTROYED);
  return true;
}

const MemoryCore=Object.freeze({
  initialize,
  reload,
  createMemory,
  updateMemory,
  deleteMemory,
  health,
  destroy
});

export {
  initialize,
  reload,
  createMemory,
  updateMemory,
  deleteMemory,
  health,
  destroy,
  MemoryCore
};

export default MemoryCore;
