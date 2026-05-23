// =====================================
// RIGO AI
// SEARCH STATE
// ENTERPRISE ULTRA FINAL
// =====================================



const searchState =
Object.seal({

  initialized:false,

  searching:false,

  lastQuery:null,

  lastSearchAt:null,

  totalSearches:0,

  failedSearches:0,

  cachedHits:0,

  activeSearches:0,

  pendingSearches:0,

  abortedSearches:0,

  averageSearchLatency:0,

  lastSearchLatency:0,

  activeSearchToken:null,

  currentState:
  SEARCH_STATES.IDLE

});
