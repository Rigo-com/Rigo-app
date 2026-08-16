import { SEARCH_EVENTS } from "./search-config.js";
import { emit } from "./search-events.js";
import { SearchState } from "./search-state.js";

function initialize(){
  if(SearchState.snapshot().initialized) return true;
  SearchState.setInitialized(true);
  SearchState.setHealthy(true);
  emit(SEARCH_EVENTS.INITIALIZED);
  return true;
}

function destroy(){
  emit(SEARCH_EVENTS.DESTROYED);
  SearchState.reset();
  return true;
}

function startSearch(query = ""){
  SearchState.incrementActiveSearches();
  SearchState.setSearching(true);
  SearchState.incrementSearches();
  emit(SEARCH_EVENTS.SEARCH_STARTED, { query });
  return true;
}

function finishSearch(){
  SearchState.decrementActiveSearches();
  SearchState.setSearching(SearchState.snapshot().activeSearches > 0);
}

function completeSearch(query = "", results = []){
  finishSearch();
  SearchState.incrementCompleted();
  SearchState.setHealthy(true);
  emit(SEARCH_EVENTS.SEARCH_COMPLETED, { query, results });
  return true;
}

function failSearch(query = "", error = null){
  finishSearch();
  SearchState.incrementFailed();
  SearchState.setHealthy(false);
  emit(SEARCH_EVENTS.SEARCH_FAILED, { query, error });
  return true;
}

function abortSearch(query = ""){
  finishSearch();
  SearchState.incrementAborted();
  emit(SEARCH_EVENTS.SEARCH_ABORTED, { query });
  return true;
}

const health = () => Object.freeze({ ...SearchState.snapshot(), diagnostics:SearchState.diagnostics() });
const SearchCore = Object.freeze({ initialize, destroy, startSearch, completeSearch, failSearch, abortSearch, health });
export { initialize, destroy, startSearch, completeSearch, failSearch, abortSearch, health, SearchCore };
export default SearchCore;
