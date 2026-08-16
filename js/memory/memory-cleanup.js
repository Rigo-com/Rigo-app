import { MEMORY_LIMITS } from "./memory-constants.js";
import { loadMemories, saveMemories } from "./memory-storage.js";
import { memoryState } from "./memory-state.js";
import { reload } from "./memory-core.js";

function enforceMemoryLimit(){
  const memories = loadMemories();
  if(memories.length <= MEMORY_LIMITS.MAX_MEMORIES) return false;
  return saveMemories(memories.slice(-MEMORY_LIMITS.MAX_MEMORIES));
}

function cleanupOrphanEmbeddings(){
  const validIds = new Set(loadMemories().map(memory => memory.id));
  let removed = 0;
  for(const id of memoryState.embeddings.keys()) if(!validIds.has(id)){ memoryState.embeddings.delete(id); removed++; }
  return removed;
}

function cleanupOrphanIndexes(){
  const validIds = new Set(loadMemories().map(memory => memory.id));
  const index = memoryState.indexes.get("memory");
  if(!(index instanceof Map)) return 0;
  let removed = 0;
  for(const [token, ids] of index){
    for(const id of [...ids]) if(!validIds.has(id)){ ids.delete(id); removed++; }
    if(!ids.size) index.delete(token);
  }
  return removed;
}

function cleanupEmptyMemories(){
  const memories = loadMemories();
  const filtered = memories.filter(memory => memory?.content && String(memory.content).trim());
  if(filtered.length === memories.length) return 0;
  return saveMemories(filtered) ? memories.length - filtered.length : 0;
}

function cleanupMemorySystem(){
  const removedEmpty = cleanupEmptyMemories();
  const limited = enforceMemoryLimit();
  if(removedEmpty || limited) reload();
  const removedEmbeddings = cleanupOrphanEmbeddings();
  const removedIndexes = cleanupOrphanIndexes();
  return Object.freeze({ removedEmpty, removedEmbeddings, removedIndexes, limited:Boolean(limited) });
}

const MemoryCleanup = Object.freeze({ enforceMemoryLimit, cleanupOrphanEmbeddings, cleanupOrphanIndexes, cleanupEmptyMemories, cleanupMemorySystem });
export { enforceMemoryLimit, cleanupOrphanEmbeddings, cleanupOrphanIndexes, cleanupEmptyMemories, cleanupMemorySystem, MemoryCleanup };
export default MemoryCleanup;
