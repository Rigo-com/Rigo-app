// =====================================
// RIGO AI
// MEMORY SUMMARY
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// SUMMARY CONFIG
// =====================================

const MEMORY_SUMMARY_CONFIG =
Object.freeze({

  MAX_SUMMARY_LENGTH:
  2000,

  MIN_CONTENT_LENGTH:
  20,

  MAX_INPUT_LENGTH:
  50000,

  MAX_MESSAGES:
  200,

  MAX_BULLETS:
  20,

  MAX_SENTENCES:
  30,

  MIN_SENTENCE_LENGTH:
  3,

  RECENT_MESSAGE_COUNT:
  20,

  KEYWORD_LIMIT:
  25,

  REDUNDANCY_THRESHOLD:
  0.85,

  CACHE_LIMIT:
  500,

  ENABLE_SEMANTIC_SCORING:true,

  ENABLE_REDUNDANCY_FILTER:true,

  ENABLE_PRIORITY_SCORING:true,

  ENABLE_INCREMENTAL_SUMMARY:true,

  ENABLE_SUMMARY_CACHE:true

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

  semanticScores:0,

  redundancyRemovals:0,

  cache:new Map(),

  dirtySummaryIds:
  new Set(),

  summaryMetadata:
  new Map(),

  lastSummaryAt:null

});



// =====================================
// STOP WORDS
// =====================================

const MEMORY_SUMMARY_STOP_WORDS =
new Set([

  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "then",
  "is",
  "are",
  "was",
  "were",
  "be",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "this",
  "that",
  "it",
  "as",
  "by",
  "from",
  "about"

]);



// =====================================
// NORMALIZE TEXT
// =====================================

function normalizeSummaryText(
  text
){

  return String(
    text || ""
  )

  .replace(
    /[\u0000-\u001F\u007F]/g,
    " "
  )

  .replace(
    /\s+/g,
    " "
  )

  .trim();

}



// =====================================
// SAFE TEXT
// =====================================

function sanitizeSummaryText(
  text
){

  const normalizedText =
  normalizeSummaryText(
    text
  );

  return normalizedText
  .slice(
    0,
    MEMORY_SUMMARY_CONFIG
    .MAX_INPUT_LENGTH
  );

}



// =====================================
// CACHE KEY
// =====================================

async function createSummaryCacheKey(
  text,
  options = {}
){

  try{

    const hash =
    await createMemoryHash(
      JSON.stringify({

        text:
        sanitizeSummaryText(
          text
        ),

        options

      })
    );

    return (

      hash ||

      createMemoryId()

    );

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return createMemoryId();

  }

}



// =====================================
// TRUNCATE
// =====================================

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
// SPLIT SENTENCES
// =====================================

function splitSummarySentences(
  text
){

  return sanitizeSummaryText(
    text
  )

  .split(
    /[.!?\n]+/
  )

  .map((sentence,index) => {

    return {

      index,

      sentence:
      sentence.trim()

    };

  })

  .filter((item) => {

    return (
      item.sentence.length >=
      MEMORY_SUMMARY_CONFIG
      .MIN_SENTENCE_LENGTH
    );

  });

}



// =====================================
// TOKENIZE
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

  .map((token) => {

    return token.trim();

  })

  .filter((token) => {

    return (
      token.length > 2
    );

  });

}



// =====================================
// KEYWORD EXTRACTION
// =====================================

function extractSummaryKeywords(
  text
){

  const tokens =
  tokenizeSummaryText(
    text
  );

  const scores =
  new Map();

  tokens.forEach((token) => {

    if(

      MEMORY_SUMMARY_STOP_WORDS
      .has(token)

    ){

      return;
    }

    const current =
    scores.get(token) || 0;

    scores.set(
      token,
      current + 1
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
    .KEYWORD_LIMIT
  )

  .map((entry) => {

    return entry[0];

  });

}



// =====================================
// SEMANTIC SCORING
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

    if(
      !sentenceVector ||
      !fullVector
    ){

      return 0;

    }

    memorySummaryState
    .semanticScores++;

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
// PRIORITY SCORE
// =====================================

function calculatePrioritySummaryScore(
  sentence
){

  let score = 0;

  const normalized =
  sentence.toLowerCase();

  if(
    normalized.includes("important")
  ){

    score += 2;

  }

  if(
    normalized.includes("critical")
  ){

    score += 3;

  }

  if(
    normalized.includes("urgent")
  ){

    score += 3;

  }

  return score;

}



// =====================================
// SENTENCE SCORING
// =====================================

function scoreSummarySentence(
  sentence,
  keywords = [],
  fullText = ""
){

  try{

    if(!sentence){

      return 0;

    }

    const normalizedSentence =
    sentence.toLowerCase();

    let score = 0;

    keywords.forEach((keyword) => {

      if(

        normalizedSentence.includes(
          keyword
        )

      ){

        score += 1;

      }

    });

    if(
      sentence.length > 40
    ){

      score += 1;

    }

    score +=
    calculateSemanticSentenceScore(
      sentence,
      fullText
    ) * 5;

    score +=
    calculatePrioritySummaryScore(
      sentence
    );

    return safeMemoryNumber(
      score,
      0
    );

  }

  catch(error){

    return 0;

  }

}



// =====================================
// REDUNDANCY FILTER
// =====================================

function removeRedundantSentences(
  sentences = []
){

  try{

    if(

      !MEMORY_SUMMARY_CONFIG
      .ENABLE_REDUNDANCY_FILTER

    ){

      return sentences;

    }

    if(

      typeof createTextEmbedding !==
      "function"

      ||

      typeof calculateCosineSimilarity !==
      "function"

    ){

      return sentences;

    }

    const filtered = [];

    sentences.forEach((current) => {

      const duplicate =
      filtered.some((existing) => {

        try{

          const similarity =
          calculateCosineSimilarity(

            createTextEmbedding(
              existing.sentence
            ),

            createTextEmbedding(
              current.sentence
            )

          );

          return (

            similarity >=

            MEMORY_SUMMARY_CONFIG
            .REDUNDANCY_THRESHOLD

          );

        }

        catch(error){

          return false;

        }

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

  catch(error){

    return sentences;

  }

}



// =====================================
// BEST SENTENCES
// =====================================

function getBestSummarySentences(
  text,
  limit = 5
){

  try{

    const sentences =
    splitSummarySentences(
      text
    );

    const keywords =
    extractSummaryKeywords(
      text
    );

    const scored = sentences

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

    const filtered =
    removeRedundantSentences(
      scored
    );



    // ===================================
    // PRESERVE ORIGINAL ORDER
    // ===================================

    return filtered

    .sort((a,b) => {

      return a.index - b.index;

    })

    .map((item) => {

      return item.sentence;

    });

  }

  catch(error){

    return [];

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



    // ===================================
    // CACHE
    // ===================================

    if(

      MEMORY_SUMMARY_CONFIG
      .ENABLE_SUMMARY_CACHE

      &&

      cacheKey

    ){

      const cached =
      memorySummaryState
      .cache
      .get(cacheKey);

      if(
        cached
      ){

        memorySummaryState
        .cachedSummaries++;

        return cached;

      }

    }

    const sentenceLimit =
    Math.min(

      Number(
        options.limit
      ) || 5,

      MEMORY_SUMMARY_CONFIG
      .MAX_SENTENCES

    );

    const bestSentences =
    getBestSummarySentences(
      safeText,
      sentenceLimit
    );

    const summary =
    truncateSummaryText(

      bestSentences.join(". ")

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
    }



    // ===================================
    // CACHE LIMIT
    // ===================================

    while(

      memorySummaryState
      .cache
      .size >

      MEMORY_SUMMARY_CONFIG
      .CACHE_LIMIT

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
// MEMORY SUMMARY
// =====================================

async function summarizeMemory(
  memory,
  options = {}
){

  try{

    if(
      !memory
    ){

      return "";
    }

    const sections = [];

    if(
      memory.title
    ){

      sections.push(
        memory.title
      );

    }

    if(
      memory.summary
    ){

      sections.push(
        memory.summary
      );

    }

    if(
      memory.content
    ){

      sections.push(
        memory.content
      );

    }

    if(

      Array.isArray(
        memory.tags
      )

    ){

      sections.push(
        memory.tags.join(" ")
      );

    }

    return await buildTextSummary(

      sections.join(". "),
      options

    );

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return "";

  }

}



// =====================================
// CONVERSATION SUMMARY
// =====================================

async function summarizeConversation(
  messages = [],
  options = {}
){

  try{

    if(
      !Array.isArray(
        messages
      )
    ){

      return "";
    }

    const limitedMessages =
    messages.slice(

      -MEMORY_SUMMARY_CONFIG
      .MAX_MESSAGES

    );

    const lines = [];

    limitedMessages
    .forEach((message) => {

      if(
        !message
      ){

        return;
      }

      const role =
      sanitizeSummaryText(
        message.role
      );

      const content =
      sanitizeSummaryText(
        message.content
      );

      if(
        !content
      ){

        return;
      }

      lines.push(
        `${role}: ${content}`
      );

    });

    return await buildTextSummary(

      lines.join(". "),
      options

    );

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return "";

  }

}



// =====================================
// RECENT CONVERSATION SUMMARY
// =====================================

async function summarizeRecentConversation(
  messages = []
){

  try{

    if(
      !Array.isArray(
        messages
      )
    ){

      return "";
    }

    return await summarizeConversation(

      messages.slice(

        -MEMORY_SUMMARY_CONFIG
        .RECENT_MESSAGE_COUNT

      )

    );

  }

  catch(error){

    return "";

  }

}



// =====================================
// BULLET SUMMARY
// =====================================

function createBulletSummary(
  text,
  options = {}
){

  try{

    const bulletLimit =
    Math.min(

      Number(
        options.limit
      ) || 5,

      MEMORY_SUMMARY_CONFIG
      .MAX_BULLETS

    );

    const sentences =
    getBestSummarySentences(
      text,
      bulletLimit
    );

    return sentences
    .map((sentence) => {

      return `• ${sentence}`;

    })
    .join("\n");

  }

  catch(error){

    return "";

  }

}



// =====================================
// MULTI LEVEL SUMMARIES
// =====================================

async function createTinySummary(
  text
){

  return buildTextSummary(
    text,
    {
      limit:1
    }
  );

}



async function createShortSummary(
  text
){

  return buildTextSummary(
    text,
    {
      limit:3
    }
  );

}



async function createMediumSummary(
  text
){

  return buildTextSummary(
    text,
    {
      limit:6
    }
  );

}



async function createFullSummary(
  text
){

  return buildTextSummary(
    text,
    {
      limit:10
    }
  );

}



// =====================================
// MEMORY GROUP SUMMARY
// =====================================

async function summarizeMemoryGroup(
  memories = [],
  options = {}
){

  try{

    if(
      !Array.isArray(
        memories
      )
    ){

      return "";
    }

    const summaries = [];

    for(
      const memory
      of memories
    ){

      const summary =
      await summarizeMemory(
        memory,
        options
      );

      if(
        summary
      ){

        summaries.push(
          summary
        );

      }

    }

    return await buildTextSummary(

      summaries.join(". "),
      options

    );

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return "";

  }

}



// =====================================
// CONTEXT COMPRESSION
// =====================================

async function compressMemoryContent(
  content,
  maxLength =
  1000
){

  try{

    const summary =
    await createShortSummary(
      content
    );

    return truncateSummaryText(
      summary,
      maxLength
    );

  }

  catch(error){

    return truncateSummaryText(
      content,
      maxLength
    );

  }

}



// =====================================
// INCREMENTAL SUMMARY
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

  try{

    const dirtyIds = [

      ...memorySummaryState
      .dirtySummaryIds

    ];

    for(
      const memoryId
      of dirtyIds
    ){

      const memory =
      getMemoryById(
        memoryId
      );

      if(!memory){

        continue;
      }

      await summarizeMemory(
        memory
      );

    }

    memorySummaryState
    .dirtySummaryIds
    .clear();

    return true;

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return false;

  }

}



// =====================================
// SUMMARY METADATA
// =====================================

function createSummaryMetadata(
  text
){

  const safeText =
  sanitizeSummaryText(
    text
  );

  const sentences =
  splitSummarySentences(
    safeText
  );

  const keywords =
  extractSummaryKeywords(
    safeText
  );

  return {

    createdAt:
    Date.now(),

    characterCount:
    safeText.length,

    sentenceCount:
    sentences.length,

    keywordCount:
    keywords.length,

    keywords

  };

}



// =====================================
// SUMMARY OBJECT
// =====================================

async function createSummaryObject(
  text,
  options = {}
){

  try{

    const summary =
    await buildTextSummary(
      text,
      options
    );

    return {

      id:
      createMemoryId(),

      summary,

      metadata:
      createSummaryMetadata(
        summary
      ),

      createdAt:
      Date.now()

    };

  }

  catch(error){

    memorySummaryState
    .failedSummaries++;

    return null;

  }

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

    semanticScores:
    memorySummaryState
    .semanticScores,

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
