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



// =====================================
// RANKING
// =====================================

export function calculateContextScore(
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

  if(
    query &&
    context.searchableText
    .includes(query)
  ){

    score += 50;

  }

  return score;

}



export async function rankContexts(
  query = ""
){

  const normalizedQuery =
  normalizeContextId(query);

  const contexts = [

    ...contextManagerState
    .contexts
    .values()

  ];

  const ranked =
  contexts
  .map((context) => {

    return {

      ...safeClone(context),

      score:
      calculateContextScore(
        context,
        normalizedQuery
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
