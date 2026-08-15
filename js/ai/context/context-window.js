// =====================================
// RIGO AI
// CONTEXT WINDOW
// =====================================

import {
  CONTEXT_MANAGER_CONFIG
}
from "./context-config.js";

import {
  contextManagerState
}
from "./context-state.js";

import {
  normalizeContextId,
  safeClone,
  freezeContextObject,
  serializeContext,
  createCompressionPreview,
  estimateTokens
}
from "./context-utils.js";

import {
  readContextCache,
  writeContextCache
}
from "./context-cache.js";

import {
  searchContextIndex
}
from "./context-indexer.js";

import {
  touchContext
}
from "./context-store.js";



// =====================================
// RANKING
// =====================================

export function calculateContextScore(
  context,
  query = "",
  indexMatches = 0
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

  if(
    query &&
    context.searchableText
    .includes(query)
  ){

    score += 50;

  }

  score +=
  Number(indexMatches) * 25;

  return score;

}



export async function rankContexts(
  query = "",
  options = {}
){

  const normalizedQuery =
  normalizeContextId(query);

  const contexts = [

    ...contextManagerState
    .contexts
    .values()

  ];

  const namespace =
  normalizeContextId(
    options.namespace ||
    "runtime:default"
  );

  const indexedMatches =
  searchContextIndex(
    normalizedQuery
  );

  const namespaceContexts =
  contexts
  .filter((context) => {

    return normalizeContextId(
      context.namespace
    ) === namespace;

  });

  const hasIndexedMatches =
  namespaceContexts
  .some((context) => {

    return indexedMatches.has(
      context.id
    );

  });

  const ranked =
  namespaceContexts
  .filter((context) => {

    return (
      !hasIndexedMatches ||
      indexedMatches.has(
        context.id
      )
    );

  })
  .map((context) => {

    const accessedContext =
    touchContext(context.id) ||
    context;

    return {

      ...safeClone(accessedContext),

      score:
      calculateContextScore(
        accessedContext,
        normalizedQuery,
        indexedMatches.get(
          context.id
        ) || 0
      )

    };

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
// WINDOW
// =====================================

export async function buildContextWindow(
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

  const namespace =
  normalizeContextId(
    options.namespace ||
    "runtime:default"
  );

  const cached =
  readContextCache(
    query,
    maxTokens,
    namespace
  );

  if(cached){

    cached.contexts
    .forEach((context) => {
      touchContext(context.id);
    });

    return cached;

  }

  const ranked =
  await rankContexts(
    query,
    {
      namespace
    }
  );

  const contexts = [];

  let totalTokens = 0;

  let compressedContexts = 0;

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

    const remainingTokens =
    maxTokens - totalTokens;

    let selectedContext =
    context;

    if(
      context.tokens >
      remainingTokens
    ){

      if(
        !CONTEXT_MANAGER_CONFIG
        .ENABLE_CONTEXT_COMPRESSION
      ){
        continue;
      }

      selectedContext =
      createCompressedContextSnapshot(
        context,
        remainingTokens
      );

      if(!selectedContext){
        continue;
      }

      compressedContexts++;

    }

    contexts.push(
      selectedContext
    );

    totalTokens +=
    selectedContext.tokens;

  }

  const windowObject =
  freezeContextObject({

    query,

    namespace,

    totalContexts:
    contexts.length,

    totalTokens,

    compressedContexts,

    contexts,

    createdAt:
    Date.now()

  });

  writeContextCache(

    query,

    maxTokens,

    windowObject,

    namespace

  );

  return windowObject;

}



// =====================================
// COMPRESSION
// =====================================

export function createCompressedContextSnapshot(
  context,
  targetTokens
){

  const tokenLimit =
  Math.floor(
    Number(targetTokens) || 0
  );

  if(tokenLimit <= 20){
    return null;
  }

  if(context.tokens <= tokenLimit){
    return freezeContextObject(
      safeClone(context)
    );
  }

  const serialized =
  serializeContext(
    context.content
  );

  let previewLength =
  Math.min(
    CONTEXT_MANAGER_CONFIG
    .COMPRESSION_PREVIEW_LENGTH,
    Math.max(
      16,
      tokenLimit * 4 - 160
    )
  );

  while(previewLength >= 16){

    const content = {
      compressed:true,
      preview:
      createCompressionPreview(
        serialized,
        previewLength
      ),
      originalTokens:
      context.tokens
    };

    const tokens =
    estimateTokens(
      content
    );

    if(tokens <= tokenLimit){

      contextManagerState
      .diagnostics
      .compressed++;

      return freezeContextObject({
        ...safeClone(context),
        tokens,
        content,
        metadata:{
          ...safeClone(context.metadata),
          transientCompression:true
        }
      });

    }

    previewLength =
    Math.floor(
      previewLength * 0.75
    );

  }

  return null;

}

export async function compressContext(
  contextId,
  targetTokens =
  CONTEXT_MANAGER_CONFIG.MAX_CONTEXT_TOKENS
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

  return createCompressedContextSnapshot(
    context,
    targetTokens
  );

}
