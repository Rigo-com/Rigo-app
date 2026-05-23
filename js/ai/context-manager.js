// =====================================
// RIGO AI
// CONTEXT MANAGER
// ENTERPRISE AI ORCHESTRATION FINAL
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

  ENABLE_DIAGNOSTICS:true,

  MAX_CONTEXTS:
  1000,

  MAX_CONTEXT_ITEMS:
  500,

  MAX_CONTEXT_TOKENS:
  12000,

  MAX_SESSION_CONTEXTS:
  100,

  MAX_RUNTIME_CONTEXTS:
  200,

  MAX_CONTEXT_AGE:
  1000 * 60 * 60 * 24,

  COMPRESSION_PREVIEW_LENGTH:
  500

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
// CONTEXT EVENTS
// =====================================

const CONTEXT_EVENTS =
Object.freeze({

  CREATED:
  "context.created",

  UPDATED:
  "context.updated",

  REMOVED:
  "context.removed",

  COMPRESSED:
  "context.compressed",

  RANKED:
  "context.ranked",

  SYNCHRONIZED:
  "context.synchronized"

});



// =====================================
// CONTEXT STATE
// =====================================

const contextManagerState =
Object.seal({

  initialized:false,

  initializing:false,

  contexts:
  new Map(),

  sessions:
  new Map(),

  runtimeContexts:
  new Map(),

  sharedContexts:
  new Map(),

  diagnostics:{

    created:0,

    updated:0,

    removed:0,

    compressed:0,

    ranked:0,

    synchronized:0,

    evicted:0

  },

  lastUpdatedAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeContextId(
  contextId
){

  return String(
    contextId || ""
  )
  .trim()
  .toLowerCase();

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

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeContextObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



function cloneContextDiagnostics(){

  return freezeContextObject({

    ...contextManagerState
    .diagnostics

  });

}



function estimateContextTokens(
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



function createCompressionPreview(
  serialized
){

  if(
    typeof serialized !==
    "string"
  ){

    return "";
  }

  return serialized
  .slice(

    0,

    CONTEXT_MANAGER_CONFIG
    .COMPRESSION_PREVIEW_LENGTH

  )
  .trim();

}



function cleanupOrphanSessionReferences(
  contextId
){

  for(

    const sessionSet

    of

    contextManagerState
    .sessions
    .values()

  ){

    sessionSet.delete(
      contextId
    );

  }

}



function evictOldContexts(){

  const now =
  Date.now();

  for(

    const [

      contextId,
      context

    ]

    of

    contextManagerState
    .contexts

  ){

    const age =
    now -
    context.updatedAt;

    if(

      age >

      CONTEXT_MANAGER_CONFIG
      .MAX_CONTEXT_AGE

    ){

      contextManagerState
      .contexts
      .delete(
        contextId
      );

      cleanupOrphanSessionReferences(
        contextId
      );

      contextManagerState
      .diagnostics
      .evicted++;

    }

  }

}



async function emitContextEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      {

        source:"context-manager",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// CREATE CONTEXT
// =====================================

function createContextObject(
  config = {}
){

  const contextId =
  normalizeContextId(

    config.id ||

    createMemoryId()

  );

  return freezeContextObject({

    id:
    contextId,

    type:

      config.type ||

      CONTEXT_TYPES
      .RUNTIME,

    priority:

      Number(
        config.priority
      ) || 1,

    score:0,

    tokens:0,

    content:

      freezeContextObject(

        config.content ||
        {}

      ),

    metadata:

      freezeContextObject(

        config.metadata ||
        {}

      ),

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

  evictOldContexts();

  if(

    contextManagerState
    .contexts
    .size >=

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXTS

  ){

    return false;

  }

  const context =
  createContextObject(
    config
  );

  if(

    contextManagerState
    .contexts
    .has(
      context.id
    )

  ){

    return false;

  }

  context.tokens =
  estimateContextTokens(
    context.content
  );

  contextManagerState
  .contexts
  .set(
    context.id,
    freezeContextObject(
      context
    )
  );

  contextManagerState
  .diagnostics
  .created++;

  contextManagerState
  .lastUpdatedAt =
  Date.now();

  await emitContextEvent(

    CONTEXT_EVENTS
    .CREATED,

    {

      contextId:
      context.id

    }

  );

  return freezeContextObject(
    context
  );

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

  const context =

    contextManagerState
    .contexts
    .get(
      normalizedId
    );

  if(!context){

    return false;

  }

  const updatedContext =
  freezeContextObject({

    ...context,

    content:
    freezeContextObject({

      ...context.content,

      ...updates.content

    }),

    metadata:
    freezeContextObject({

      ...context.metadata,

      ...updates.metadata

    }),

    priority:

      Number(
        updates.priority
      )

      ||

      context.priority,

    updatedAt:
    Date.now()

  });

  updatedContext.tokens =
  estimateContextTokens(
    updatedContext.content
  );

  contextManagerState
  .contexts
  .set(

    normalizedId,

    freezeContextObject(
      updatedContext
    )

  );

  contextManagerState
  .diagnostics
  .updated++;

  contextManagerState
  .lastUpdatedAt =
  Date.now();

  await emitContextEvent(

    CONTEXT_EVENTS
    .UPDATED,

    {

      contextId:
      normalizedId

    }

  );

  return true;

}



// =====================================
// CONTEXT RANKING
// =====================================

function calculateContextScore(
  context,
  query = ""
){

  let score = 0;



  // ===================================
  // PRIORITY
  // ===================================

  score +=
  context.priority * 10;



  // ===================================
  // RECENCY
  // ===================================

  const age =

    Date.now() -

    context.updatedAt;

  score += Math.max(

    0,

    100 -

    Math.floor(
      age / 60000
    )

  );



  // ===================================
  // QUERY MATCH
  // ===================================

  try{

    const serialized =
    JSON.stringify(
      context.content
    )
    .toLowerCase();

    if(

      serialized.includes(

        String(query)
        .toLowerCase()

      )

    ){

      score += 50;

    }

  }

  catch(error){

    score += 0;

  }

  return score;

}



// =====================================
// RANK CONTEXTS
// =====================================

async function rankContexts(
  query = ""
){

  evictOldContexts();

  const ranked = [

    ...contextManagerState
    .contexts
    .values()

  ]
  .map((context) => {

    const score =
    calculateContextScore(

      context,

      query

    );

    return freezeContextObject({

      ...context,

      score

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

  await emitContextEvent(

    CONTEXT_EVENTS
    .RANKED,

    {

      query

    }

  );

  return ranked;

}



// =====================================
// COMPRESS CONTEXT
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

  const serialized =
  JSON.stringify(
    context.content
  );

  if(

    estimateContextTokens(
      context.content
    ) <=

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXT_TOKENS

  ){

    return true;

  }

  const compressedContent =
  freezeContextObject({

    compressed:true,

    preview:
    createCompressionPreview(
      serialized
    ),

    originalTokens:
    context.tokens

  });

  const compressedContext =
  freezeContextObject({

    ...context,

    content:
    compressedContent,

    tokens:
    estimateContextTokens(
      compressedContent
    ),

    updatedAt:
    Date.now()

  });

  contextManagerState
  .contexts
  .set(

    normalizedId,

    compressedContext

  );

  contextManagerState
  .diagnostics
  .compressed++;

  await emitContextEvent(

    CONTEXT_EVENTS
    .COMPRESSED,

    {

      contextId:
      normalizedId

    }

  );

  return true;

}



// =====================================
// SESSION CONTEXT
// =====================================

async function attachSessionContext(
  sessionId,
  contextId
){

  const normalizedSession =
  normalizeContextId(
    sessionId
  );

  const normalizedContext =
  normalizeContextId(
    contextId
  );

  if(

    !contextManagerState
    .contexts
    .has(
      normalizedContext
    )

  ){

    return false;

  }

  if(

    !contextManagerState
    .sessions
    .has(
      normalizedSession
    )

  ){

    contextManagerState
    .sessions
    .set(

      normalizedSession,

      new Set()

    );

  }

  const sessionContexts =

    contextManagerState
    .sessions
    .get(
      normalizedSession
    );

  if(

    sessionContexts.size >=

    CONTEXT_MANAGER_CONFIG
    .MAX_SESSION_CONTEXTS

  ){

    return false;

  }

  sessionContexts.add(
    normalizedContext
  );

  contextManagerState
  .diagnostics
  .synchronized++;

  await emitContextEvent(

    CONTEXT_EVENTS
    .SYNCHRONIZED,

    {

      sessionId:
      normalizedSession,

      contextId:
      normalizedContext

    }

  );

  return true;

}



// =====================================
// BUILD CONTEXT WINDOW
// =====================================

async function buildContextWindow(
  query = "",
  options = {}
){

  const ranked =
  await rankContexts(
    query
  );

  const maxTokens =

    Number(
      options.maxTokens
    )

    ||

    CONTEXT_MANAGER_CONFIG
    .MAX_CONTEXT_TOKENS;

  const windowContexts = [];

  let totalTokens = 0;

  for(
    const context
    of ranked
  ){

    if(

      (
        totalTokens +
        context.tokens
      ) >

      maxTokens

    ){

      break;

    }

    windowContexts.push(
      freezeContextObject(
        context
      )
    );

    totalTokens +=
    context.tokens;

  }

  return freezeContextObject({

    query,

    totalContexts:

      windowContexts
      .length,

    totalTokens,

    contexts:
    windowContexts,

    createdAt:
    Date.now()

  });

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

  cleanupOrphanSessionReferences(
    normalizedId
  );

  contextManagerState
  .diagnostics
  .removed++;

  await emitContextEvent(

    CONTEXT_EVENTS
    .REMOVED,

    {

      contextId:
      normalizedId

    }

  );

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

    runtimeContexts:

      contextManagerState
      .runtimeContexts
      .size,

    sharedContexts:

      contextManagerState
      .sharedContexts
      .size,

    diagnostics:
    cloneContextDiagnostics(),

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
  .diagnostics = {

    created:0,

    updated:0,

    removed:0,

    compressed:0,

    ranked:0,

    synchronized:0,

    evicted:0

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
    .initializing
  ){

    return false;

  }

  contextManagerState
  .initializing =
  true;

  try{

    evictOldContexts();

    contextManagerState
    .initialized =
    true;

    return true;

  }

  finally{

    contextManagerState
    .initializing =
    false;

  }

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

  attachSession:
  attachSessionContext,

  buildWindow:
  buildContextWindow,

  diagnostics:
  getContextDiagnostics,

  reset:
  resetContextManager

});
