import { MemoryCore } from "./memory-core.js";
import { MemorySearch } from "./memory-search.js";
import { MemoryContext } from "./memory-context.js";
import { MemorySummary } from "./memory-summary.js";
import { MemorySubsystem } from "./memory-subsystem.js";
import { MemoryDebug } from "./memory-debug.js";
import { MemorySyncCloud } from "./memory-sync-cloud.js";

const initialize = () => MemorySubsystem.initialize();
const boot = initialize;
const shutdown = () => MemorySubsystem.shutdown();
async function reset(){ await MemorySubsystem.shutdown({ preserveCloudProvider:true }); return MemorySubsystem.initialize(); }
const create = (content, options = {}) => MemoryCore.createMemory(content, options);
const update = (memoryId, updates) => MemoryCore.updateMemory(memoryId, updates);
const remove = memoryId => MemoryCore.deleteMemory(memoryId);
const search = (query, options = {}) => MemorySearch.searchMemories(query, options);
const searchOne = query => MemorySearch.searchMemory(query);
const addContext = item => MemoryContext.addContextItem(item);
const removeContext = id => MemoryContext.removeContextItem(id);
const getContext = () => MemoryContext.getContextItems();
const clearContext = () => MemoryContext.clearContext();
const summary = () => MemorySummary.createGlobalSummary();
const maintenance = () => MemorySubsystem.maintenance();
const sync = provider => MemorySyncCloud.syncToCloud(provider);
const restore = provider => MemorySyncCloud.restoreFromCloud(provider);
const configureSync = provider => MemorySubsystem.configureCloudSync(provider);
const health = () => MemorySubsystem.status();
const debug = () => MemoryDebug.getDebugSnapshot();
const snapshot = health;

const MemoryManager = Object.freeze({
  id:"memory", priority:30,
  initialize, boot, shutdown, reset,
  create, update, remove, search, searchOne,
  addContext, removeContext, getContext, clearContext,
  summary, maintenance, sync, restore, configureSync,
  health, debug, snapshot
});
export { initialize, boot, shutdown, reset, create, update, remove, search, searchOne, addContext, removeContext, getContext, clearContext, summary, maintenance, sync, restore, configureSync, health, debug, snapshot, MemoryManager };
export default MemoryManager;
