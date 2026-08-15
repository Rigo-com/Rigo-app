// =====================================
// RIGO AI
// CONTEXT INDEXER
// =====================================

import {
  CONTEXT_MANAGER_CONFIG
}
from "./context-config.js";

import {
  contextManagerState,
  incrementContextDiagnostic
}
from "./context-state.js";

import {
  createSearchableText
}
from "./context-utils.js";



export function tokenizeContextContent(
  value
){

  return createSearchableText(
    value
  )

  .replace(
    /[^\p{L}\p{N}_\s]/gu,
    " "
  )

  .split(/\s+/)

  .filter((token) => {

    return (
      token &&
      token.length > 1
    );

  })

  .slice(

    0,

    CONTEXT_MANAGER_CONFIG
    .MAX_INDEX_SIZE

  );

}


export function searchContextIndex(
  query = ""
){

  const matches =
  new Map();

  if(
    !CONTEXT_MANAGER_CONFIG
    .ENABLE_INDEXING
  ){

    return matches;

  }

  const tokens =
  new Set(
    tokenizeContextContent(
      query
    )
  );

  tokens.forEach((token) => {

    const contextIds =
    contextManagerState
    .indexes
    .get(token);

    contextIds
    ?.forEach((contextId) => {

      matches.set(
        contextId,
        (matches.get(contextId) || 0) + 1
      );

    });

  });

  incrementContextDiagnostic(
    "indexSearches"
  );

  if(matches.size > 0){
    incrementContextDiagnostic(
      "indexHits",
      matches.size
    );
  }
  else{
    incrementContextDiagnostic(
      "indexFallbacks"
    );
  }

  return matches;

}



export function indexContext(
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

  contextManagerState
  .contextTokens
  .set(
    context.id,
    new Set(tokens)
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
    .add(
      context.id
    );

  });

  incrementContextDiagnostic(
    "indexed"
  );

  return true;

}



export function removeIndexedContext(
  contextId
){

  const trackedTokens =

    contextManagerState
    .contextTokens
    .get(
      contextId
    );

  if(!trackedTokens){

    return true;

  }

  trackedTokens.forEach((token) => {

    const indexed =
    contextManagerState
    .indexes
    .get(token);

    if(!indexed){

      return;

    }

    indexed.delete(
      contextId
    );

    if(
      indexed.size <= 0
    ){

      contextManagerState
      .indexes
      .delete(token);

    }

  });

  contextManagerState
  .contextTokens
  .delete(
    contextId
  );

  return true;

}
