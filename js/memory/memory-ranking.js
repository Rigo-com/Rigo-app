// =====================================
// RIGO AI
// MEMORY RANKING
// ENTERPRISE INFINITY ULTRA FINAL
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

  ENABLE_SEMANTIC_RANKING:true,

  ENABLE_BEHAVIOR_LEARNING:true,

  ENABLE_HYBRID_RANKING:true,

  ENABLE_CONTEXTUAL_SCORING:true,

  ENABLE_WORKER_PREPARATION:true,

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

  SEMANTIC_MATCH_BOOST:180,

  CONTEXT_MATCH_BOOST:90,

  LEARNING_BOOST:70,

  DECAY_PER_DAY:0.35,

  MAX_ACCESS_COUNT:100000,

  MAX_RANKED_RESULTS:500,

  MAX_BEHAVIOR_HISTORY:5000

});



// =====================================
// RANKING STATE
// =====================================

const memoryRankingState =
Object.seal({

  initialized:false,

  rankings:new Map(),

  semanticScores:new Map(),

  contextualScores:new Map(),

  accessCounts:new Map(),

  behaviorScores:new Map(),

  rankingHistory:[],

  workerQueue:[],

  lastRankAt:null,

  lastRebuildAt:null,

  totalRankings:0,

  failedRankings:0

});



// =====================================
// QUERY HELPERS
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



// =====================================
// ACCESS TRACKING
// =====================================

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
// DECAY PENALTY
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
// SEMANTIC TOKEN SIMILARITY
// =====================================

function calculateSemanticSimilarity(
  memory,
  query
){

  if(

    !MEMORY_RANKING_CONFIG
    .ENABLE_SEMANTIC_RANKING

  ){

    return 0;

  }

  const queryTokens =
  tokenizeMemoryText(
    query
  );

  if(
    queryTokens.length <= 0
  ){

    return 0;

  }

  const memoryTokens =
  tokenizeMemoryText(

    [

      memory.title,

      memory.summary,

      memory.content,

      ...safeMemoryArray(
        memory.tags
      )

    ]
    .join(" ")

  );

  if(
    memoryTokens.length <= 0
  ){

    return 0;

  }

  let matches = 0;

  queryTokens.forEach((token) => {

    if(
      memoryTokens.includes(
        token
      )
    ){

      matches++;

    }

  });

  const similarity =

    matches /

    queryTokens.length;

  return Math.round(

    similarity *

    MEMORY_RANKING_CONFIG
    .SEMANTIC_MATCH_BOOST

  );

}



// =====================================
// CONTEXTUAL SCORE
// =====================================

function calculateContextualScore(
  memory,
  context = {}
){

  if(

    !MEMORY_RANKING_CONFIG
    .ENABLE_CONTEXTUAL_SCORING

  ){

    return 0;

  }

  let score = 0;

  if(
    context.activeCategory
  ){

    if(

      normalizeMemoryString(
        memory.category
      )

      ===

      normalizeMemoryString(
        context.activeCategory
      )

    ){

      score +=

        MEMORY_RANKING_CONFIG
        .CONTEXT_MATCH_BOOST;

    }

  }

  if(
    context.activeType
  ){

    if(

      normalizeMemoryString(
        memory.type
      )

      ===

      normalizeMemoryString(
        context.activeType
      )

    ){

      score += 40;

    }

  }

  return score;

}



// =====================================
// LEARNING SCORE
// =====================================

function calculateBehaviorLearningScore(
  memory
){

  if(

    !MEMORY_RANKING_CONFIG
    .ENABLE_BEHAVIOR_LEARNING

  ){

    return 0;

  }

  const behaviorScore =
  safeMemoryNumber(

    memoryRankingState
    .behaviorScores
    .get(
      memory.id
    ),

    0

  );

  return Math.min(

    behaviorScore,

    MEMORY_RANKING_CONFIG
    .LEARNING_BOOST

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
      .TITLE_MATCH_BOOST;

  }

  if(
    summary.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .SUMMARY_MATCH_BOOST;

  }

  if(
    content.includes(
      normalizedQuery
    )
  ){

    score +=

      MEMORY_RANKING_CONFIG
      .CONTENT_MATCH_BOOST;

  }

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
// HYBRID SCORE
// =====================================

function calculateHybridRankingScore(
  memory,
  query,
  context = {}
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

  score +=
  calculateSemanticSimilarity(
    memory,
    query
  );

  score +=
  calculateContextualScore(
    memory,
    context
  );

  score +=
  calculateBehaviorLearningScore(
    memory
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
// RANK STORAGE
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
// LEARNING ENGINE
// =====================================

function learnMemoryBehavior(
  memoryId,
  weight = 1
){

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return false;

  }

  const current =
  safeMemoryNumber(

    memoryRankingState
    .behaviorScores
    .get(
      normalizedId
    ),

    0

  );

  memoryRankingState
  .behaviorScores
  .set(

    normalizedId,

    current + weight

  );

  return true;

}



// =====================================
// WORKER QUEUE
// =====================================

function enqueueRankingTask(
  task
){

  memoryRankingState
  .workerQueue
  .push({

    id:createMemoryId(),

    createdAt:
    Date.now(),

    task

  });

  return true;

}



// =====================================
// RANK MEMORY
// =====================================

function rankMemory(
  memory,
  query = "",
  context = {}
){

  try{

    if(!memory){

      return 0;

    }

    const score =
    calculateHybridRankingScore(

      memory,
      query,
      context

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
  query = "",
  context = {}
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
          query,
          context

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
  .semanticScores
  .clear();

  memoryRankingState
  .contextualScores
  .clear();

  memoryRankingState
  .accessCounts
  .clear();

  memoryRankingState
  .behaviorScores
  .clear();

  memoryRankingState
  .workerQueue = [];

  return true;

}



// =====================================
// TOP MEMORIES
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

    semanticScores:

      memoryRankingState
      .semanticScores
      .size,

    contextualScores:

      memoryRankingState
      .contextualScores
      .size,

    trackedAccesses:

      memoryRankingState
      .accessCounts
      .size,

    learnedBehaviors:

      memoryRankingState
      .behaviorScores
      .size,

    queuedWorkerTasks:

      memoryRankingState
      .workerQueue
      .length,

    lastRankAt:
    memoryRankingState
    .lastRankAt,

    lastRebuildAt:

      memoryRankingState
      .lastRebuildAt

  };

}
