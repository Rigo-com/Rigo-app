// =====================================
// RIGO AI
// CONTEXT INJECTION
// =====================================

import { contextManagerState }
from "./context-state.js";

import { buildContextWindow }
from "./context-window.js";



export async function injectContext(
  request = {},
  options = {}
){
  if(
    !contextManagerState.initialized ||
    contextManagerState.shuttingDown
  ){
    return request;
  }

  const input = request.input || {};
  const metadata = request.metadata || {};
  const query = String(
    options.query ||
    input.query ||
    input.message ||
    input.text ||
    metadata.query ||
    ""
  );

  const namespace = String(
    options.namespace ||
    metadata.namespace ||
    input.namespace ||
    "runtime:default"
  );

  const contextWindow = await buildContextWindow(
    query,
    {
      namespace,
      maxTokens:
      options.maxTokens ||
      metadata.maxContextTokens
    }
  );

  return {
    ...request,
    metadata:{
      ...metadata,
      contextWindow
    }
  };
}
