// =====================================
// RIGO AI
// MEMORY SUMMARY
// OPTIMIZED FINAL
// =====================================



// =====================================
// SUMMARY CONFIG
// =====================================

const MEMORY_SUMMARY_CONFIG =
Object.freeze({

  MAX_SUMMARY_LENGTH:
  2000,

  MAX_INPUT_LENGTH:
  50000,

  MIN_CONTENT_LENGTH:
  20,

  MAX_MESSAGES:
  200,

  MAX_BULLETS:
  20,

  MAX_SENTENCES:
  30,

  MAX_KEYWORDS:
  25,

  MAX_CACHE_SIZE:
  500,

  REDUNDANCY_THRESHOLD:
  0.85,

  ENABLE_CACHE:true,

  ENABLE_SEMANTIC_SCORING:true,

  ENABLE_REDUNDANCY_FILTER:true

});



// =====================================
// SUMMARY STATE
// =====================================

const memorySummaryState =
Object.seal({

  initialized:false,

  generatedSummaries:0,

  cachedSummaries:0,

  failedSummaries:0,

  redundancyRemovals:0,

  cache:new Map(),

  dirtySummaryIds:
  new Set(),

  lastSummaryAt:null

});



// =====================================
// STOP WORDS
// =====================================

const MEMORY_SUMMARY_STOP_WORDS =
new Set([

  "the","a","an","and","or","but",
  "if","then","is","are","was",
  "were","be","to","of","in",
  "on","at","for","with","this",
  "that","it","as","by","from",
  "about"

]);



// =====================================
// TEXT HELPERS
// =====================================

function sanitizeSummaryText(
  text
){

  return String(text || "")

  .replace(
    /[\u0000-\u001F\u007F]/g,
    " "
  )

  .replace(
    /\s+/g,
    " "
  )

  .trim()

  .slice(
    0,
    MEMORY_SUMMARY_CONFIG
    .MAX_INPUT_LENGTH
  );

}



function truncateSummaryText(
  text,
  maxLength =
  MEMORY_SUMMARY_CONFIG
  .MAX_SUMMARY_LENGTH
){

  const safeText =
  sanitizeSummaryText(
    text
  );

  if(
    safeText.length <=
    maxLength
  ){

    return safeText;

  }

  return (

    safeText.slice(
      0,
      maxLength - 15
    )

    +

    "...[TRUNCATED]"

  );

}



// =====================================
// TOKENIZATION
// =====================================

function tokenizeSummaryText(
  text
){

  return sanitizeSummaryText(
    text
  )

  .toLowerCase()

  .split(
    /[^a-zA-Z0-9\u0600-\u06FF]+/
  )

  .filter((token) => {

    return (
      token &&
      token.length > 2 &&
      !MEMORY_SUMMARY_STOP_WORDS
      .has(token)
    );

  });

}



function splitSummarySentences(
  text
){

  return sanitizeSummaryText(
    text
  )

  .split(/[.!?\n]+/)

  .map((sentence,index) => {

    return {

      index,

      sentence:
      sentence.trim()

    };

  })

  .filter((item) => {

    return (
      item.sentence.length >= 3
    );

  });

}



// =====================================
// KEYWORDS
// =====================================

function extractSummaryKeywords(
  text
){

  const scores =
  new Map();

  tokenizeSummaryText(text)
  .forEach((token) => {

    scores.set(

      token,

      (scores.get(token) || 0) + 1

    );

  });

  return [

    ...scores.entries()

  ]

  .sort((a,b) => {

    return b[1] - a[1];

  })

  .slice(
    0,
    MEMORY_SUMMARY_CONFIG
    .MAX_KEYWORDS
  )

  .map((entry) => {

    return entry[0];

  });

}



// =====================================
// SEMANTIC SCORE
// =====================================

function calculateSemanticSentenceScore(
  sentence,
  fullText
){

  try{

    if(

      !MEMORY_SUMMARY_CONFIG
      .ENABLE_SEMANTIC_SCORING

    ){

      return 0;

    }

    if(

      typeof createTextEmbedding !==
      "function"

      ||

      typeof calculateCosineSimilarity !==
      "function"

    ){

      return 0;

    }

    const sentenceVector =
    createTextEmbedding(
      sentence
    );

    const fullVector =
    createTextEmbedding(
      fullText
    );

    return safeMemoryNumber(

      calculateCosineSimilarity(
        sentenceVector,
        fullVector
      ),

      0

    );

  }

  catch(error){

    return 0;

  }

}



// =====================================
// SENTENCE SCORE
// =====================================

function scoreSummarySentence(
  sentence,
  keywords,
  fullText
){

  let score = 0;

  const normalized =
  sentence.toLowerCase();

  keywords.forEach((keyword) => {

    if(
      normalized.includes(
        keyword
      )
    ){

      score++;

    }

  });

  if(
    sentence.length > 40
  ){

    score++;

  }

  score +=
  calculateSemanticSentenceScore(
    sentence,
    fullText
  ) * 5;

  return score;

}



// =====================================
// REDUNDANCY FILTER
// =====================================

function removeRedundantSentences(
  sentences = []
){

  if(

    !MEMORY_SUMMARY_CONFIG
    .ENABLE_REDUNDANCY_FILTER

  ){

    return sentences;

  }

  const filtered = [];

  const vectorCache =
  new Map();

  sentences.forEach((current) => {

    const currentVector =

      vectorCache.get(
        current.sentence
      )

      ||

      createTextEmbedding?.(
        current.sentence
      );

    vectorCache.set(
      current.sentence,
      currentVector
    );

    const duplicate =
    filtered.some((existing) => {

      const existingVector =

        vectorCache.get(
          existing.sentence
        )

        ||

        createTextEmbedding?.(
          existing.sentence
        );

      vectorCache.set(
        existing.sentence,
        existingVector
      );

      const similarity =
      calculateCosineSimilarity?.(

        existingVector,

        currentVector

      );

      return (

        similarity >=

        MEMORY_SUMMARY_CONFIG
        .REDUNDANCY_THRESHOLD

      );

    });

    if(
      duplicate
    ){

      memorySummaryState
      .redundancyRemovals++;

      return;
    }

    filtered.push(
      current
    );

  });

  return filtered;

}



// =====================================
// BEST SENTENCES
// =====================================

function getBestSummarySentences(
  text,
  limit = 5
){

  const keywords =
  extractSummaryKeywords(
    text
  );

  const scored =

    splitSummarySentences(
      text
    )

    .map((item) => {

      return {

        ...item,

        score:
        scoreSummarySentence(

          item.sentence,

          keywords,

          text

        )

      };

    })

    .sort((a,b) => {

      return b.score - a.score;

    })

    .slice(0,limit);

  return removeRedundantSentences(
    scored
  )

  .sort((a,b) => {

    return a.index - b.index;

  })

  .map((item) => {

    return item.sentence;

  });

}



// =====================================
// CACHE
// =====================================

async function createSummaryCacheKey(
  text,
  options = {}
){

  try{

    return await createMemoryHash(
      JSON.stringify({

        text:
        sanitizeSummaryText(
          text
        ),

        options

      })
    );

  }

  catch(error){

    return createMemoryId();

  }

}



function pruneSummaryCache(){

  while(

    memorySummaryState
    .cache
    .size >

    MEMORY_SUMMARY_CONFIG
    .MAX_CACHE_SIZE

  ){

    const firstKey =

      memorySummaryState
      .cache
      .keys()
      .next()
      .value;

    memorySummaryState
    .cache
    .delete(firstKey);

  }

}



// =====================================
// BUILD SUMMARY
// =====================================

async function buildTextSummary(
  text,
  options = {}
){

  try{

    const safeText =
    sanitizeSummaryText(
      text
    );

    if(

      safeText.length <

      MEMORY_SUMMARY_CONFIG
      .MIN_CONTENT_LENGTH

    ){

      return safeText;

    }

    const cacheKey =
    await createSummaryCacheKey(
      safeText,
      options
    );

    if(

      MEMORY_SUMMARY_CONFIG
      .ENABLE_CACHE

      &&

      cacheKey

    ){

      const cached =
      memorySummaryState
      .cache
      .get(cacheKey);

      if(cached){

        memorySummaryState
        .cachedSummaries++;

        return cached;

      }

    }

    const limit =
    Math.min(

      Number(
        options.limit
      ) || 5,

      MEMORY_SUMMARY_CONFIG
      .MAX_SENTENCES

    );

    const summary =
    truncateSummaryText(

      getBestSummarySentences(
        safeText,
        limit
      )
      .join(". ")

    );

    if(
      cacheKey
    ){

      memorySummaryState
      .cache
      .set(
        cacheKey,
        summary
      );

      pruneSummaryCache();

    }

    memorySummaryState
    .generatedSummaries++;

    memorySummaryState
    .lastSummaryAt =
    Date.now();

    return summary;

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return truncateSummaryText(
      text
    );

  }

}



// =====================================
// SUMMARY LEVELS
// =====================================

function createSummaryByLevel(
  level,
  text
){

  const levels = {

    tiny:1,

    short:3,

    medium:6,

    full:10

  };

  return buildTextSummary(
    text,
    {
      limit:
      levels[level] || 3
    }
  );

}



// =====================================
// MEMORY SUMMARY
// =====================================

async function summarizeMemory(
  memory,
  options = {}
){

  if(!memory){

    return "";

  }

  const content = [

    memory.title,

    memory.summary,

    memory.content,

    Array.isArray(memory.tags)

    ? memory.tags.join(" ")

    : ""

  ]

  .filter(Boolean)

  .join(". ");

  return buildTextSummary(
    content,
    options
  );

}



// =====================================
// CONVERSATION SUMMARY
// =====================================

async function summarizeConversation(
  messages = [],
  options = {}
){

  if(
    !Array.isArray(
      messages
    )
  ){

    return "";

  }

  const content =

    messages

    .slice(
      -MEMORY_SUMMARY_CONFIG
      .MAX_MESSAGES
    )

    .map((message) => {

      return `${

        sanitizeSummaryText(
          message?.role
        )

      }: ${

        sanitizeSummaryText(
          message?.content
        )

      }`;

    })

    .join(". ");

  return buildTextSummary(
    content,
    options
  );

}



// =====================================
// GROUP SUMMARY
// =====================================

async function summarizeMemoryGroup(
  memories = [],
  options = {}
){

  const summaries =
  await Promise.all(

    memories.map((memory) => {

      return summarizeMemory(
        memory,
        options
      );

    })

  );

  return buildTextSummary(

    summaries.join(". "),

    options

  );

}



// =====================================
// BULLETS
// =====================================

function createBulletSummary(
  text,
  options = {}
){

  const limit =
  Math.min(

    Number(
      options.limit
    ) || 5,

    MEMORY_SUMMARY_CONFIG
    .MAX_BULLETS

  );

  return getBestSummarySentences(
    text,
    limit
  )

  .map((sentence) => {

    return `• ${sentence}`;

  })

  .join("\n");

}



// =====================================
// COMPRESSION
// =====================================

async function compressMemoryContent(
  content,
  maxLength = 1000
){

  const summary =
  await createSummaryByLevel(
    "short",
    content
  );

  return truncateSummaryText(
    summary,
    maxLength
  );

}



// =====================================
// DIRTY REBUILD
// =====================================

function markSummaryDirty(
  memoryId
){

  const normalizedId =
  normalizeMemoryString(
    memoryId
  );

  if(!normalizedId){

    return false;

  }

  memorySummaryState
  .dirtySummaryIds
  .add(
    normalizedId
  );

  return true;

}



async function rebuildDirtySummaries(){

  const dirtyIds = [

    ...memorySummaryState
    .dirtySummaryIds

  ];

  await Promise.all(

    dirtyIds.map((memoryId) => {

      const memory =
      getMemoryById?.(
        memoryId
      );

      if(!memory){

        return null;

      }

      return summarizeMemory(
        memory
      );

    })

  );

  memorySummaryState
  .dirtySummaryIds
  .clear();

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getMemorySummaryDiagnostics(){

  return {

    initialized:
    memorySummaryState
    .initialized,

    generatedSummaries:
    memorySummaryState
    .generatedSummaries,

    cachedSummaries:
    memorySummaryState
    .cachedSummaries,

    failedSummaries:
    memorySummaryState
    .failedSummaries,

    redundancyRemovals:
    memorySummaryState
    .redundancyRemovals,

    cacheSize:
    memorySummaryState
    .cache
    .size,

    dirtySummaries:
    memorySummaryState
    .dirtySummaryIds
    .size,

    lastSummaryAt:
    memorySummaryState
    .lastSummaryAt

  };

}



// =====================================
// PUBLIC API
// =====================================

const MemorySummary =
Object.freeze({

  summarize:
  buildTextSummary,

  summarizeMemory,

  summarizeConversation,

  summarizeGroup:
  summarizeMemoryGroup,

  createBulletSummary,

  createSummaryByLevel,

  compress:
  compressMemoryContent,

  markDirty:
  markSummaryDirty,

  rebuildDirty:
  rebuildDirtySummaries,

  diagnostics:
  getMemorySummaryDiagnostics

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.MemorySummary =
  MemorySummary;

}
