// =====================================
// RIGO AI
// CONTEXT MANAGER
// ENTERPRISE CONTEXT ORCHESTRATION ENGINE
// FINAL STABLE EDITION
// =====================================



// =====================================
// CONTEXT CONFIG
// =====================================

const CONTEXT_MANAGER_CONFIG =
Object.freeze({

  ENABLE_CONTEXT_MEMORY:true,

  ENABLE_CONTEXT_RANKING:true,

  ENABLE_CONTEXT_COMPRESSION:true,

  ENABLE_SHARED_CONTEXT:true,

  ENABLE_SESSION_CONTEXT:true,

  ENABLE_RUNTIME_CONTEXT:true,

  ENABLE_CONTEXT_CACHE:true,

  ENABLE_INDEXING:true,

  ENABLE_AUTO_EVICTION:true,

  ENABLE_DIAGNOSTICS:true,

  MAX_CONTEXTS:1000,

  MAX_CONTEXT_ITEMS:500,

  MAX_CONTEXT_TOKENS:12000,

  MAX_WINDOW_CONTEXTS:50,

  MAX_SESSION_CONTEXTS:100,

  MAX_RUNTIME_CONTEXTS:200,

  MAX_CONTEXT_AGE:
  1000 * 60 * 60 * 24,

  MAX_CONTENT_SIZE:100000,

  MAX_QUERY_LENGTH:500,

  MAX_CACHE_ITEMS:300,

  MAX_INDEX_SIZE:5000,

  EVICTION_INTERVAL:
  1000 * 60 * 5,

  COMPRESSION_PREVIEW_LENGTH:500

});



// =====================================
// CONTEXT TYPES
// =====================================

const CONTEXT_TYPES =
Object.freeze({

  MEMORY:"memory",

  SESSION:"session",

  RUNTIME:"runtime",

  AGENT:"agent",

  SHARED:"shared",

  SYSTEM:"system"

});



// =====================================
// CONTEXT STATE
// =====================================

const contextManagerState =
Object.seal({

  initialized:false,

  initializing:false,

  startupPromise:null,

  contexts:
  new Map(),

  sessions:
  new Map(),

  runtimeContexts:
  new Map(),

  sharedContexts:
  new Map(),

  indexes:
  new Map(),

  retrievalCache:
  new Map(),

  evictionTimer:null,

  diagnostics:{

    created:0,

    updated:0,

    removed:0,

    compressed:0,

    ranked:0,

    synchronized:0,

    cacheHits:0,

    cacheMisses:0,

    indexed:0,

    evicted:0,

    rejected:0

  },

  lastUpdatedAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeContextId(
  value
){

  return String(
    value || ""
  )
  .trim()
  .toLowerCase();

}



function createContextId(){

  return (

    "ctx_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function safeClone(
  value
){

  try{

    return JSON.parse(
      JSON.stringify(value)
    );

  }

  catch(error){

    return {};

  }

}



function freezeContextObject(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    freezeContextObject(
      nestedValue,
      visited
    );

  });

  return value;

}



function estimateTokens(
  value
){

  try{

    return Math.ceil(

      JSON.stringify(value)
      .length / 4

    );

  }

  catch(error){

    return 0;

  }

}



function serializeContext(
  value
){

  try{

    return JSON.stringify(value);

  }

  catch(error){

    return "";

  }

}



function createCompressionPreview(
  serialized
){

  return String(
    serialized || ""
  )
  .slice(

    0,

    CONTEXT_MANAGER_CONFIG
    .COMPRESSION_PREVIEW_LENGTH

  );

}



// =====================================
// CACHE
// =====================================

function createCacheKey(
  query,
  maxTokens
){

  return (

    normalizeContextId(query) +

    "::" +

    String(maxTokens)

  );

}



function readContextCache(
  query,
  maxTokens
){

  const key =
  createCacheKey(
    query,
    maxTokens
  );

  const cached =
  contextManagerState
  .retrievalCache
  .get(key);

  if(!cached){

    contextManagerState
    .diagnostics
    .cacheMisses++;

    return null;

  }

  contextManagerState
  .diagnostics
  .cacheHits++;

  return cached;

}



function writeContextCache(
  query,
  maxTokens,
  value
){

  const key =
  createCacheKey(
    query,
    maxTokens
  );

  contextManagerState
  .retrievalCache
  .set(
    key,
    value
  );

  while(

    contextManagerState
    .retrievalCache
    .size >

    CONTEXT_MANAGER_CONFIG
    .MAX_CACHE_ITEMS

  ){

    const firstKey =

      contextManagerState
      .retrievalCache
      .keys()
      .next()
      .value;

    contextManagerState
    .retrievalCache
    .delete(firstKey);

  }

}



// =====================================
// INDEXING
// =====================================

function tokenizeContextContent(
  value
){

  const serialized =
  serializeContext(value)
  .toLowerCase();

  return serialized

  .replace(/[^\w\s]/g," ")

  .split(/\s+/)

  .filter(Boolean)

  .slice(

    0,

    CONTEXT_MANAGER_CONFIG
    .MAX_INDEX_SIZE

  );

}



function indexContext(
  context
){

  if(

    !CONTEXT_MANAGER_CONFIG
    .ENABLE_INDEXING

  ){

    return true;

  }

  const tokens =
  tokenizeContextContent(
    context.content
  );

  tokens.forEach((token) => {

    if(

      !contextManagerState
      .indexes
      .has(token)

    ){

      contextManagerState
      .indexes
      .set(
        token,
        new Set()
      );

    }

    contextManagerState
    .indexes
    .get(token)
    .add(context.id);

  });

  contextManagerState
  .diagnostics
  .indexed++;

  return true;

}



function removeIndexedContext(
  contextId
){

  contextManagerState
  .indexes
  .forEach((set) => {

    set.delete(contextId);

  });

}



// =====================================
// CONTEXT OBJECT
// =====================================

function createContextObject(
  config = {}
){

  const content =
  safeClone(
    config.content || {}
  );

  const metadata =
  safeClone(
    config.metadata || {}
  );

  return freezeContextObject({

    id:
    normalizeContextId(

      config.id ||

      createContextId()

    ),

    type:

      config.type ||

      CONTEXT_TYPES
      .RUNTIME,

    priority:

      Number(
        config.priority
      ) || 1,

    score:0,

    tokens:
    estimateTokens(
      content
    ),

    content,

    metadata,

    createdAt:
    Date.now(),

    updatedAt:
    Date.now()

  });

}



// =====================================
// REGISTER CONTEXT
// =====================================

async function registerContext(
  config = {}
){

  if(

    contextManagerState
    .contexts
    .size >=

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXTS

  ){

    contextManagerState
    .diagnostics
    .rejected++;

    return false;

  }

  const context =
  createContextObject(
    config
  );

  if(

    context.tokens >

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXT_TOKENS

  ){

    contextManagerState
    .diagnostics
    .rejected++;

    return false;

  }

  contextManagerState
  .contexts
  .set(
    context.id,
    context
  );

  indexContext(context);

  contextManagerState
  .diagnostics
  .created++;

  contextManagerState
  .lastUpdatedAt =
  Date.now();

  return context;

}



// =====================================
// UPDATE CONTEXT
// =====================================

async function updateContext(
  contextId,
  updates = {}
){

  const normalizedId =
  normalizeContextId(
    contextId
  );

  const existing =
  contextManagerState
  .contexts
  .get(
    normalizedId
  );

  if(!existing){

    return false;

  }

  removeIndexedContext(
    normalizedId
  );

  const updated =
  createContextObject({

    ...safeClone(existing),

    ...safeClone(updates),

    id:normalizedId,

    updatedAt:
    Date.now()

  });

  contextManagerState
  .contexts
  .set(
    normalizedId,
    updated
  );

  indexContext(updated);

  contextManagerState
  .diagnostics
  .updated++;

  contextManagerState
  .lastUpdatedAt =
  Date.now();

  return true;

}



// =====================================
// REMOVE CONTEXT
// =====================================

async function removeContext(
  contextId
){

  const normalizedId =
  normalizeContextId(
    contextId
  );

  const removed =
  contextManagerState
  .contexts
  .delete(
    normalizedId
  );

  if(!removed){

    return false;

  }

  removeIndexedContext(
    normalizedId
  );

  contextManagerState
  .diagnostics
  .removed++;

  return true;

}



// =====================================
// RANKING
// =====================================

function calculateContextScore(
  context,
  query = ""
){

  let score = 0;

  score +=
  context.priority * 10;

  const age =
  Date.now() -
  context.updatedAt;

  score += Math.max(
    0,
    100 -
    Math.floor(age / 60000)
  );

  try{

    const normalizedQuery =
    normalizeContextId(query);

    if(!normalizedQuery){

      return score;

    }

    const serialized =
    serializeContext(
      context.content
    )
    .toLowerCase();

    if(
      serialized.includes(
        normalizedQuery
      )
    ){

      score += 50;

    }

  }

  catch(error){}

  return score;

}



async function rankContexts(
  query = ""
){

  const normalizedQuery =
  normalizeContextId(query);

  let candidateIds =
  new Set();

  if(normalizedQuery){

    const queryTokens =
    tokenizeContextContent(
      normalizedQuery
    );

    queryTokens.forEach((token) => {

      const indexed =
      contextManagerState
      .indexes
      .get(token);

      if(indexed){

        indexed.forEach((id) => {

          candidateIds.add(id);

        });

      }

    });

  }

  const contexts =

    candidateIds.size > 0

    ?

    [...candidateIds]
    .map((id) => {

      return contextManagerState
      .contexts
      .get(id);

    })
    .filter(Boolean)

    :

    [

      ...contextManagerState
      .contexts
      .values()

    ];

  const ranked =
  contexts
  .map((context) => {

    return freezeContextObject({

      ...safeClone(context),

      score:
      calculateContextScore(
        context,
        normalizedQuery
      )

    });

  })
  .sort((a,b) => {

    return (
      b.score -
      a.score
    );

  });

  contextManagerState
  .diagnostics
  .ranked++;

  return ranked;

}



// =====================================
// BUILD CONTEXT WINDOW
// =====================================

async function buildContextWindow(
  query = "",
  options = {}
){

  const maxTokens =

    Number(
      options.maxTokens
    )

    ||

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXT_TOKENS;

  const cached =
  readContextCache(
    query,
    maxTokens
  );

  if(cached){

    return cached;

  }

  const ranked =
  await rankContexts(
    query
  );

  const contexts = [];

  let totalTokens = 0;

  for(
    const context
    of ranked
  ){

    if(

      contexts.length >=

      CONTEXT_MANAGER_CONFIG
      .MAX_WINDOW_CONTEXTS

    ){

      break;

    }

    if(

      totalTokens +
      context.tokens >

      maxTokens

    ){

      continue;

    }

    contexts.push(context);

    totalTokens +=
    context.tokens;

  }

  const windowObject =
  freezeContextObject({

    query,

    totalContexts:
    contexts.length,

    totalTokens,

    contexts,

    createdAt:
    Date.now()

  });

  writeContextCache(

    query,

    maxTokens,

    windowObject

  );

  return windowObject;

}



// =====================================
// COMPRESSION
// =====================================

async function compressContext(
  contextId
){

  const normalizedId =
  normalizeContextId(
    contextId
  );

  const context =
  contextManagerState
  .contexts
  .get(
    normalizedId
  );

  if(!context){

    return false;

  }

  if(

    context.tokens <=

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXT_TOKENS

  ){

    return true;

  }

  const serialized =
  serializeContext(
    context.content
  );

  return updateContext(

    normalizedId,

    {

      content:{

        compressed:true,

        preview:
        createCompressionPreview(
          serialized
        ),

        originalTokens:
        context.tokens

      }

    }

  );

}



// =====================================
// EVICTION
// =====================================

function evictOldContexts(){

  const now =
  Date.now();

  contextManagerState
  .contexts
  .forEach((context,id) => {

    const age =
    now -
    context.updatedAt;

    if(

      age >

      CONTEXT_MANAGER_CONFIG
      .MAX_CONTEXT_AGE

    ){

      removeIndexedContext(id);

      contextManagerState
      .contexts
      .delete(id);

      contextManagerState
      .diagnostics
      .evicted++;

    }

  });

}



function startEvictionLoop(){

  if(
    contextManagerState
    .evictionTimer
  ){

    return true;

  }

  contextManagerState
  .evictionTimer =
  setInterval(() => {

    evictOldContexts();

  },

  CONTEXT_MANAGER_CONFIG
  .EVICTION_INTERVAL);

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getContextDiagnostics(){

  return freezeContextObject({

    initialized:
    contextManagerState
    .initialized,

    contexts:

      contextManagerState
      .contexts
      .size,

    sessions:

      contextManagerState
      .sessions
      .size,

    indexes:

      contextManagerState
      .indexes
      .size,

    cache:

      contextManagerState
      .retrievalCache
      .size,

    diagnostics:

      safeClone(

        contextManagerState
        .diagnostics

      ),

    lastUpdatedAt:
    contextManagerState
    .lastUpdatedAt

  });

}



// =====================================
// RESET
// =====================================

async function resetContextManager(){

  contextManagerState
  .contexts
  .clear();

  contextManagerState
  .sessions
  .clear();

  contextManagerState
  .runtimeContexts
  .clear();

  contextManagerState
  .sharedContexts
  .clear();

  contextManagerState
  .indexes
  .clear();

  contextManagerState
  .retrievalCache
  .clear();

  contextManagerState
  .diagnostics = {

    created:0,

    updated:0,

    removed:0,

    compressed:0,

    ranked:0,

    synchronized:0,

    cacheHits:0,

    cacheMisses:0,

    indexed:0,

    evicted:0,

    rejected:0

  };

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeContextManager(){

  if(
    contextManagerState
    .initialized
  ){

    return true;

  }

  if(
    contextManagerState
    .startupPromise
  ){

    return contextManagerState
    .startupPromise;

  }

  contextManagerState
  .startupPromise =

  (async() => {

    if(
      contextManagerState
      .initializing
    ){

      return false;

    }

    contextManagerState
    .initializing =
    true;

    try{

      startEvictionLoop();

      contextManagerState
      .initialized =
      true;

      contextManagerState
      .lastUpdatedAt =
      Date.now();

      if(
        typeof registerModule ===
        "function"
      ){

        await registerModule(

          "context-manager",

          async () => ContextManager

        );

      }

      return true;

    }

    finally{

      contextManagerState
      .initializing =
      false;

      contextManagerState
      .startupPromise =
      null;

    }

  })();

  return contextManagerState
  .startupPromise;

}



// =====================================
// SNAPSHOT
// =====================================

function createContextSnapshot(){

  return freezeContextObject({

    initialized:
    contextManagerState
    .initialized,

    contexts:

      contextManagerState
      .contexts
      .size,

    indexes:

      contextManagerState
      .indexes
      .size,

    cache:

      contextManagerState
      .retrievalCache
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// HEALTH REPORT
// =====================================

function getContextHealthReport(){

  return freezeContextObject({

    initialized:
    contextManagerState
    .initialized,

    healthy:

      contextManagerState
      .contexts
      .size <=

      CONTEXT_MANAGER_CONFIG
      .MAX_CONTEXTS,

    contexts:

      contextManagerState
      .contexts
      .size,

    cache:

      contextManagerState
      .retrievalCache
      .size,

    indexes:

      contextManagerState
      .indexes
      .size,

    diagnostics:
    getContextDiagnostics(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const ContextManager =
Object.freeze({

  initialize:
  initializeContextManager,

  register:
  registerContext,

  update:
  updateContext,

  remove:
  removeContext,

  rank:
  rankContexts,

  compress:
  compressContext,

  buildWindow:
  buildContextWindow,

  diagnostics:
  getContextDiagnostics,

  health:
  getContextHealthReport,

  snapshot:
  createContextSnapshot,

  reset:
  resetContextManager

});
