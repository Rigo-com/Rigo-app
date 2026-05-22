// =====================================
// RIGO AI
// MEMORY SUMMARY
// ENTERPRISE GOD FINAL
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
  25

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

  .map((sentence) => {

    return sentence.trim();

  })

  .filter((sentence) => {

    return (
      sentence.length >=
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
// SENTENCE SCORING
// =====================================

function scoreSummarySentence(
  sentence,
  keywords = []
){

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

  return score;

}



// =====================================
// BEST SENTENCES
// =====================================

function getBestSummarySentences(
  text,
  limit = 5
){

  const sentences =
  splitSummarySentences(
    text
  );

  const keywords =
  extractSummaryKeywords(
    text
  );

  return sentences

  .map((sentence) => {

    return {

      sentence,

      score:
      scoreSummarySentence(
        sentence,
        keywords
      )

    };

  })

  .sort((a,b) => {

    return b.score - a.score;

  })

  .slice(0,limit)

  .map((item) => {

    return item.sentence;

  });

}



// =====================================
// BUILD SUMMARY
// =====================================

function buildTextSummary(
  text,
  options = {}
){

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

  return truncateSummaryText(

    bestSentences.join(". ")

  );

}



// =====================================
// MEMORY SUMMARY
// =====================================

function summarizeMemory(
  memory,
  options = {}
){

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

  return buildTextSummary(

    sections.join(". "),
    options

  );

}



// =====================================
// CONVERSATION SUMMARY
// =====================================

function summarizeConversation(
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

  return buildTextSummary(

    lines.join(". "),
    options

  );

}



// =====================================
// RECENT CONVERSATION SUMMARY
// =====================================

function summarizeRecentConversation(
  messages = []
){

  if(
    !Array.isArray(
      messages
    )
  ){

    return "";
  }

  return summarizeConversation(

    messages.slice(

      -MEMORY_SUMMARY_CONFIG
      .RECENT_MESSAGE_COUNT

    )

  );

}



// =====================================
// BULLET SUMMARY
// =====================================

function createBulletSummary(
  text,
  options = {}
){

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



// =====================================
// MEMORY GROUP SUMMARY
// =====================================

function summarizeMemoryGroup(
  memories = [],
  options = {}
){

  if(
    !Array.isArray(
      memories
    )
  ){

    return "";
  }

  const content =

    memories
    .map((memory) => {

      return summarizeMemory(
        memory,
        options
      );

    })

    .filter(Boolean)

    .join(". ");

  return buildTextSummary(
    content,
    options
  );

}



// =====================================
// COMPRESS MEMORY
// =====================================

function compressMemoryContent(
  content,
  maxLength =
  1000
){

  return truncateSummaryText(
    buildTextSummary(
      content,
      {
        limit:5
      }
    ),
    maxLength
  );

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

function createSummaryObject(
  text,
  options = {}
){

  const summary =
  buildTextSummary(
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
