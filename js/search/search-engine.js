import { startSearch, completeSearch, failSearch, abortSearch } from "./search-core.js";
import { SearchState } from "./search-state.js";
import { getCache, setCache, addHistory } from "./search-storage.js";
import { SEARCH_EVENTS, SEARCH_FEATURES, SEARCH_LIMITS, SEARCH_TIMERS } from "./search-config.js";
import { emit } from "./search-events.js";
import { createCacheKey, createSearchResult, createSnippet, isValidQuery } from "./search-helpers.js";
import { calculateScore, filterResults, rankResults } from "./search-ranking.js";

function executeIndexedSearch(query, items = []){
  const results = [];
  for(const item of Array.isArray(items) ? items : []){
    const score = calculateScore(item?.content ?? "", query);
    if(score > 0) results.push(createSearchResult(item, score, { source:"indexed", snippet:createSnippet(item?.content, query) }));
  }
  return results;
}

async function executeSemanticSearch(query, provider = null, options = {}){
  if(!SEARCH_FEATURES.ENABLE_SEMANTIC_SEARCH || typeof provider !== "function") return [];
  const timeout = Math.max(1, Number(options.timeout) || SEARCH_TIMERS.SEARCH_TIMEOUT);
  let timer;
  try{
    const results = await Promise.race([
      Promise.resolve().then(() => provider(query, { signal:options.signal })),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("SEARCH_TIMEOUT")), timeout); })
    ]);
    return Array.isArray(results) ? results : [];
  }
  finally { clearTimeout(timer); }
}

function executeFuzzySearch(){ return []; }
function throwIfAborted(signal){ if(signal?.aborted) throw new DOMException("Search aborted", "AbortError"); }

async function executeSearch(query, options = {}){
  if(!isValidQuery(query) || query.trim().length > SEARCH_LIMITS.MAX_QUERY_LENGTH) return [];
  if(SearchState.snapshot().activeSearches >= SEARCH_LIMITS.MAX_CONCURRENT_SEARCHES) return [];
  startSearch(query);
  try{
    throwIfAborted(options.signal);
    const cacheKey = createCacheKey(query, { items:options.items ?? [], limit:options.limit });
    if(SEARCH_FEATURES.ENABLE_CACHE){
      const cached = getCache(cacheKey);
      if(cached !== null){
        SearchState.incrementCacheHits();
        emit(SEARCH_EVENTS.CACHE_HIT, { query });
        completeSearch(query, cached);
        return structuredClone(cached);
      }
      SearchState.incrementCacheMisses();
      emit(SEARCH_EVENTS.CACHE_MISS, { query });
    }
    let results = [
      ...executeIndexedSearch(query, options.items),
      ...await executeSemanticSearch(query, options.semanticProvider, options),
      ...executeFuzzySearch(query, options.items)
    ];
    throwIfAborted(options.signal);
    results = rankResults(filterResults(results));
    const requestedLimit = Number.isFinite(options.limit) ? Math.floor(options.limit) : SEARCH_LIMITS.MAX_RESULTS;
    const limit = Math.max(0, Math.min(SEARCH_LIMITS.MAX_RESULTS, requestedLimit));
    results = results.slice(0, limit);
    if(SEARCH_FEATURES.ENABLE_CACHE) setCache(cacheKey, structuredClone(results));
    if(SEARCH_FEATURES.ENABLE_HISTORY) addHistory(query, { results:results.length });
    completeSearch(query, results);
    return structuredClone(results);
  }
  catch(error){
    if(error?.name === "AbortError") abortSearch(query); else failSearch(query, error);
    return [];
  }
}

const SearchEngine = Object.freeze({ executeIndexedSearch, executeSemanticSearch, executeFuzzySearch, executeSearch });
export { executeIndexedSearch, executeSemanticSearch, executeFuzzySearch, executeSearch, SearchEngine };
export default SearchEngine;
