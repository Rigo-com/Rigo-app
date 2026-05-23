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

  ENABLE_INCREMENTAL_REBUILD:true,

  ENABLE_PERSISTENCE_CACHE:true,

  ENABLE_ADAPTIVE_LEARNING:true,

  ENABLE_MULTI_STAGE_SEARCH:true,

  VECTOR_DIMENSIONS:384,

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
// STORAGE KEYS
// =====================================

const MEMORY_EMBEDDING_STORAGE_KEY =
"rigo_memory_embeddings";



// =====================================
// EMBEDDING STATE
// =====================================

const memoryEmbeddingsState =
Object.seal({

  initialized:false,

  workerEnabled:false,

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

  learnedAssociations:
  new Map(),

  dirtyEmbeddings:
  new Set(),

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
// VECTOR HELPERS
// =====================================

function createEmptyVector(){

  return new Array(

    MEMORY_EMBEDDINGS_CONFIG
    .VECTOR_DIMENSIONS

  )
  .fill(0);

}



function repeatEmbeddingText(
  text,
  weight = 1
){

  const safeWeight =
  Math.max(
    1,
    Math.round(weight)
  );

  return (
    normalizeMemoryString(
      text
    ) + " "
  )
  .repeat(
    safeWeight
  );

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

    const learned =

      memoryEmbeddingsState
      .learnedAssociations
      .get(token);

    if(
      learned
    ){

      learned.forEach((item) => {

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
// VECTOR VALIDATION
// =====================================

function isValidEmbeddingVector(
  vector
){

  return (

    Array.isArray(vector)

    &&

    vector.length ===
    MEMORY_EMBEDDINGS_CONFIG
    .VECTOR_DIMENSIONS

    &&

    vector.every((value) => {

      return Number.isFinite(
        value
      );

    })

  );

}



// =====================================
// WORKER EXECUTION
// =====================================

async function executeEmbeddingTask(
  callback
){

  if(

    memoryEmbeddingsState
    .workerEnabled

  ){

    // FUTURE WEB WORKER
  }

  return callback();

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

    repeatEmbeddingText(
      memory.title,
      MEMORY_EMBEDDINGS_CONFIG
      .TITLE_BOOST
    ),

    repeatEmbeddingText(
      memory.summary,
      MEMORY_EMBEDDINGS_CONFIG
      .SUMMARY_BOOST
    ),

    repeatEmbeddingText(

      Array.isArray(memory.tags)

      ? memory.tags.join(" ")

      : "",

      MEMORY_EMBEDDINGS_CONFIG
      .TAG_BOOST

    ),

    repeatEmbeddingText(
      memory.content,
      MEMORY_EMBEDDINGS_CONFIG
      .CONTENT_BOOST
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
  .dirtyEmbeddings
  .delete(
    memory.id
  );

  if(

    !memoryEmbeddingsState
    .embeddingIndex
    .has(memory.id)

  ){

    memoryEmbeddingsState
    .totalEmbeddings++;

  }

  pruneEmbeddingCache();

  return vector;

}



// =====================================
// DIRTY TRACKING
// =====================================

function markEmbeddingDirty(
  memoryId
){

  memoryEmbeddingsState
  .dirtyEmbeddings
  .add(
    normalizeMemoryString(
      memoryId
    )
  );

  return true;

}



// =====================================
// COSINE SIMILARITY
// =====================================

function calculateCosineSimilarity(
  vectorA = [],
  vectorB = []
){

  if(

    !isValidEmbeddingVector(
      vectorA
    )

    ||

    !isValidEmbeddingVector(
      vectorB
    )

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
// MULTI STAGE RERANK
// =====================================

function rerankSemanticResults(
  results = []
){

  return results.sort((a,b) => {

    const scoreA =

      (
        a.similarity * 0.7
      )

      +

      (
        calculateMemoryScore(
          a.memory,
          ""
        ) * 0.3
      );

    const scoreB =

      (
        b.similarity * 0.7
      )

      +

      (
        calculateMemoryScore(
          b.memory,
          ""
        ) * 0.3
      );

    return scoreB - scoreA;

  });

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

    if(
      candidate.state ===
      "deleted"
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

  return rerankSemanticResults(
    related
  )
  .slice(0,limit);

}



// =====================================
// SEMANTIC SEARCH
// =====================================

function semanticMemorySearch(
  query,
  options = {}
){

  if(
    !query
  ){

    return [];

  }

  const queryVector =
  createTextEmbedding(
    query
  );

  const results = [];

  const tokenCandidates =

    typeof searchByTokens ===
    "function"

    ? searchByTokens(
        query,
        {
          limit:200
        }
      )

    : [];

  const candidateIds =
  new Set(

    tokenCandidates.map((item) => {

      return item.memory.id;

    })

  );

  memoryState.memories
  .forEach((memory) => {

    if(

      candidateIds.size > 0 &&

      !candidateIds.has(
        memory.id
      )

    ){

      return;
    }

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

  return rerankSemanticResults(
    results
  );

}



// =====================================
// AUTO LINK MEMORIES
// =====================================

function autoLinkRelatedMemories(){

  memoryEmbeddingsState
  .relationCache
  .clear();

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
// ADAPTIVE LEARNING
// =====================================

function learnSemanticAssociation(
  source,
  target
){

  const key =

    normalizeMemoryString(
      source
    );

  if(

    !memoryEmbeddingsState
    .learnedAssociations
    .has(key)

  ){

    memoryEmbeddingsState
    .learnedAssociations
    .set(
      key,
      new Set()
    );

  }

  const associations =
  memoryEmbeddingsState
  .learnedAssociations
  .get(key);

  if(
    associations.size >= 50
  ){

    return false;

  }

  associations.add(target);

  return true;

}



// =====================================
// DIRTY REBUILD
// =====================================

function rebuildDirtyEmbeddings(){

  const dirtyIds = [

    ...memoryEmbeddingsState
    .dirtyEmbeddings

  ];

  dirtyIds.forEach((memoryId) => {

    const memory =
    getMemoryById(
      memoryId
    );

    if(!memory){

      return;
    }

    createMemoryEmbeddingVector(
      memory
    );

  });

  memoryEmbeddingsState
  .dirtyEmbeddings
  .clear();

  return true;

}



// =====================================
// REBUILD EMBEDDINGS
// =====================================

function rebuildMemoryEmbeddings(){

  memoryEmbeddingsState
  .totalEmbeddings = 0;

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

  cleanupEmbeddingRelations();

  persistEmbeddingCache();

  return true;

}



// =====================================
// CACHE PERSISTENCE
// =====================================

function persistEmbeddingCache(){

  try{

    if(

      memoryEmbeddingsState
      .embeddingIndex
      .size >

      MEMORY_EMBEDDINGS_CONFIG
      .MAX_CACHE_SIZE

    ){

      pruneEmbeddingCache();

    }

    const serialized =
    JSON.stringify(

      [...memoryEmbeddingsState
      .embeddingIndex]

    );

    localStorage.setItem(
      MEMORY_EMBEDDING_STORAGE_KEY,
      serialized
    );

    return true;

  }

  catch(error){

    return false;

  }

}



function restoreEmbeddingCache(){

  try{

    const serialized =
    localStorage.getItem(
      MEMORY_EMBEDDING_STORAGE_KEY
    );

    if(!serialized){

      return false;
    }

    const parsed =
    JSON.parse(
      serialized
    );

    memoryEmbeddingsState
    .embeddingIndex =
    new Map(

      parsed.filter((entry) => {

        return (

          Array.isArray(entry)

          &&

          entry.length === 2

          &&

          isValidEmbeddingVector(
            entry[1]
          )

        );

      })

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CACHE PRUNING
// =====================================

function pruneEmbeddingCache(){

  const maxSize =

    MEMORY_EMBEDDINGS_CONFIG
    .MAX_CACHE_SIZE;

  const index =
  memoryEmbeddingsState
  .embeddingIndex;

  while(
    index.size > maxSize
  ){

    const firstKey =

      index.keys()
      .next()
      .value;

    index.delete(
      firstKey
    );

  }

  return true;

}



// =====================================
// CACHE HELPERS
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
// RELATION CLEANUP
// =====================================

function cleanupEmbeddingRelations(){

  const validIds =
  new Set(

    memoryState.memories
    .map((memory) => {

      return memory.id;

    })

  );

  memoryEmbeddingsState
  .relationCache
  .forEach((relations,id) => {

    if(
      !validIds.has(id)
    ){

      memoryEmbeddingsState
      .relationCache
      .delete(id);

      return;
    }

    memoryEmbeddingsState
    .relationCache
    .set(

      id,

      relations.filter((relationId) => {

        return validIds.has(
          relationId
        );

      })

    );

  });

  return true;

}



// =====================================
// DIAGNOSTICS
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

    dirtyEmbeddings:

      memoryEmbeddingsState
      .dirtyEmbeddings
      .size,

    learnedAssociations:

      memoryEmbeddingsState
      .learnedAssociations
      .size,

    workerEnabled:

      memoryEmbeddingsState
      .workerEnabled,

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
