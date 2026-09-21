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
    if(score > 0) results.push(createSearchResult(item, score, {
      source:"indexed",
      snippet:createSnippet(item?.content, query)
    }));
  }
  return results;
}

async function executeSemanticSearch(query, provider = null, options = {}){
  if(!SEARCH_FEATURES.ENABLE_SEMANTIC_SEARCH || typeof provider !== "function") return [];

  const timeout = Math.max(1, Number(options.timeout) || SEARCH_TIMERS.SEARCH_TIMEOUT);
  const controller = new AbortController();
  const externalSignal = options.signal;
  let timer;
  let removeAbortListener = null;

  if(externalSignal){
    if(externalSignal.aborted) throw new DOMException("Search aborted", "AbortError");

    const forwardAbort = () => controller.abort(externalSignal.reason);
    externalSignal.addEventListener("abort", forwardAbort, { once:true });
    removeAbortListener = () => externalSignal.removeEventListener("abort", forwardAbort);
  }

  try{
    const results = await Promise.race([
      Promise.resolve().then(() => provider(query, { signal:controller.signal })),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("SEARCH_TIMEOUT"));
        }, timeout);
      })
    ]);

    return Array.isArray(results) ? results : [];
  }
  finally {
    clearTimeout(timer);
    removeAbortListener?.();
  }
}

function fuzzySimilarity(a = "", b = ""){
  const left = String(a).toLowerCase().trim();
  const right = String(b).toLowerCase().trim();

  if(!left || !right) return 0;
  if(left === right) return 1;
  if(left.includes(right) || right.includes(left)) return 0.9;

  const previous = Array.from({ length:right.length + 1 }, (_, index) => index);

  for(let i = 1; i <= left.length; i++){
    const current = [i];

    for(let j = 1; j <= right.length; j++){
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
    }

    for(let j = 0; j <= right.length; j++) previous[j] = current[j];
  }

  return 1 - previous[right.length] / Math.max(left.length, right.length);
}

function executeFuzzySearch(query, items = []){
  if(!SEARCH_FEATURES.ENABLE_FUZZY_SEARCH || !isValidQuery(query)) return [];

  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = [];

  for(const item of Array.isArray(items) ? items : []){
    const content = String(item?.content ?? "");
    const words = content.toLowerCase().split(/\s+/).filter(Boolean);
    if(!words.length) continue;

    let total = 0;
    let matched = 0;

    for(const queryWord of queryWords){
      let best = 0;

      for(const word of words){
        best = Math.max(best, fuzzySimilarity(queryWord, word));
      }

      if(best >= 0.72){
        total += best;
        matched++;
      }
    }

    if(matched === queryWords.length){
      const score = Math.round(20 + (total / queryWords.length) * 20);
      results.push(createSearchResult(item, score, {
        source:"fuzzy",
        snippet:createSnippet(content, query)
      }));
    }
  }

  return results;
}

function throwIfAborted(signal){
  if(signal?.aborted) throw new DOMException("Search aborted", "AbortError");
}

async function executeSearch(query, options = {}){
  if(!isValidQuery(query) || query.trim().length > SEARCH_LIMITS.MAX_QUERY_LENGTH) return [];
  if(SearchState.snapshot().activeSearches >= SEARCH_LIMITS.MAX_CONCURRENT_SEARCHES) return [];

  startSearch(query);

  try{
    throwIfAborted(options.signal);

    const cacheKey = createCacheKey(query, {
      items:options.items ?? [],
      limit:options.limit,
      cacheScope:options.cacheScope
    });

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

    const requestedLimit = Number.isFinite(options.limit)
      ? Math.floor(options.limit)
      : SEARCH_LIMITS.MAX_RESULTS;

    const limit = Math.max(
      0,
      Math.min(SEARCH_LIMITS.MAX_RESULTS, requestedLimit)
    );

    results = results.slice(0, limit);

    if(SEARCH_FEATURES.ENABLE_CACHE){
      setCache(cacheKey, structuredClone(results));
    }

    if(SEARCH_FEATURES.ENABLE_HISTORY){
      addHistory(query, { results:results.length });
    }

    completeSearch(query, results);
    return structuredClone(results);
  }
  catch(error){
    if(error?.name === "AbortError"){
      abortSearch(query);
    }
    else{
      failSearch(query, error);
    }

    return [];
  }
}

const SearchEngine = Object.freeze({
  executeIndexedSearch,
  executeSemanticSearch,
  executeFuzzySearch,
  executeSearch
});

export {
  executeIndexedSearch,
  executeSemanticSearch,
  executeFuzzySearch,
  executeSearch,
  SearchEngine
};

export default SearchEngine;
