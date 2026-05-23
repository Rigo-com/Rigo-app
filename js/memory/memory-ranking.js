// =====================================
// RIGO AI
// MEMORY RANKING
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// RANKING CONFIG
// =====================================

const MEMORY_RANKING_CONFIG =
Object.freeze({

  ENABLE_DYNAMIC_RANKING:true,

  ENABLE_RECENCY_BOOST:true,

  ENABLE_PINNED_BOOST:true,

  ENABLE_ACCESS_BOOST:true,

  ENABLE_RELEVANCE_BOOST:true,

  ENABLE_DECAY:true,

  MAX_SCORE:1000,

  MIN_SCORE:0,

  DEFAULT_SCORE:1,

  PINNED_BOOST:250,

  RECENT_BOOST:120,

  ACCESS_BOOST:8,

  RELEVANCE_BOOST:150,

  EXACT_MATCH_BOOST:300,

  TITLE_MATCH_BOOST:120,

  TAG_MATCH_BOOST:80,

  CONTENT_MATCH_BOOST:40,

  SUMMARY_MATCH_BOOST:60,

  DECAY_PER_DAY:0.35,

  MAX_ACCESS_COUNT:100000,

  MAX_RANKED_RESULTS:500

});



// =====================================
// RANKING STATE
// =====================================

const memoryRankingState =
Object.seal({

  initialized:false,

  rankings:new Map(),

  accessCounts:new Map(),

  lastRankAt:null,

  lastRebuildAt:null,

  totalRankings:0,

  failedRankings:0

});



// =====================================
// RANK HELPERS
// =====================================

function normalizeRankingQuery(
  query
){

  return normalizeMemoryTextLower(
    query
  );

}



function clampRankingScore(
  score
){

  return clampMemoryNumber(

    score,

    MEMORY_RANKING_CONFIG
    .MIN_SCORE,

    MEMORY_RANKING_CONFIG
    .MAX_SCORE

  );

}



function getMemoryAccessCount(
  memoryId
){

  return safeMemoryNumber(

    memoryRankingState
    .accessCounts
    .get(
      memoryId
    ),

    0

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

  const currentCount =
  getMemoryAccessCount(
    normalizedId
  );

  const nextCount =
  Math.min(

    MEMORY_RANKING_CONFIG
    .MAX_ACCESS_COUNT,

    currentCount + 1

  );

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

  if(

    !MEMORY_RANKING_CONFIG
    .ENABLE_RECENCY_BOOST

  ){

    return 0;

  }

  const updatedAt =
  safeMemoryNumber(
    memory?.updatedAt
  );

  if(
    updatedAt <= 0
  ){

    return 0;

  }

  const ageInDays =

    (
      Date.now() -
      updatedAt
    ) /

    86400000;

  if(
    ageInDays <= 1
  ){

    return (
      MEMORY_RANKING_CONFIG
      .RECENT_BOOST
    );

  }

  if(
    ageInDays <= 7
  ){

    return Math.round(

      MEMORY_RANKING_CONFIG
      .RECENT_BOOST * 0.7

    );

  }

  if(
    ageInDays <= 30
  ){

    return Math.round(

      MEMORY_RANKING_CONFIG
      .RECENT_BOOST * 0.3

    );

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

    !MEMORY_RANKING_CONFIG
    .ENABLE_PINNED_BOOST

  ){

    return 0;

  }

  if(

    memoryState
    .tracking
    .pinnedMemoryIds
    .has(
      memory.id
    )

  ){

    return (
      MEMORY_RANKING_CONFIG
      .PINNED_BOOST
    );

  }

  return 0;

}



// =====================================
// ACCESS SCORE
// =====================================

function calculateAccessScore(
  memory
){

  if(

    !MEMORY_RANKING_CONFIG
    .ENABLE_ACCESS_BOOST

  ){

    return 0;

  }

  const accessCount =
  getMemoryAccessCount(
    memory.id
  );

  if(
    accessCount <= 0
  ){

    return 0;

  }

  return Math.min(

    MEMORY_RANKING_CONFIG
    .ACCESS_BOOST *

    Math.log10(
      accessCount + 1
    ),

    100

  );

}



// =====================================
// DECAY SCORE
// =====================================

function calculateDecayPenalty(
  memory
){

  if(
    !MEMORY_RANKING_CONFIG
    .ENABLE_DECAY
  ){

    return 0;

  }

  const updatedAt =
  safeMemoryNumber(
    memory?.updatedAt
  );

  if(
    updatedAt <= 0
  ){

    return 0;

  }

  const ageInDays =

    (
      Date.now() -
      updatedAt
    ) /

    86400000;

  return (

    ageInDays *

    MEMORY_RANKING_CONFIG
    .DECAY_PER_DAY

  );

}



// =====================================
// QUERY RELEVANCE
// =====================================

function calculateRankingRelevance(
  memory,
  query
){

  const normalizedQuery =
  normalizeRankingQuery(
    query
  );

  if(
    !normalizedQuery
  ){

    return 0;

  }

  let score = 0;

  const title =
  normalizeMemoryTextLower(
    memory.title
  );

  const summary =
  normalizeMemoryTextLower(
    memory.summary
  );

  const content =
  normalizeMemoryTextLower(
    memory.content
  );

  const tags =

    safeMemoryArray(
      memory.tags
    )
    .map((tag) => {

      return normalizeMemoryTextLower(
        tag
      );

    });



  // ===================================
  // EXACT MATCH
  // ===================================

  if(
    title === normalizedQuery
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .EXACT_MATCH_BOOST;

  }



  // ===================================
  // TITLE MATCH
  // ===================================

  if(
    title.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .TITLE_MATCH_BOOST;

  }



  // ===================================
  // SUMMARY MATCH
  // ===================================

  if(
    summary.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .SUMMARY_MATCH_BOOST;

  }



  // ===================================
  // CONTENT MATCH
  // ===================================

  if(
    content.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .CONTENT_MATCH_BOOST;

  }



  // ===================================
  // TAG MATCH
  // ===================================

  tags.forEach((tag) => {

    if(
      tag.includes(
        normalizedQuery
      )
    ){

      score +=

        MEMORY_RANKING_CONFIG
        .TAG_MATCH_BOOST;

    }

  });

  return score;

}



// =====================================
// MEMORY RANK SCORE
// =====================================

function calculateMemoryRank(
  memory,
  query = ""
){

  if(
    !memory
  ){

    return 0;

  }

  let score =
  MEMORY_RANKING_CONFIG
  .DEFAULT_SCORE;



  // ===================================
  // PINNED
  // ===================================

  score +=
  calculatePinnedScore(
    memory
  );



  // ===================================
  // RECENCY
  // ===================================

  score +=
  calculateRecencyScore(
    memory
  );



  // ===================================
  // ACCESS
  // ===================================

  score +=
  calculateAccessScore(
    memory
  );



  // ===================================
  // RELEVANCE
  // ===================================

  score +=
  calculateRankingRelevance(
    memory,
    query
  );



  // ===================================
  // DECAY
  // ===================================

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



// =====================================
// GET RANK
// =====================================

function getMemoryRank(
  memoryId
){

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return 0;

  }

  return safeMemoryNumber(

    memoryRankingState
    .rankings
    .get(
      normalizedId
    ),

    0

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

    if(!memory){

      return 0;

    }

    const score =
    calculateMemoryRank(
      memory,
      query
    );

    storeMemoryRank(
      memory.id,
      score
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

  const rankedResults =

    safeMemoryArray(
      memories
    )
    .map((memory) => {

      return {

        memory,

        score:
        rankMemory(
          memory,
          query
        )

      };

    });

  return rankedResults

  .sort((a,b) => {

    return (
      b.score -
      a.score
    );

  })

  .slice(

    0,

    MEMORY_RANKING_CONFIG
    .MAX_RANKED_RESULTS

  );

}



// =====================================
// REBUILD RANKINGS
// =====================================

function rebuildMemoryRankings(){

  memoryRankingState
  .rankings
  .clear();

  const memories =

    safeMemoryArray(
      memoryState.memories
    );

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
// CLEAR RANKINGS
// =====================================

function clearMemoryRankings(){

  memoryRankingState
  .rankings
  .clear();

  memoryRankingState
  .accessCounts
  .clear();

  return true;

}



// =====================================
// TOP RANKED MEMORIES
// =====================================

function getTopRankedMemories(
  limit = 10
){

  const ranked = [];

  memoryState.memories
  .forEach((memory) => {

    ranked.push({

      memory,

      score:
      getMemoryRank(
        memory.id
      )

    });

  });

  return ranked

  .sort((a,b) => {

    return (
      b.score -
      a.score
    );

  })

  .slice(
    0,
    clampMemoryNumber(
      limit,
      1,
      100
    )
  );

}



// =====================================
// RANKING DIAGNOSTICS
// =====================================

function getMemoryRankingDiagnostics(){

  return {

    initialized:
    memoryRankingState
    .initialized,

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

    lastRankAt:
    memoryRankingState
    .lastRankAt,

    lastRebuildAt:

      memoryRankingState
      .lastRebuildAt

  };

}
