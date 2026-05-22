// =====================================
// RIGO AI
// MEMORY EMBEDDINGS
// ENTERPRISE INFINITY GOD FINAL
// =====================================



// =====================================
// EMBEDDING CONFIG
// =====================================

const MEMORY_EMBEDDINGS_CONFIG =
Object.freeze({

  ENABLE_EMBEDDINGS:true,

  ENABLE_SEMANTIC_SEARCH:true,

  ENABLE_RELEVANCE_SCORING:true,

  ENABLE_AUTO_LINKING:true,

  ENABLE_VECTOR_CACHE:true,

  VECTOR_DIMENSIONS:128,

  MAX_EMBEDDING_TEXT:
  5000,

  MAX_RELATED_RESULTS:20,

  MIN_SIMILARITY_SCORE:
  0.35,

  MAX_CACHE_SIZE:1000,

  TOKEN_WEIGHT:1.0,

  TITLE_BOOST:2.5,

  TAG_BOOST:2.0,

  SUMMARY_BOOST:1.5,

  CONTENT_BOOST:1.0

});



// =====================================
// EMBEDDING STATE
// =====================================

const memoryEmbeddingsState =
Object.seal({

  initialized:false,

  totalEmbeddings:0,

  generatedEmbeddings:0,

  failedEmbeddings:0,

  similarityCalculations:0,

  vectorCache:
  new Map(),

  embeddingIndex:
  new Map(),

  relationCache:
  new Map(),

  semanticTokens:
  new Map(),

  lastEmbeddingAt:null,

  lastSimilarityAt:null

});



// =====================================
// SEMANTIC DICTIONARY
// =====================================

const MEMORY_SEMANTIC_DICTIONARY =
Object.freeze({

  car:[
    "vehicle",
    "taxi",
    "transport",
    "driving",
    "automobile"
  ],

  ai:[
    "artificial",
    "intelligence",
    "machine",
    "model",
    "assistant"
  ],

  money:[
    "cash",
    "finance",
    "payment",
    "income",
    "profit"
  ],

  bug:[
    "issue",
    "problem",
    "error",
    "crash",
    "failure"
  ],

  user:[
    "client",
    "person",
    "account",
    "member"
  ],

  chat:[
    "conversation",
    "message",
    "dialog",
    "discussion"
  ],

  memory:[
    "context",
    "history",
    "storage",
    "knowledge"
  ]

});



// =====================================
// TOKENIZATION
// =====================================

function tokenizeEmbeddingText(
  text
){

  const normalizedText =
  normalizeMemoryContent(
    text
  )
  .toLowerCase();

  if(!normalizedText){

    return [];
  }

  return [

    ...new Set(

      normalizedText
      .split(/[^a-zA-Z0-9]+/)
      .map((token) => {

        return token.trim();

      })
      .filter((token) => {

        return (
          token &&
          token.length >= 2
        );

      })

    )

  ];

}



// =====================================
// VECTOR CREATION
// =====================================

function createEmptyVector(){

  return new Array(

    MEMORY_EMBEDDINGS_CONFIG
    .VECTOR_DIMENSIONS

  )
  .fill(0);

}



// =====================================
// HASH TOKEN
// =====================================

function hashEmbeddingToken(
  token
){

  let hash = 0;

  for(

    let i = 0;

    i < token.length;

    i++

  ){

    hash =

      (
        hash << 5
      ) -

      hash +

      token.charCodeAt(i);

    hash |= 0;

  }

  return Math.abs(hash);

}



// =====================================
// TOKEN VECTOR INDEX
// =====================================

function getTokenVectorIndex(
  token
){

  return (

    hashEmbeddingToken(
      token
    )

    %

    MEMORY_EMBEDDINGS_CONFIG
    .VECTOR_DIMENSIONS

  );

}



// =====================================
// TOKEN EXPANSION
// =====================================

function expandSemanticTokens(
  tokens = []
){

  const expanded =
  new Set(tokens);

  tokens.forEach((token) => {

    const related =

      MEMORY_SEMANTIC_DICTIONARY[
        token
      ];

    if(
      Array.isArray(
        related
      )
    ){

      related.forEach((item) => {

        expanded.add(item);

      });

    }

  });

  return [

    ...expanded

  ];

}



// =====================================
// NORMALIZE VECTOR
// =====================================

function normalizeVector(
  vector = []
){

  const magnitude =
  Math.sqrt(

    vector.reduce((
      total,
      value
    ) => {

      return (
        total +
        value * value
      );

    },0)

  );

  if(
    magnitude <= 0
  ){

    return vector;

  }

  return vector.map((value) => {

    return (
      value /
      magnitude
    );

  });

}



// =====================================
// CREATE TEXT EMBEDDING
// =====================================

function createTextEmbedding(
  text
){

  try{

    const safeText =
    normalizeMemoryContent(
      text
    )
    .slice(

      0,

      MEMORY_EMBEDDINGS_CONFIG
      .MAX_EMBEDDING_TEXT

    );

    if(!safeText){

      return createEmptyVector();

    }

    const tokens =
    expandSemanticTokens(

      tokenizeEmbeddingText(
        safeText
      )

    );

    const vector =
    createEmptyVector();

    tokens.forEach((token) => {

      const index =
      getTokenVectorIndex(
        token
      );

      vector[index] +=

        MEMORY_EMBEDDINGS_CONFIG
        .TOKEN_WEIGHT;

    });

    memoryEmbeddingsState
    .generatedEmbeddings++;

    memoryEmbeddingsState
    .lastEmbeddingAt =
    Date.now();

    return normalizeVector(
      vector
    );

  }

  catch(error){

    memoryEmbeddingsState
    .failedEmbeddings++;

    return createEmptyVector();

  }

}



// =====================================
// MEMORY EMBEDDING
// =====================================

function createMemoryEmbeddingVector(
  memory
){

  if(!memory){

    return createEmptyVector();

  }

  const weightedText = [

    (
      normalizeMemoryString(
        memory.title
      ) + " "
    )
    .repeat(

      MEMORY_EMBEDDINGS_CONFIG
      .TITLE_BOOST

    ),

    (
      normalizeMemoryString(
        memory.summary
      ) + " "
    )
    .repeat(

      MEMORY_EMBEDDINGS_CONFIG
      .SUMMARY_BOOST

    ),

    (
      Array.isArray(
        memory.tags
      )

      ? memory.tags.join(" ")

      : ""

    ) + " ",

    normalizeMemoryContent(
      memory.content
    )

  ]
  .join(" ");

  const vector =
  createTextEmbedding(
    weightedText
  );

  memoryEmbeddingsState
  .embeddingIndex
  .set(
    memory.id,
    vector
  );

  memoryEmbeddingsState
  .totalEmbeddings++;

  return vector;

}



// =====================================
// COSINE SIMILARITY
// =====================================

function calculateCosineSimilarity(
  vectorA = [],
  vectorB = []
){

  if(

    !Array.isArray(vectorA) ||

    !Array.isArray(vectorB)

  ){

    return 0;

  }

  if(
    vectorA.length !==
    vectorB.length
  ){

    return 0;

  }

  let dotProduct = 0;

  let magnitudeA = 0;

  let magnitudeB = 0;

  for(

    let i = 0;

    i < vectorA.length;

    i++

  ){

    dotProduct +=

      vectorA[i] *
      vectorB[i];

    magnitudeA +=

      vectorA[i] *
      vectorA[i];

    magnitudeB +=

      vectorB[i] *
      vectorB[i];

  }

  magnitudeA =
  Math.sqrt(
    magnitudeA
  );

  magnitudeB =
  Math.sqrt(
    magnitudeB
  );

  if(

    magnitudeA <= 0 ||

    magnitudeB <= 0

  ){

    return 0;

  }

  memoryEmbeddingsState
  .similarityCalculations++;

  memoryEmbeddingsState
  .lastSimilarityAt =
  Date.now();

  return (

    dotProduct /

    (
      magnitudeA *
      magnitudeB
    )

  );

}



// =====================================
// MEMORY SIMILARITY
// =====================================

function calculateMemorySimilarity(
  memoryA,
  memoryB
){

  if(

    !memoryA ||

    !memoryB

  ){

    return 0;

  }

  const vectorA =

    memoryEmbeddingsState
    .embeddingIndex
    .get(
      memoryA.id
    )

    ||

    createMemoryEmbeddingVector(
      memoryA
    );

  const vectorB =

    memoryEmbeddingsState
    .embeddingIndex
    .get(
      memoryB.id
    )

    ||

    createMemoryEmbeddingVector(
      memoryB
    );

  return calculateCosineSimilarity(
    vectorA,
    vectorB
  );

}



// =====================================
// RELATED MEMORIES
// =====================================

function findRelatedMemories(
  memory,
  options = {}
){

  if(!memory){

    return [];
  }

  const limit =
  Math.min(

    Number(
      options.limit
    ) || 10,

    MEMORY_EMBEDDINGS_CONFIG
    .MAX_RELATED_RESULTS

  );

  const related = [];

  memoryState.memories
  .forEach((candidate) => {

    if(
      !candidate ||

      candidate.id ===
      memory.id
    ){

      return;
    }

    const similarity =
    calculateMemorySimilarity(
      memory,
      candidate
    );

    if(

      similarity <

      MEMORY_EMBEDDINGS_CONFIG
      .MIN_SIMILARITY_SCORE

    ){

      return;
    }

    related.push({

      memory:
      candidate,

      similarity

    });

  });

  return related

  .sort((a,b) => {

    return (
      b.similarity -
      a.similarity
    );

  })

  .slice(0,limit);

}



// =====================================
// SEMANTIC SEARCH
// =====================================

function semanticMemorySearch(
  query,
  options = {}
){

  const queryVector =
  createTextEmbedding(
    query
  );

  const results = [];

  memoryState.memories
  .forEach((memory) => {

    const vector =

      memoryEmbeddingsState
      .embeddingIndex
      .get(
        memory.id
      )

      ||

      createMemoryEmbeddingVector(
        memory
      );

    const similarity =
    calculateCosineSimilarity(

      queryVector,
      vector

    );

    if(

      similarity <

      MEMORY_EMBEDDINGS_CONFIG
      .MIN_SIMILARITY_SCORE

    ){

      return;
    }

    results.push({

      memory,

      similarity

    });

  });

  return results

  .sort((a,b) => {

    return (
      b.similarity -
      a.similarity
    );

  });

}



// =====================================
// AUTO LINK MEMORIES
// =====================================

function autoLinkRelatedMemories(){

  const memories =
  memoryState.memories;

  memories.forEach((memory) => {

    const related =
    findRelatedMemories(
      memory,
      {
        limit:5
      }
    );

    memoryEmbeddingsState
    .relationCache
    .set(

      memory.id,

      related.map((item) => {

        return item.memory.id;

      })

    );

  });

  return true;

}



// =====================================
// REBUILD EMBEDDINGS
// =====================================

function rebuildMemoryEmbeddings(){

  memoryEmbeddingsState
  .embeddingIndex
  .clear();

  memoryEmbeddingsState
  .relationCache
  .clear();

  memoryState.memories
  .forEach((memory) => {

    createMemoryEmbeddingVector(
      memory
    );

  });

  autoLinkRelatedMemories();

  return true;

}



// =====================================
// EMBEDDING CACHE
// =====================================

function clearEmbeddingCache(){

  memoryEmbeddingsState
  .vectorCache
  .clear();

  memoryEmbeddingsState
  .relationCache
  .clear();

  return true;

}



// =====================================
// EMBEDDING DIAGNOSTICS
// =====================================

function getMemoryEmbeddingDiagnostics(){

  return {

    initialized:
    memoryEmbeddingsState
    .initialized,

    enabled:
    MEMORY_EMBEDDINGS_CONFIG
    .ENABLE_EMBEDDINGS,

    semanticSearch:

      MEMORY_EMBEDDINGS_CONFIG
      .ENABLE_SEMANTIC_SEARCH,

    totalEmbeddings:

      memoryEmbeddingsState
      .totalEmbeddings,

    generatedEmbeddings:

      memoryEmbeddingsState
      .generatedEmbeddings,

    failedEmbeddings:

      memoryEmbeddingsState
      .failedEmbeddings,

    similarityCalculations:

      memoryEmbeddingsState
      .similarityCalculations,

    indexedVectors:

      memoryEmbeddingsState
      .embeddingIndex
      .size,

    cachedRelations:

      memoryEmbeddingsState
      .relationCache
      .size,

    vectorDimensions:

      MEMORY_EMBEDDINGS_CONFIG
      .VECTOR_DIMENSIONS,

    minSimilarity:

      MEMORY_EMBEDDINGS_CONFIG
      .MIN_SIMILARITY_SCORE,

    lastEmbeddingAt:

      memoryEmbeddingsState
      .lastEmbeddingAt,

    lastSimilarityAt:

      memoryEmbeddingsState
      .lastSimilarityAt

  };

}
