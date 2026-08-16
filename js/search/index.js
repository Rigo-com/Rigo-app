export * from "./search-config.js";
export * from "./search-state.js";
export * from "./search-core.js";
export * from "./search-storage.js";
export * from "./search-events.js";
export * from "./search-helpers.js";
export * from "./search-ranking.js";
export * from "./search-engine.js";
export * from "./search-health.js";

import SearchConfig from "./search-config.js";
import SearchState from "./search-state.js";
import SearchCore from "./search-core.js";
import SearchStorage from "./search-storage.js";
import SearchEvents from "./search-events.js";
import SearchHelpers from "./search-helpers.js";
import SearchRanking from "./search-ranking.js";
import SearchEngine from "./search-engine.js";
import SearchHealth from "./search-health.js";

const initialize = () => SearchCore.initialize();
const boot = initialize;
function shutdown(){ SearchStorage.resetStorage(); SearchEvents.clear(); return SearchCore.destroy(); }
function reset(){ shutdown(); return true; }
const snapshot = () => Object.freeze({ ...SearchCore.health(), health:SearchHealth.status(), storage:SearchStorage.getStorageStats(), timestamp:Date.now() });
const search = (query, options = {}) => SearchEngine.executeSearch(query, options);

const Search = Object.freeze({
  id:"search", priority:40,
  config:SearchConfig, state:SearchState, core:SearchCore, storage:SearchStorage,
  events:SearchEvents, helpers:SearchHelpers, ranking:SearchRanking, engine:SearchEngine, health:SearchHealth,
  initialize, boot, shutdown, reset, snapshot, search
});
export { Search };
export default Search;
