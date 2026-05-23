// =====================================
// RIGO AI
// SEARCH STATE
// ENTERPRISE FINAL
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

  currentState:
  SEARCH_STATES.IDLE

});
