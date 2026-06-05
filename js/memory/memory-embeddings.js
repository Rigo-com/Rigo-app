// =====================================
// RIGO AI
// MEMORY EMBEDDINGS
// EMBEDDING MANAGEMENT LAYER
// =====================================

import {
  setEmbedding,
  getEmbedding
}
from "./memory-state.js";

import {
  normalizeText,
  tokenizeText
}
from "./memory-utils.js";



// =====================================
// CREATE EMBEDDING
// =====================================

function createEmbedding(
  content = ""
){

  const normalized =

    normalizeText(
      content
    );

  const tokens =

    tokenizeText(
      normalized
    );

  const frequencies =
  {};

  for(
    const token
    of tokens
  ){

    frequencies[token] =

      (
        frequencies[token]
        ?? 0
      )

      + 1;

  }

  return frequencies;

}



// =====================================
// STORE EMBEDDING
// =====================================

function storeEmbedding(

  memoryId,

  embedding

){

  return setEmbedding(

    memoryId,

    embedding

  );

}



// =====================================
// LOAD EMBEDDING
// =====================================

function loadEmbedding(
  memoryId
){

  return getEmbedding(
    memoryId
  );

}



// =====================================
// CREATE & STORE
// =====================================

function generateEmbedding(

  memoryId,

  content

){

  const embedding =

    createEmbedding(
      content
    );

  storeEmbedding(

    memoryId,

    embedding

  );

  return embedding;

}



// =====================================
// SIMILARITY
// =====================================

function calculateSimilarity(

  embeddingA,

  embeddingB

){

  if(
    !embeddingA
    ||
    !embeddingB
  ){

    return 0;

  }

  let score = 0;

  const keys =
  new Set([

    ...Object.keys(
      embeddingA
    ),

    ...Object.keys(
      embeddingB
    )

  ]);

  for(
    const key
    of keys
  ){

    const valueA =

      embeddingA[key]
      ?? 0;

    const valueB =

      embeddingB[key]
      ?? 0;

    score +=

      Math.min(

        valueA,

        valueB

      );

  }

  return score;

}



// =====================================
// COMPARE CONTENT
// =====================================

function compareContent(

  contentA,

  contentB

){

  const embeddingA =

    createEmbedding(
      contentA
    );

  const embeddingB =

    createEmbedding(
      contentB
    );

  return calculateSimilarity(

    embeddingA,

    embeddingB

  );

}



// =====================================
// EMBEDDING STATS
// =====================================

function getEmbeddingStats(
  embedding
){

  if(
    !embedding
  ){

    return {

      tokens:0

    };

  }

  return {

    tokens:

    Object.keys(
      embedding
    )
    .length

  };

}



// =====================================
// PUBLIC API
// =====================================

const MemoryEmbeddings =
Object.freeze({

  createEmbedding,

  storeEmbedding,

  loadEmbedding,

  generateEmbedding,

  calculateSimilarity,

  compareContent,

  getEmbeddingStats

});



// =====================================
// EXPORTS
// =====================================

export {

  createEmbedding,

  storeEmbedding,

  loadEmbedding,

  generateEmbedding,

  calculateSimilarity,

  compareContent,

  getEmbeddingStats,

  MemoryEmbeddings

};

export default
MemoryEmbeddings;
