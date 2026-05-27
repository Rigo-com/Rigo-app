// =====================================
// RIGO AI
// MEMORY EMBEDDINGS
// FINAL OPTIMIZED BUILD
// =====================================



// =====================================
// EMBEDDING CONFIG
// =====================================

const MEMORY_EMBEDDINGS_CONFIG =
Object.freeze({

  ENABLE_EMBEDDINGS:true,

  ENABLE_SEMANTIC_SEARCH:true,

  VECTOR_DIMENSIONS:384,

  MAX_EMBEDDING_TEXT:
  5000,

  MAX_RELATED_RESULTS:20,

  MIN_SIMILARITY_SCORE:
  0.35,

  MAX_CACHE_SIZE:1000,

  TITLE_BOOST:2.5,

  TAG_BOOST:2.0,

  SUMMARY_BOOST:1.5,

  CONTENT_BOOST:1.0

});



// =====================================
// STORAGE KEY
// =====================================

const MEMORY_EMBEDDING_STORAGE_KEY =
"rigo_memory_embeddings";



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

  embeddingIndex:
  new Map(),

  relationCache:
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
    "transport"
  ],

  ai:[
    "artificial",
    "intelligence",
    "assistant"
  ],

  money:[
    "finance",
    "payment",
    "income"
  ],

  bug:[
    "issue",
    "problem",
    "error"
  ],

  memory:[
    "context",
    "history",
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
// VECTOR NORMALIZATION
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
// TEXT EMBEDDING
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

      vector[index] += 1;

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

  const memoryId =
  normalizeMemoryString(
    memory.id
  );

  if(!memoryId){

    return createEmptyVector();

  }

  const vector =
  createEmptyVector();

  const sections = [

    {

      text:memory.title,

      weight:
      MEMORY_EMBEDDINGS_CONFIG
      .TITLE_BOOST

    },

    {

      text:memory.summary,

      weight:
      MEMORY_EMBEDDINGS_CONFIG
      .SUMMARY_BOOST

    },

    {

      text:

        Array.isArray(
          memory.tags
        )

        ? memory.tags.join(" ")

        : "",

      weight:
      MEMORY_EMBEDDINGS_CONFIG
      .TAG_BOOST

    },

    {

      text:memory.content,

      weight:
      MEMORY_EMBEDDINGS_CONFIG
      .CONTENT_BOOST

    }

  ];

  sections.forEach((section) => {

    const tokens =
    expandSemanticTokens(

      tokenizeEmbeddingText(
        section.text
      )

    );

    tokens.forEach((token) => {

      const index =
      getTokenVectorIndex(
        token
      );

      vector[index] +=
      section.weight;

    });

  });

  const normalizedVector =
  normalizeVector(
    vector
  );

  const alreadyExists =

    memoryEmbeddingsState
    .embeddingIndex
    .has(
      memoryId
    );

  memoryEmbeddingsState
  .embeddingIndex
  .set(
    memoryId,
    normalizedVector
  );

  memoryEmbeddingsState
  .dirtyEmbeddings
  .delete(
    memoryId
  );

  if(
    !alreadyExists
  ){

    memoryEmbeddingsState
    .totalEmbeddings++;

  }

  pruneEmbeddingCache();

  return normalizedVector;

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

  safeMemoryArray(
    memoryState?.memories
  )
  .forEach((candidate) => {

    if(

      !candidate ||

      candidate.id ===
      memory.id ||

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

  if(!query){

    return [];
  }

  const queryVector =
  createTextEmbedding(
    query
  );

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

      return item?.memory?.id;

    })

  );

  const useCandidateFilter =
  candidateIds.size > 0;

  const results = [];

  safeMemoryArray(
    memoryState?.memories
  )
  .forEach((memory) => {

    if(
      useCandidateFilter
    ){

      if(
        !candidateIds.has(
          memory.id
        )
      ){

        return;
      }

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

  return results.sort((a,b) => {

    return (
      b.similarity -
      a.similarity
    );

  });

}



// =====================================
// AUTO LINKING
// =====================================

function autoLinkRelatedMemories(){

  memoryEmbeddingsState
  .relationCache
  .clear();

  const memories =
  safeMemoryArray(
    memoryState?.memories
    .slice(0,500)
  );

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
// LEARNING
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
// REBUILD DIRTY
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
// REBUILD ALL
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

  safeMemoryArray(
    memoryState?.memories
  )
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
      !isMemoryStorageAvailable?.()
    ){

      return false;

    }

    pruneEmbeddingCache();

    const serialized =
    JSON.stringify(

      [...memoryEmbeddingsState
      .embeddingIndex]

    );

    if(

      serialized.length >

      1024 * 1024 * 5

    ){

      return false;

    }

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

    if(
      !isMemoryStorageAvailable?.()
    ){

      return false;

    }

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
// RELATION CLEANUP
// =====================================

function cleanupEmbeddingRelations(){

  const validIds =
  new Set(

    safeMemoryArray(
      memoryState?.memories
    )
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



// =====================================
// PUBLIC API
// =====================================

const MemoryEmbeddings =
Object.freeze({

  create:
  createTextEmbedding,

  createMemory:
  createMemoryEmbeddingVector,

  similarity:
  calculateMemorySimilarity,

  semanticSearch:
  semanticMemorySearch,

  related:
  findRelatedMemories,

  rebuild:
  rebuildMemoryEmbeddings,

  rebuildDirty:
  rebuildDirtyEmbeddings,

  markDirty:
  markEmbeddingDirty,

  persist:
  persistEmbeddingCache,

  restore:
  restoreEmbeddingCache,

  cleanup:
  cleanupEmbeddingRelations,

  diagnostics:
  getMemoryEmbeddingDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemoryEmbeddings =
  MemoryEmbeddings;

}
