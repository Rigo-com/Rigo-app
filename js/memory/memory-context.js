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
// CONTEXT HELPERS
// =====================================

function normalizeContextQuery(
  query
){

  return normalizeMemoryContent(
    query
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
      numericLimit
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

  return text

  .replace(
    /ignore\s+previous\s+instructions/gi,
    ""
  )

  .replace(
    /disregard\s+all\s+prior\s+messages/gi,
    ""
  )

  .replace(
    /system\s*prompt/gi,
    ""
  )

  .replace(
    /developer\s*message/gi,
    ""
  )

  .replace(
    /assistant\s*:/gi,
    ""
  )

  .replace(
    /system\s*:/gi,
    ""
  )

  .replace(
    /developer\s*:/gi,
    ""
  )

  .replace(
    /tool\s*:/gi,
    ""
  )

  .replace(
    /function_call/gi,
    ""
  )

  .replace(
    /you\s+are\s+chatgpt/gi,
    ""
  )

  .replace(
    /<\s*system\s*>/gi,
    ""
  )

  .replace(
    /<\s*assistant\s*>/gi,
    ""
  )

  .replace(
    /<\s*developer\s*>/gi,
    ""
  )

  .replace(
    /```system/gi,
    ""
  )

  .replace(
    /```assistant/gi,
    ""
  );

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
  // NORMALIZE SPACES/TABS ONLY
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
  // REMOVE PROMPT LABELS
  // ===============================

  .replace(
    /\[\s*(SYSTEM|USER|ASSISTANT)\s*CONTEXT\s*\]/gi,
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

  const allowedRoles = [

    "user",

    "assistant",

    "system"

  ];

  if(

    allowedRoles.includes(
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

  if(
    normalizedText.length <=
    maxLength
  ){

    return normalizedText;

  }

  const safeLength =

    maxLength -

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

  if(!memory){

    return false;

  }

  if(

    memoryState.tracking
    .corruptedIds
    .has(memory.id)

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

  if(!memory){

    return 0;

  }

  let score = 0;

  const searchableText = [

    normalizeMemoryContent(
      memory.title
    ),

    normalizeMemoryContent(
      memory.summary
    ),

    normalizeMemoryContent(
      memory.content
    ),

    ...(Array.isArray(memory.tags)
      ? memory.tags
      : [])

  ]
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
    .tracking
    .pinnedMemoryIds
    .has(memory.id)

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

      });

    lines.push(

      `Tags: ${limitedTags.join(", ")}`

    );

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

    if(
      !memory?.id
    ){

      return false;

    }

    if(
      seenIds.has(
        memory.id
      )
    ){

      return false;

    }

    seenIds.add(
      memory.id
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
  searchResults.map((result) => {

    return result.memory;

  });

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

    const nextLength =

      currentLength +

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

  const context =

    blocks.join(
      "\n\n"
    );

  return trimContextLength(
    context
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

    const nextLength =

      currentLength +

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
