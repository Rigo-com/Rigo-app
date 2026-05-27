// =====================================
// RIGO AI
// MEMORY RANKING
// OPTIMIZED FINAL
// =====================================



// =====================================
// CONFIG
// =====================================

const MEMORY_RANKING_CONFIG =
Object.freeze({

  MAX_SCORE:1000,

  DEFAULT_SCORE:1,

  MAX_RESULTS:500,

  MAX_HISTORY:1000,

  PINNED_BOOST:200,

  RECENT_BOOST:100,

  ACCESS_BOOST:5,

  TITLE_BOOST:120,

  TAG_BOOST:80,

  SUMMARY_BOOST:50,

  CONTENT_BOOST:25,

  EXACT_MATCH_BOOST:250,

  DECAY_PER_DAY:0.25

});



// =====================================
// STATE
// =====================================

const memoryRankingState =
Object.seal({

  rankings:new Map(),

  accessCounts:new Map(),

  rankingHistory:[],

  lastRankAt:null,

  lastRebuildAt:null,

  totalRankings:0,

  failedRankings:0

});



// =====================================
// HELPERS
// =====================================

function normalizeRankingQuery(
  query
){

  return normalizeMemoryContent(
    query
  )
  .toLowerCase()
  .trim();

}



function clampRankingScore(
  score
){

  return Math.max(

    0,

    Math.min(

      MEMORY_RANKING_CONFIG
      .MAX_SCORE,

      Number(score) || 0

    )

  );

}



// =====================================
// HISTORY
// =====================================

function storeRankingHistory(
  memoryId,
  score,
  query = ""
){

  memoryRankingState
  .rankingHistory
  .push({

    memoryId:
    normalizeMemoryString(
      memoryId
    ),

    score:
    clampRankingScore(
      score
    ),

    query:
    normalizeRankingQuery(
      query
    ),

    createdAt:
    Date.now()

  });

  while(

    memoryRankingState
    .rankingHistory
    .length >

    MEMORY_RANKING_CONFIG
    .MAX_HISTORY

  ){

    memoryRankingState
    .rankingHistory
    .shift();

  }

}



// =====================================
// ACCESS TRACKING
// =====================================

function getMemoryAccessCount(
  memoryId
){

  return Number(

    memoryRankingState
    .accessCounts
    .get(
      normalizeMemoryString(
        memoryId
      )
    ) || 0

  );

}



function incrementMemoryAccessCount(
  memoryId
){

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return 0;

  }

  const nextCount =

    getMemoryAccessCount(
      normalizedId
    ) + 1;

  memoryRankingState
  .accessCounts
  .set(
    normalizedId,
    nextCount
  );

  return nextCount;

}



// =====================================
// RECENCY SCORE
// =====================================

function calculateRecencyScore(
  memory
){

  const updatedAt =
  Number(
    memory?.updatedAt
  );

  if(
    !Number.isFinite(
      updatedAt
    )
  ){

    return 0;

  }

  const ageInDays =

    (
      Date.now() -
      updatedAt
    ) / 86400000;

  if(
    ageInDays <= 1
  ){

    return MEMORY_RANKING_CONFIG
    .RECENT_BOOST;

  }

  if(
    ageInDays <= 7
  ){

    return 60;

  }

  if(
    ageInDays <= 30
  ){

    return 25;

  }

  return 0;

}



// =====================================
// PINNED SCORE
// =====================================

function calculatePinnedScore(
  memory
){

  if(
    !memory?.id
  ){

    return 0;

  }

  return memoryState
  ?.tracking
  ?.pinnedMemoryIds
  ?.has(memory.id)

  ? MEMORY_RANKING_CONFIG
    .PINNED_BOOST

  : 0;

}



// =====================================
// ACCESS SCORE
// =====================================

function calculateAccessScore(
  memory
){

  if(!memory?.id){

    return 0;

  }

  const accessCount =
  getMemoryAccessCount(
    memory.id
  );

  return Math.min(

    MEMORY_RANKING_CONFIG
    .ACCESS_BOOST *

    Math.log10(
      accessCount + 1
    ),

    50

  );

}



// =====================================
// DECAY
// =====================================

function calculateDecayPenalty(
  memory
){

  const updatedAt =
  Number(
    memory?.updatedAt
  );

  if(
    !Number.isFinite(
      updatedAt
    )
  ){

    return 0;

  }

  const ageInDays =

    (
      Date.now() -
      updatedAt
    ) / 86400000;

  return (

    ageInDays *

    MEMORY_RANKING_CONFIG
    .DECAY_PER_DAY

  );

}



// =====================================
// RELEVANCE
// =====================================

function calculateRankingRelevance(
  memory,
  query
){

  const normalizedQuery =
  normalizeRankingQuery(
    query
  );

  if(!normalizedQuery){

    return 0;

  }

  let score = 0;

  const title =
  normalizeMemoryContent(
    memory?.title
  )
  .toLowerCase();

  const summary =
  normalizeMemoryContent(
    memory?.summary
  )
  .toLowerCase();

  const content =
  normalizeMemoryContent(
    memory?.content
  )
  .toLowerCase();

  const tags =

    Array.isArray(
      memory?.tags
    )

    ? memory.tags

    : [];



  if(
    title === normalizedQuery
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .EXACT_MATCH_BOOST;

  }



  if(
    title.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .TITLE_BOOST;

  }



  if(
    summary.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .SUMMARY_BOOST;

  }



  if(
    content.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .CONTENT_BOOST;

  }



  tags.forEach((tag) => {

    const normalizedTag =
    normalizeMemoryContent(
      tag
    )
    .toLowerCase();

    if(
      normalizedTag.includes(
        normalizedQuery
      )
    ){

      score +=

        MEMORY_RANKING_CONFIG
        .TAG_BOOST;

    }

  });

  return score;

}



// =====================================
// FINAL SCORE
// =====================================

function calculateMemoryRankingScore(
  memory,
  query = ""
){

  let score =
  MEMORY_RANKING_CONFIG
  .DEFAULT_SCORE;

  score +=
  calculatePinnedScore(
    memory
  );

  score +=
  calculateRecencyScore(
    memory
  );

  score +=
  calculateAccessScore(
    memory
  );

  score +=
  calculateRankingRelevance(
    memory,
    query
  );

  score -=
  calculateDecayPenalty(
    memory
  );

  return clampRankingScore(
    Math.round(score)
  );

}



// =====================================
// STORE RANK
// =====================================

function storeMemoryRank(
  memoryId,
  score
){

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return false;

  }

  memoryRankingState
  .rankings
  .set(

    normalizedId,

    clampRankingScore(
      score
    )

  );

  return true;

}



function getMemoryRank(
  memoryId
){

  return Number(

    memoryRankingState
    .rankings
    .get(
      normalizeMemoryString(
        memoryId
      )
    ) || 0

  );

}



// =====================================
// RANK MEMORY
// =====================================

function rankMemory(
  memory,
  query = ""
){

  try{

    if(
      !memory?.id
    ){

      return 0;

    }

    const score =
    calculateMemoryRankingScore(

      memory,
      query

    );

    storeMemoryRank(
      memory.id,
      score
    );

    storeRankingHistory(
      memory.id,
      score,
      query
    );

    memoryRankingState
    .totalRankings++;

    memoryRankingState
    .lastRankAt =
    Date.now();

    return score;

  }

  catch(error){

    memoryRankingState
    .failedRankings++;

    return 0;

  }

}



// =====================================
// RANK RESULTS
// =====================================

function rankMemoryResults(
  memories = [],
  query = ""
){

  return memories

  .filter((memory) => {

    return (
      memory &&
      memory.id
    );

  })

  .map((memory) => {

    return {

      memory,

      score:
      rankMemory(
        memory,
        query
      )

    };

  })

  .sort((a,b) => {

    return (
      b.score -
      a.score
    );

  })

  .slice(

    0,

    MEMORY_RANKING_CONFIG
    .MAX_RESULTS

  );

}



// =====================================
// REBUILD
// =====================================

function rebuildMemoryRankings(){

  memoryRankingState
  .rankings
  .clear();

  const memories =

    Array.isArray(
      memoryState?.memories
    )

    ? memoryState.memories

    : [];

  memories.forEach((memory) => {

    rankMemory(
      memory
    );

  });

  memoryRankingState
  .lastRebuildAt =
  Date.now();

  return true;

}



// =====================================
// CLEAR
// =====================================

function clearMemoryRankings(){

  memoryRankingState
  .rankings
  .clear();

  memoryRankingState
  .accessCounts
  .clear();

  memoryRankingState
  .rankingHistory = [];

  return true;

}



// =====================================
// TOP MEMORIES
// =====================================

function getTopRankedMemories(
  limit = 10
){

  const safeLimit =
  Math.max(
    1,
    Math.min(
      100,
      Number(limit) || 10
    )
  );

  return (

    Array.isArray(
      memoryState?.memories
    )

    ? memoryState.memories

    : []

  )

  .filter((memory) => {

    return memory?.id;

  })

  .map((memory) => {

    return {

      memory,

      score:
      getMemoryRank(
        memory.id
      )

    };

  })

  .sort((a,b) => {

    return (
      b.score -
      a.score
    );

  })

  .slice(
    0,
    safeLimit
  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemoryRankingDiagnostics(){

  return Object.freeze({

    totalRankings:
    memoryRankingState
    .totalRankings,

    failedRankings:
    memoryRankingState
    .failedRankings,

    rankedMemories:

      memoryRankingState
      .rankings
      .size,

    trackedAccesses:

      memoryRankingState
      .accessCounts
      .size,

    rankingHistory:

      memoryRankingState
      .rankingHistory
      .length,

    lastRankAt:
    memoryRankingState
    .lastRankAt,

    lastRebuildAt:
    memoryRankingState
    .lastRebuildAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const MemoryRanking =
Object.freeze({

  rank:
  rankMemory,

  rankResults:
  rankMemoryResults,

  rebuild:
  rebuildMemoryRankings,

  clear:
  clearMemoryRankings,

  getRank:
  getMemoryRank,

  getTop:
  getTopRankedMemories,

  incrementAccess:
  incrementMemoryAccessCount,

  diagnostics:
  getMemoryRankingDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryRanking =
  MemoryRanking;

}
export default MemoryRanking;

export {

  rankMemory,

  rankMemoryResults,

  rebuildMemoryRankings,

  clearMemoryRankings,

  getMemoryRank,

  getTopRankedMemories,

  incrementMemoryAccessCount,

  getMemoryRankingDiagnostics

};
