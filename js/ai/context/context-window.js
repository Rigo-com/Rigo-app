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
  createCompressionPreview
}
from "./context-utils.js";

import {
  readContextCache,
  writeContextCache
}
from "./context-cache.js";

import {
  updateContext
}
from "./context-store.js";

import {
  searchContextIndex
}
from "./context-indexer.js";



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

    return {

      ...safeClone(context),

      score:
      calculateContextScore(
        context,
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

    contexts.push(
      context
    );

    totalTokens +=
    context.tokens;

  }

  const windowObject =
  freezeContextObject({

    query,

    namespace,

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

    windowObject,

    namespace

  );

  return windowObject;

}



// =====================================
// COMPRESSION
// =====================================

export async function compressContext(
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

  contextManagerState
  .diagnostics
  .compressed++;

  return updateContext(

    normalizedId,

    {

      content:{

        compressed:true,

        preview:
        createCompressionPreview(
          serialized,
          CONTEXT_MANAGER_CONFIG
          .COMPRESSION_PREVIEW_LENGTH
        ),

        originalTokens:
        context.tokens

      }

    }

  );

}
