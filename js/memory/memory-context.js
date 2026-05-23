// =====================================
// RIGO AI
// MEMORY CONTEXT
// ENTERPRISE INFINITY ULTRA FINAL
// =====================================



// =====================================
// CONTEXT CONFIG
// =====================================

const MEMORY_CONTEXT_CONFIG =
Object.freeze({

  DEFAULT_CONTEXT_LIMIT:10,

  MAX_CONTEXT_LIMIT:50,

  MAX_CONTEXT_LENGTH:12000,

  MAX_MEMORY_CONTENT_LENGTH:2000,

  MAX_MEMORY_ID_LENGTH:120,

  MAX_TAGS:10,

  PINNED_BOOST:5,

  RECENT_BOOST:3,

  RELEVANCE_BOOST:4,

  TRUNCATION_MARKER:
  "\n...[TRUNCATED]"

});



// =====================================
// CONSTANTS
// =====================================

const SAFE_CONVERSATION_ROLES =
Object.freeze(
  new Set([
    "user",
    "assistant",
    "system"
  ])
);



const PROMPT_INJECTION_PATTERNS =
Object.freeze([

  /ignore\s+previous\s+instructions/gi,

  /disregard\s+all\s+prior\s+messages/gi,

  /system\s*prompt/gi,

  /developer\s*message/gi,

  /function_call/gi,

  /<\s*system\s*>/gi,

  /<\s*assistant\s*>/gi,

  /<\s*developer\s*>/gi,

  /```system/gi,

  /```assistant/gi

]);



// =====================================
// CONTEXT HELPERS
// =====================================

function normalizeContextQuery(
  query
){

  return String(

    normalizeMemoryContent?.(
      query
    ) ?? ""

  )
  .toLowerCase()
  .trim();

}



function clampContextLimit(
  limit
){

  const numericLimit =
  Number(limit);

  if(
    !Number.isFinite(
      numericLimit
    )
  ){

    return MEMORY_CONTEXT_CONFIG
    .DEFAULT_CONTEXT_LIMIT;

  }

  return Math.min(

    MEMORY_CONTEXT_CONFIG
    .MAX_CONTEXT_LIMIT,

    Math.max(
      1,
      Math.floor(
        numericLimit
      )
    )

  );

}



// =====================================
// PROMPT INJECTION CLEANUP
// =====================================

function removePromptInjectionPatterns(
  text
){

  if(
    typeof text !==
    "string"
  ){

    return "";
  }

  let cleanedText =
  text;

  PROMPT_INJECTION_PATTERNS
  .forEach((pattern) => {

    cleanedText =
    cleanedText.replace(
      pattern,
      ""
    );

  });

  return cleanedText;

}



// =====================================
// CONTEXT SANITIZATION
// =====================================

function sanitizeContextText(
  text
){

  if(
    typeof text !==
    "string"
  ){

    return "";
  }

  return removePromptInjectionPatterns(
    text
  )



  // ===============================
  // REMOVE CONTROL CHARS
  // ===============================

  .replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    " "
  )



  // ===============================
  // NORMALIZE SPACES/TABS
  // ===============================

  .replace(
    /[ \t]+/g,
    " "
  )



  // ===============================
  // LIMIT NEWLINES
  // ===============================

  .replace(
    /\n{3,}/g,
    "\n\n"
  )



  // ===============================
  // REMOVE CONTEXT LABELS
  // ===============================

  .replace(
    /\[\s*(SYSTEM|USER|ASSISTANT)\s+CONTEXT\s*\]/gi,
    ""
  )

  .trim();

}



// =====================================
// SAFE ROLE
// =====================================

function sanitizeConversationRole(
  role
){

  const normalizedRole =
  normalizeMemoryString(
    role
  )
  .toLowerCase();

  if(

    SAFE_CONVERSATION_ROLES
    .has(
      normalizedRole
    )

  ){

    return normalizedRole;

  }

  return "user";

}



// =====================================
// SAFE TRUNCATION
// =====================================

function safelyTruncateText(
  text,
  maxLength
){

  const normalizedText =
  sanitizeContextText(
    text
  );

  const safeMaxLength =
  Number(maxLength);

  if(

    !Number.isFinite(
      safeMaxLength
    )

    ||

    safeMaxLength <= 0

  ){

    return "";
  }

  if(
    normalizedText.length <=
    safeMaxLength
  ){

    return normalizedText;

  }

  const safeLength =

    safeMaxLength -

    MEMORY_CONTEXT_CONFIG
    .TRUNCATION_MARKER
    .length;

  if(
    safeLength <= 0
  ){

    return MEMORY_CONTEXT_CONFIG
    .TRUNCATION_MARKER;

  }

  const slicedText =
  normalizedText.slice(
    0,
    safeLength
  );

  const lastSpaceIndex =
  slicedText.lastIndexOf(
    " "
  );

  if(
    lastSpaceIndex <= 0
  ){

    return (

      slicedText +

      MEMORY_CONTEXT_CONFIG
      .TRUNCATION_MARKER

    );

  }

  return (

    slicedText.slice(
      0,
      lastSpaceIndex
    )

    +

    MEMORY_CONTEXT_CONFIG
    .TRUNCATION_MARKER

  );

}



// =====================================
// CONTEXT FILTER
// =====================================

function isContextEligibleMemory(
  memory,
  options = {}
){

  if(

    !memory ||

    typeof memory !==
    "object"

  ){

    return false;

  }

  if(

    memoryState?.tracking
    ?.corruptedIds
    ?.has?.(
      memory.id
    )

  ){

    return false;

  }

  if(

    memory.state ===
    "deleted"

  ){

    return false;

  }

  if(

    memory.state ===
    "archived"

    &&

    options.includeArchived !==
    true

  ){

    return false;

  }

  return true;

}



// =====================================
// CONTEXT SCORING
// =====================================

function calculateContextScore(
  memory,
  normalizedQuery = ""
){

  if(
    !memory
  ){

    return 0;

  }

  let score = 0;

  const searchableParts = [

    memory.title,

    memory.summary,

    memory.content,

    ...(Array.isArray(memory.tags)
      ? memory.tags
      : [])

  ];

  const searchableText =
  searchableParts
  .map((value) => {

    return normalizeMemoryContent(
      value
    );

  })
  .join(" ")
  .toLowerCase();



  // ===================================
  // RELEVANCE
  // ===================================

  if(

    normalizedQuery &&

    searchableText.includes(
      normalizedQuery
    )

  ){

    score +=

      MEMORY_CONTEXT_CONFIG
      .RELEVANCE_BOOST;

  }



  // ===================================
  // PINNED BOOST
  // ===================================

  if(

    memoryState
    ?.tracking
    ?.pinnedMemoryIds
    ?.has?.(
      memory.id
    )

  ){

    score +=

      MEMORY_CONTEXT_CONFIG
      .PINNED_BOOST;

  }



  // ===================================
  // RECENT BOOST
  // ===================================

  const updatedAt =
  Number(
    memory.updatedAt
  );

  if(
    Number.isFinite(
      updatedAt
    )
  ){

    const ageInDays =

      (
        Date.now() -
        updatedAt
      ) /

      86400000;

    if(
      ageInDays <= 7
    ){

      score +=

        MEMORY_CONTEXT_CONFIG
        .RECENT_BOOST;

    }

  }

  return score;

}



// =====================================
// CONTENT COMPRESSION
// =====================================

function compressMemoryContent(
  content
){

  return safelyTruncateText(

    normalizeMemoryContent(
      content
    ),

    MEMORY_CONTEXT_CONFIG
    .MAX_MEMORY_CONTENT_LENGTH

  );

}



// =====================================
// CONTEXT SECTION FORMATTER
// =====================================

function formatContextSection(
  title,
  content
){

  const normalizedTitle =
  sanitizeContextText(
    title
  );

  const normalizedContent =
  String(
    content || ""
  )
  .trim();

  if(

    !normalizedTitle ||

    !normalizedContent

  ){

    return "";
  }

  return (

    `[${normalizedTitle}]\n` +

    normalizedContent

  );

}



// =====================================
// MEMORY CONTEXT BLOCK
// =====================================

function buildMemoryContextBlock(
  memory
){

  if(!memory){

    return "";
  }

  const lines = [];

  const safeMemoryId =
  sanitizeContextText(
    String(
      memory.id || ""
    )
    .slice(

      0,

      MEMORY_CONTEXT_CONFIG
      .MAX_MEMORY_ID_LENGTH

    )
  );

  lines.push(
    `[Memory ${safeMemoryId}]`
  );

  if(
    memory.title
  ){

    lines.push(

      `Title: ${sanitizeContextText(
        memory.title
      )}`

    );

  }

  if(
    memory.summary
  ){

    lines.push(

      `Summary: ${sanitizeContextText(
        memory.summary
      )}`

    );

  }

  if(
    memory.content
  ){

    lines.push(

      `Content: ${compressMemoryContent(
        memory.content
      )}`

    );

  }

  if(

    Array.isArray(
      memory.tags
    )

    &&

    memory.tags.length > 0

  ){

    const limitedTags =

      memory.tags
      .slice(

        0,

        MEMORY_CONTEXT_CONFIG
        .MAX_TAGS

      )
      .map((tag) => {

        return sanitizeContextText(
          tag
        );

      })
      .filter(Boolean);

    if(
      limitedTags.length > 0
    ){

      lines.push(

        `Tags: ${limitedTags.join(", ")}`

      );

    }

  }

  lines.push(

    `Priority: ${sanitizeContextText(
      memory.priority || "normal"
    )}`

  );

  lines.push(

    `State: ${sanitizeContextText(
      memory.state || "active"
    )}`

  );

  return lines.join("\n");

}



// =====================================
// DEDUPLICATION
// =====================================

function deduplicateContextMemories(
  memories = []
){

  const seenIds =
  new Set();

  return memories.filter((memory) => {

    const normalizedId =
    normalizeMemoryString(
      memory?.id
    );

    if(
      !normalizedId
    ){

      return false;

    }

    if(
      seenIds.has(
        normalizedId
      )
    ){

      return false;

    }

    seenIds.add(
      normalizedId
    );

    return true;

  });

}



function deduplicateContextSections(
  sections = []
){

  const uniqueSections =
  new Set();

  return sections.filter((section) => {

    const normalized =
    sanitizeContextText(
      section
    );

    if(
      !normalized
    ){

      return false;

    }

    if(
      uniqueSections.has(
        normalized
      )
    ){

      return false;

    }

    uniqueSections.add(
      normalized
    );

    return true;

  });

}



// =====================================
// BUILD RELEVANT CONTEXT
// =====================================

function buildRelevantContext(
  query,
  options = {}
){

  const limit =
  clampContextLimit(
    options.limit
  );

  if(

    typeof advancedMemorySearch !==
    "function"

  ){

    return [];

  }

  const searchResults =
  advancedMemorySearch(
    query,
    {
      limit,
      includeArchived:
      options.includeArchived
    }
  );

  const memories =
  searchResults
  .map((result) => {

    return result?.memory;

  })
  .filter(Boolean);

  return deduplicateContextMemories(

    memories.filter((memory) => {

      return isContextEligibleMemory(
        memory,
        options
      );

    })

  )
  .slice(0,limit);

}



// =====================================
// CONTEXT TRIMMING
// =====================================

function trimContextLength(
  context
){

  return safelyTruncateText(

    context,

    MEMORY_CONTEXT_CONFIG
    .MAX_CONTEXT_LENGTH

  );

}



// =====================================
// BUILD MEMORY CONTEXT
// =====================================

function buildMemoryContext(
  query,
  options = {}
){

  const memories =
  buildRelevantContext(
    query,
    options
  );

  const blocks = [];

  let currentLength = 0;

  memories.forEach((memory) => {

    const block =
    buildMemoryContextBlock(
      memory
    );

    if(!block){

      return;
    }

    const separatorLength =
    blocks.length > 0
      ? 2
      : 0;

    const nextLength =

      currentLength +

      separatorLength +

      block.length;

    if(

      nextLength >

      MEMORY_CONTEXT_CONFIG
      .MAX_CONTEXT_LENGTH

    ){

      return;
    }

    currentLength =
    nextLength;

    blocks.push(
      block
    );

  });

  return trimContextLength(

    blocks.join(
      "\n\n"
    )

  );

}



// =====================================
// BUILD CONVERSATION CONTEXT
// =====================================

function buildConversationContext(
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

  const limit =
  clampContextLimit(
    options.limit
  );

  const trimmedMessages =
  messages.slice(
    -limit
  );

  const lines = [];

  let currentLength = 0;

  trimmedMessages
  .forEach((message) => {

    if(
      !message
    ){

      return;
    }

    const role =
    sanitizeConversationRole(
      message.role
    );

    const content =
    compressMemoryContent(
      message.content
    );

    if(
      !content
    ){

      return;
    }

    const line =
    `${role}: ${content}`;

    const separatorLength =
    lines.length > 0
      ? 1
      : 0;

    const nextLength =

      currentLength +

      separatorLength +

      line.length;

    if(

      nextLength >

      MEMORY_CONTEXT_CONFIG
      .MAX_CONTEXT_LENGTH

    ){

      return;
    }

    currentLength =
    nextLength;

    lines.push(
      line
    );

  });

  return trimContextLength(

    lines.join("\n")

  );

}



// =====================================
// BUILD SYSTEM CONTEXT
// =====================================

function buildSystemContext(){

  if(

    !MEMORY_DEBUG
    ?.ENABLE_LOGS

  ){

    return "";

  }

  if(

    typeof getMemoryDiagnostics !==
    "function"

  ){

    return "";

  }

  const diagnostics =
  getMemoryDiagnostics();

  return trimContextLength(

    [

      "Memory System Status:",

      `Initialized: ${diagnostics.initialized}`,

      `Corrupted: ${diagnostics.corrupted}`,

      `Total Memories: ${diagnostics.totalMemories}`,

      `Indexed Memories: ${diagnostics.indexedMemories}`,

      `Dirty Memories: ${diagnostics.dirtyMemories}`,

      `Corrupted Memories: ${diagnostics.corruptedMemories}`

    ]
    .join("\n")

  );

}



// =====================================
// BUILD FULL AI CONTEXT
// =====================================

function buildFullAIContext(
  query,
  conversationMessages = [],
  options = {}
){

  const memoryContext =
  buildMemoryContext(
    query,
    options
  );

  const conversationContext =
  buildConversationContext(
    conversationMessages,
    options
  );

  const systemContext =
  buildSystemContext();

  let sections = [];

  if(
    systemContext
  ){

    sections.push(

      formatContextSection(
        "SYSTEM CONTEXT",
        systemContext
      )

    );

  }

  if(
    memoryContext
  ){

    sections.push(

      formatContextSection(
        "MEMORY CONTEXT",
        memoryContext
      )

    );

  }

  if(
    conversationContext
  ){

    sections.push(

      formatContextSection(
        "CONVERSATION CONTEXT",
        conversationContext
      )

    );

  }

  sections =
  deduplicateContextSections(
    sections
  );

  return trimContextLength(

    sections.join("\n\n")

  );

}
