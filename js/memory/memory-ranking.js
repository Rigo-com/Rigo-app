// =====================================
// RIGO AI
// MEMORY RANKING
// RANKING LAYER
// =====================================

import {
  loadEmbedding,

  calculateSimilarity
}
from "./memory-embeddings.js";

import {
  createEmbedding
}
from "./memory-embeddings.js";



// =====================================
// SCORE MEMORY
// =====================================

function calculateMemoryScore(

  memory,

  query

){

  if(
    !memory
  ){
    return 0;
  }

  const queryEmbedding =

    createEmbedding(
      query
    );

  const memoryEmbedding =

    loadEmbedding(
      memory.id
    );

  if(
    !memoryEmbedding
  ){
    return 0;
  }

  return calculateSimilarity(

    queryEmbedding,

    memoryEmbedding

  );

}



// =====================================
// SCORE RESULTS
// =====================================

function scoreResults(

  memories = [],

  query = ""

){

  return memories.map(

    memory => ({

      memory,

      score:

      calculateMemoryScore(

        memory,

        query

      )

    })

  );

}



// =====================================
// FILTER SCORES
// =====================================

function filterRankedResults(

  results = [],

  minimumScore = 1

){

  return results.filter(

    result =>

    result.score >=
    minimumScore

  );

}



// =====================================
// SORT SCORES
// =====================================

function sortRankedResults(
  results = []
){

  return [

    ...results

  ]
  .sort(

    (
      a,

      b

    ) =>

      b.score -
      a.score

  );

}



// =====================================
// RANK
// =====================================

function rankMemories(

  memories = [],

  query = ""

){

  const scored =

    scoreResults(

      memories,

      query

    );

  const filtered =

    filterRankedResults(
      scored
    );

  return sortRankedResults(
    filtered
  );

}



// =====================================
// TOP RESULTS
// =====================================

function getTopResults(

  results = [],

  limit = 10

){

  return results.slice(

    0,

    limit

  );

}



// =====================================
// PUBLIC API
// =====================================

const MemoryRanking =
Object.freeze({

  calculateMemoryScore,

  scoreResults,

  filterRankedResults,

  sortRankedResults,

  rankMemories,

  getTopResults

});



// =====================================
// EXPORTS
// =====================================

export {

  calculateMemoryScore,

  scoreResults,

  filterRankedResults,

  sortRankedResults,

  rankMemories,

  getTopResults,

  MemoryRanking

};

export default
MemoryRanking;
